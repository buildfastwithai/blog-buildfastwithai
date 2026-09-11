import { blogUrl as toBlogUrl } from "@/lib/urls";

export async function sendBlogCommentToSlack({
  userName,
  userEmail,
  comment,
  blogTitle,
  blogSlug,
  isReply,
  parentCommentText,
}: {
  userName: string;
  userEmail: string;
  comment: string;
  blogTitle: string;
  blogSlug: string;
  isReply: boolean;
  parentCommentText?: string;
}) {
  try {
    // Priority: BLOG_SLACK_WEBHOOK_URL, then fallback to SLACK_WEBHOOK_URL
    const webhookUrl = process.env.BLOG_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("Blog Slack webhook URL is not defined");
      return;
    }

    const blogUrl = toBlogUrl(`/${blogSlug}`);

    // Format the message for Slack
    const slackMessage: { blocks: any[] } = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: isReply ? `💬 New Reply on Blog` : `📝 New Blog Comment`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*User:*\n${userName}`,
            },
            {
              type: "mrkdwn",
              text: `*Email:*\n${userEmail}`,
            },
            {
              type: "mrkdwn",
              text: `*Blog:*\n<${blogUrl}|${blogTitle}>`,
            },
            {
              type: "mrkdwn",
              text: `*When:*\n${new Date().toLocaleString()}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Comment:*\n${comment.length > 2000 ? comment.substring(0, 2000) + "..." : comment}`,
          },
        },
      ],
    };

    // Add parent comment context if it's a reply
    if (isReply && parentCommentText) {
      slackMessage.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Replying to:*\n"${parentCommentText.length > 100 ? parentCommentText.substring(0, 100) + "..." : parentCommentText}"`,
        },
      });
    }

    // Add a button to view the blog post
    slackMessage.blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Blog Post",
            emoji: true,
          },
          url: blogUrl,
          action_id: "view_blog",
        },
      ],
    });

    // Send the message to Slack
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send blog comment to Slack:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
    }
  } catch (slackError) {
    console.error("Error sending blog comment to Slack:", slackError);
  }
}
