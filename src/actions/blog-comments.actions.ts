"use server";

import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin-client";
import { sendSlackBlogCommentNotification } from "./slack.actions";
import { blogUrl } from "@/lib/urls";

// Everything these actions return is sent to the browser, so list the columns
// explicitly and never include the commenter's email.
const COMMENT_COLUMNS = `
  id, created_at, blog_id, parent_id, user_id, content, likes, is_approved,
  user:users(full_name, avatar_url)
`;

export interface BlogComment {
  id: number;
  created_at: string;
  blog_id: number;
  parent_id: number | null;
  user_id: string;
  content: string;
  likes: number;
  is_approved: boolean;
  user_has_liked?: boolean; // Indicates if the current viewer liked this comment
  // joined from users table
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: BlogComment[];
}

/**
 * Fetch all approved top-level comments (and nested replies) for a blog.
 * The viewer's likes come from their verified session, never from an argument,
 * so no one can read another user's likes through this public action.
 */
export async function getBlogComments(blogId: number): Promise<BlogComment[]> {
  const supabase = await createClient();

  // 1. Fetch the signed-in viewer's likes, if any
  const userLikedCommentIds = new Set<number>();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user.is_anonymous) {
    const { data: likes } = await getSupabaseAdminClient()
      .from("blogs_comment_likes")
      .select("comment_id")
      .eq("user_id", user.id);

    if (likes) {
      likes.forEach((like) => userLikedCommentIds.add(like.comment_id));
    }
  }

  // 2. Fetch the comments
  const { data, error } = await supabase
    .from("blogs_comments")
    .select(COMMENT_COLUMNS)
    .eq("blog_id", blogId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching blog comments:", error);
    return [];
  }

  const comments = (data ?? []) as unknown as BlogComment[];

  // Build nested structure & inject like state
  const topLevel: BlogComment[] = [];
  const byId: Record<number, BlogComment> = {};

  for (const c of comments) {
    byId[c.id] = { 
      ...c, 
      user_has_liked: userLikedCommentIds.has(c.id), 
      replies: [] 
    };
  }
  for (const c of comments) {
    if (c.parent_id == null) {
      topLevel.push(byId[c.id]);
    } else if (byId[c.parent_id]) {
      byId[c.parent_id].replies!.push(byId[c.id]);
    }
  }

  return topLevel;
}

/** Add a new comment / reply */
export async function addBlogComment(payload: {
  blog_id: number;
  content: string;
  parent_id?: number | null;
}): Promise<{ success: boolean; error?: string; data?: BlogComment }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return { success: false, error: "You must be logged in to comment." };
  }

  const { data, error } = await supabase
    .from("blogs_comments")
    .insert({
      blog_id: payload.blog_id,
      content: payload.content.trim(),
      parent_id: payload.parent_id ?? null,
      user_id: user.id,
    })
    .select(COMMENT_COLUMNS)
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: error.message };
  }

  const comment = data as unknown as BlogComment;

  // --- TRIGGER SLACK NOTIFICATION ---
  // The email comes from the verified session and only goes to Slack.
  sendSlackBlogCommentNotification({
    userName: comment.user?.full_name || user.user_metadata?.full_name || "Anonymous",
    userEmail: user.email || "",
    comment: payload.content,
    blogId: payload.blog_id,
    parentId: payload.parent_id,
  }).catch((e) => console.error("Failed to send Slack blog notification:", e));

  // --- TRIGGER EMAIL IF THIS IS A REPLY ---
  if (comment.parent_id) {
    // Catch errors so we don't fail the comment creation if email fails
    sendReplyEmailBackground(comment.parent_id, comment, user.id, payload.blog_id).catch((e) =>
      console.error("Failed to send reply email:", e)
    );
  }

  return { success: true, data: comment };
}

