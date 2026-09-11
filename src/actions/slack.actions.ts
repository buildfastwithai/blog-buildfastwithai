"use server";

import { sendBlogCommentToSlack } from "@/lib/slack";
import { createClient } from "@/utils/supabase/server";

/**
 * Server action to send Slack notification for blog comments
 */
export async function sendSlackBlogCommentNotification({
  userName,
  userEmail,
  comment,
  blogId,
  parentId,
}: {
  userName: string;
  userEmail: string;
  comment: string;
  blogId: number;
  parentId?: number | null;
}) {
  try {
    const supabase = await createClient();

    // 1. Fetch Blog Details
    const { data: blog, error: blogError } = await supabase
      .from("blogs")
      .select("title, slug")
      .eq("id", blogId)
      .single();

    if (blogError || !blog) {
      throw new Error("Blog not found");
    }

    let parentCommentText: string | undefined;

    // 2. If this is a reply, fetch the original comment text
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from("blogs_comments")
        .select("content")
        .eq("id", parentId)
        .single();

      if (!parentError && parentComment) {
        parentCommentText = parentComment.content;
      }
    }

    // 3. Send to Slack
    await sendBlogCommentToSlack({
      userName,
      userEmail,
      comment,
      blogTitle: blog.title,
      blogSlug: blog.slug,
      isReply: !!parentId,
      parentCommentText,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send Slack blog notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
