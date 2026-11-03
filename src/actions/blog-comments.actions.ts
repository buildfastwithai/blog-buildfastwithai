"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin-client";
import { getSupabaseUrl } from "@/utils/supabase/keys";
import { MAX_COMMENT_LENGTH } from "@/lib/comments";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { notifySlackOfBlogComment } from "@/lib/slack";
import { blogUrl } from "@/lib/urls";

const HOUR = 60 * 60 * 1000;

// Rate limits are in-memory and per Lambda instance (see rate-limit.ts): they
// stop a single client looping, not a distributed flood.
const COMMENT_LIMITS = {
  perUserMinute: 5,
  perUserHour: 30,
  perIpMinute: 10,
  // Notifications are throttled on top of posting, so even a burst that gets
  // through can't flood Slack or someone's inbox.
  slackPerUserHour: 10,
  replyEmailsPerReplierHour: 10,
  replyEmailsPerRecipientHour: 5,
};

function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

/**
 * Avatar URLs come from user profiles, so only embed them in outgoing email
 * when they point at a host we expect (Google profile photos, our Supabase
 * storage, our own domains). Anything else gets the default avatar.
 */
function safeAvatarUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    const host = parsed.hostname.toLowerCase();
    const allowed =
      host.endsWith(".googleusercontent.com") ||
      host === new URL(getSupabaseUrl()).hostname ||
      host === "auth.buildfastwithai.com" ||
      host === "www.buildfastwithai.com";
    return allowed ? parsed.toString() : "";
  } catch {
    return "";
  }
}

/** One line, bounded: for names that end up in an email subject. */
function singleLine(text: string, max: number): string {
  return text.replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}

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

  // --- Validate input (this is a public endpoint; don't trust the client) ---
  const content =
    typeof payload?.content === "string" ? payload.content.trim() : "";
  if (!content) {
    return { success: false, error: "Comment cannot be empty." };
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return {
      success: false,
      error: `Comments can be at most ${MAX_COMMENT_LENGTH} characters.`,
    };
  }
  const blogId = payload?.blog_id;
  const parentId = payload?.parent_id ?? null;
  if (!isPositiveInt(blogId) || (parentId !== null && !isPositiveInt(parentId))) {
    return { success: false, error: "Invalid comment." };
  }

  // --- Rate limit per user and per IP ---
  const ip = getClientIp(await headers());
  const allowed =
    rateLimit({ key: `comment:user-min:${user.id}`, limit: COMMENT_LIMITS.perUserMinute, windowMs: 60_000 }).ok &&
    rateLimit({ key: `comment:user-hour:${user.id}`, limit: COMMENT_LIMITS.perUserHour, windowMs: HOUR }).ok &&
    rateLimit({ key: `comment:ip-min:${ip}`, limit: COMMENT_LIMITS.perIpMinute, windowMs: 60_000 }).ok;
  if (!allowed) {
    return {
      success: false,
      error: "You're commenting too quickly. Please wait a minute and try again.",
    };
  }

  // --- A reply must answer a visible comment on the same article ---
  if (parentId !== null) {
    const { data: parent } = await supabase
      .from("blogs_comments")
      .select("id, blog_id")
      .eq("id", parentId)
      .eq("is_approved", true)
      .maybeSingle();
    if (!parent || parent.blog_id !== blogId) {
      return { success: false, error: "That comment is no longer available." };
    }
  }

  const { data, error } = await supabase
    .from("blogs_comments")
    .insert({
      blog_id: blogId,
      content,
      parent_id: parentId,
      user_id: user.id,
    })
    .select(COMMENT_COLUMNS)
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Failed to post. Please try again." };
  }

  const comment = data as unknown as BlogComment;

  // --- TRIGGER SLACK NOTIFICATION (throttled per user) ---
  // The email comes from the verified session and only goes to Slack.
  if (
    rateLimit({ key: `comment:slack:${user.id}`, limit: COMMENT_LIMITS.slackPerUserHour, windowMs: HOUR }).ok
  ) {
    notifySlackOfBlogComment(supabase, {
      userName: comment.user?.full_name || user.user_metadata?.full_name || "Anonymous",
      userEmail: user.email || "",
      comment: content,
      blogId,
      parentId,
    }).catch((e) => console.error("Failed to send Slack blog notification:", e));
  }

  // --- TRIGGER EMAIL IF THIS IS A REPLY ---
  // Only for replies that are visible (a held-for-moderation reply shouldn't
  // email anyone), and throttled per replier.
  if (
    comment.parent_id &&
    comment.is_approved !== false &&
    rateLimit({ key: `comment:reply-email:${user.id}`, limit: COMMENT_LIMITS.replyEmailsPerReplierHour, windowMs: HOUR }).ok
  ) {
    // Catch errors so we don't fail the comment creation if email fails
    sendReplyEmailBackground(comment.parent_id, comment, user.id, blogId).catch((e) =>
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

    // Cap how many reply emails one person can receive in an hour
    if (
      !rateLimit({
        key: `comment:reply-email-to:${parentComment.user_id}`,
        limit: COMMENT_LIMITS.replyEmailsPerRecipientHour,
        windowMs: HOUR,
      }).ok
    ) {
      return;
    }

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

    const replierName = singleLine(replierUser?.full_name || "", 80) || "Someone";

    // 4. Look up Blog Post details for the link
    const { data: blog, error: blogError } = await supabaseAdmin
      .from("blogs")
      .select("title, slug")
      .eq("id", blogId)
      .single();

    if (blogError || !blog) return;

    const threadUrl = blogUrl(`/${blog.slug}`);
    const emailSubject = `New reply from ${replierName} on "${singleLine(blog.title || "our blog", 150)}"`;

    // 5. Generate Email HTML via React-Email
    const emailHtml = await render(
      CommentReplyEmail({
        parentUserName: parentUser.full_name || "there",
        parentUserAvatar: safeAvatarUrl(parentUser.avatar_url),
        replierName: replierName,
        replierAvatar: safeAvatarUrl(replierUser?.avatar_url),
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

  if (!isPositiveInt(commentId) || typeof shouldLike !== "boolean") {
    return { success: false, error: "Invalid request." };
  }

  // Each toggle is three service-role writes; cap it per user.
  if (!rateLimit({ key: `comment:like:${user.id}`, limit: 30, windowMs: 60_000 }).ok) {
    return { success: false, error: "Too many requests. Please slow down." };
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