// Helper function to send the email natively without webhooks
async function sendReplyEmailBackground(
  parentId: number,
  newComment: BlogComment,
  replierId: string,
  blogId: number
) {
  try {
    const { Resend } = await import("resend");
    const { render } = await import("@react-email/render");
    const { CommentReplyEmail } = await import("@/components/emails/triggers/comment-reply");

    // Must use Admin client to bypass RLS and fetch the parent user's private
    // email. It stays on the server: nothing here is returned to the caller.
    const supabaseAdmin = getSupabaseAdminClient();
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 1. Get Parent Comment
    const { data: parentComment, error: parentError } = await supabaseAdmin
      .from("blogs_comments")
      .select("user_id, content")
      .eq("id", parentId)
      .single();

    if (parentError || !parentComment) return;

    // Prevent recursive emails if they reply to themselves
    if (parentComment.user_id === replierId) return;

    // 2. Look up Parent User Email
    const { data: parentUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("email, full_name, avatar_url")
      .eq("id", parentComment.user_id)
      .single();

    if (userError || !parentUser?.email) return;

    // 3. Look up Replier's Name
    const { data: replierUser } = await supabaseAdmin
      .from("users")
      .select("full_name, avatar_url")
      .eq("id", replierId)
      .single();

    const replierName = replierUser?.full_name || "Someone";

    // 4. Look up Blog Post details for the link
    const { data: blog, error: blogError } = await supabaseAdmin
      .from("blogs")
      .select("title, slug")
      .eq("id", blogId)
      .single();

    if (blogError || !blog) return;

    const threadUrl = blogUrl(`/${blog.slug}`);
    const emailSubject = `New reply from ${replierName} on "${blog.title}"`;

    // 5. Generate Email HTML via React-Email
    const emailHtml = await render(
      CommentReplyEmail({
        parentUserName: parentUser.full_name || "there",
        parentUserAvatar: parentUser.avatar_url || "",
        replierName: replierName,
        replierAvatar: replierUser?.avatar_url || "",
        blogTitle: blog.title || "our blog",
        parentCommentContent: parentComment.content,
        replyContent: newComment.content,
        threadUrl: threadUrl,
      })
    );

    // 6. Send the Email
    await resend.emails.send({
      from: "Build Fast with AI <sanjeev@buildfastwithai.com>",
      to: parentUser.email,
      subject: emailSubject,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Error in background email task:", error);
  }
}


/** Delete a comment (only by the owner) */
export async function deleteBlogComment(
  commentId: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("blogs_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Toggle like on a comment */
export async function toggleBlogCommentLike(
  commentId: number,
  shouldLike: boolean
): Promise<{ success: boolean; likes?: number; liked?: boolean; error?: string }> {
  const supabase = await createClient();

  // First, verify the user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be logged in to like a comment." };
  }

  const supabaseAdmin = getSupabaseAdminClient();

  if (shouldLike) {
    // Insert into blogs_comment_likes
    const { error: insertError } = await supabaseAdmin
      .from("blogs_comment_likes")
      .insert({ comment_id: commentId, user_id: user.id });
    
    // Ignore duplicate key error (23505) if they somehow already liked it
    if (insertError && insertError.code !== '23505') {
      console.error("Error inserting like record:", insertError);
      return { success: false, error: insertError.message };
    }
  } else {
    // Delete from blogs_comment_likes
    const { error: deleteError } = await supabaseAdmin
      .from("blogs_comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", user.id);
    
    if (deleteError) {
      console.error("Error deleting like record:", deleteError);
      return { success: false, error: deleteError.message };
    }
  }

  // Count exactly how many likes this comment has from the source of truth
  const { count, error: countError } = await supabaseAdmin
    .from("blogs_comment_likes")
    .select("id", { count: 'exact', head: true })
    .eq("comment_id", commentId);

  if (countError) {
    console.error("Error counting likes:", countError);
    return { success: false, error: countError.message };
  }

  const actualLikes = count || 0;

  // Cache it onto the main blogs_comments table for fast reading
  const { error: updateError } = await supabaseAdmin
    .from("blogs_comments")
    .update({ likes: actualLikes })
    .eq("id", commentId);

  if (updateError) {
    console.error("Error updating cached likes:", updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true, likes: actualLikes, liked: shouldLike };
}
