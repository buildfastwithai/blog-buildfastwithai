import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { blogUrl as toBlogUrl } from "@/lib/urls";

// Zero-width space: breaks "@channel" etc. without changing what people read.
const ZWSP = String.fromCharCode(0x200b);

/**
 * Make user-supplied text inert inside a Slack mrkdwn block.
 *
 * Slack's control sequences all live inside angle brackets — `<!channel>`,
 * `<!here>`, `<@U123>`, `<https://evil.example|looks safe>` — so escaping
 * `&`, `<` and `>` (Slack's documented escapes) turns them into plain text.
 * Bare `@channel` / `@here` / `@everyone` get a zero-width space so they can't
 * notify anyone either. The text is cut to `max` characters before escaping so
 * an entity is never split.
 */
export function escapeSlackText(text: string, max: number): string {
  const clipped = text.length > max ? `${text.slice(0, max)}...` : text;
  return clipped
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/@(channel|here|everyone)\b/gi, `@${ZWSP}$1`);
}

/**
 * Post a "new blog comment" message to the blog Slack channel.
 *
 * Server-only on purpose: this used to be a "use server" action that took the
 * name, email and comment as arguments, which made it a public endpoint for
 * posting arbitrary messages into Slack. Callers must pass values they got
 * from the verified session and the database. Never throws.
 */
export async function notifySlackOfBlogComment(
  supabase: SupabaseClient,
  {
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
  },
): Promise<void> {
  try {
    // Priority: BLOG_SLACK_WEBHOOK_URL, then fallback to SLACK_WEBHOOK_URL
    const webhookUrl =
      process.env.BLOG_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("Blog Slack webhook URL is not defined");
      return;
    }

    const { data: blog } = await supabase
      .from("blogs")
      .select("title, slug")
      .eq("id", blogId)
      .single();

    if (!blog) {
      console.error("Slack blog notification: blog not found", blogId);
      return;
    }

    let parentCommentText: string | undefined;
    if (parentId) {
      const { data: parentComment } = await supabase
        .from("blogs_comments")
        .select("content")
        .eq("id", parentId)
        .single();
      parentCommentText = parentComment?.content ?? undefined;
    }

    const isReply = !!parentId;
    const blogUrl = toBlogUrl(`/${blog.slug}`);

    // Every user- or editor-supplied value goes through escapeSlackText.
    const slackMessage: { blocks: unknown[] } = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: isReply ? "💬 New Reply on Blog" : "📝 New Blog Comment",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*User:*\n${escapeSlackText(userName, 120)}` },
            { type: "mrkdwn", text: `*Email:*\n${escapeSlackText(userEmail, 200)}` },
            {
              type: "mrkdwn",
              text: `*Blog:*\n<${blogUrl}|${escapeSlackText(blog.title || "Untitled", 200)}>`,
            },
            { type: "mrkdwn", text: `*When:*\n${new Date().toLocaleString()}` },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Comment:*\n${escapeSlackText(comment, 2000)}`,
          },
        },
      ],
    };

    if (isReply && parentCommentText) {
      slackMessage.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Replying to:*\n"${escapeSlackText(parentCommentText, 100)}"`,
        },
      });
    }

    slackMessage.blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Blog Post", emoji: true },
          url: blogUrl,
          action_id: "view_blog",
        },
      ],
    });

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      console.error("Failed to send blog comment to Slack:", {
        status: response.status,
        statusText: response.statusText,
      });
    }
  } catch (slackError) {
    console.error("Error sending blog comment to Slack:", slackError);
  }
}
