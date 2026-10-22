/**
 * Posts that overlap a stronger post on the same topic. Each old slug
 * 308-redirects to its keeper (see next.config.ts) and is left out of the
 * sitemap, so Google sees one page per topic instead of several competing ones.
 *
 * Unpublishing the old post in Supabase is still worth doing: it drops it from
 * listings, the feed and llms.txt. Keep the entry here afterwards so the old
 * URL keeps redirecting instead of 404ing.
 */
const BEST_AI_MODELS = "best-ai-models-2026-tested";

export const MERGED_POSTS: Record<string, string> = {
  // Same article published twice (identical body and title).
  "openai-site-codex-launch-review-2026": "openai-sites-codex-launch-review-2026",

  // Same title or same topic, different body.
  "best-nano-banana-prompts": "100-best-nano-banana-prompts-2026-copy-paste",
  "claude-fable-5-prompts-test-capabilitie": "25-claude-fable-5-1-prompts-2026",
  "what-is-mcp-model-context-protocol": "what-is-model-context-protocol-mcp",
  "mcp-model-context-protocol-ai-integration": "what-is-model-context-protocol-mcp",
  "gemini-3-2-flash-release-2026": "gemini-3-2-flash-google-io-2026",
  "best-ai-coding-agents-august-2026":
    "best-ai-coding-agents-in-2026-claude-code-vs-codex-vs-cursor-vs-opencode",
  "deepseek-v4-vs-kimi-k3-vs-glm-5-2-coding": "glm-5-3-vs-deepseek-v4-pro-vs-kimi-k3",
  "best-open-source-ai-models-2026": "best-open-source-ai-models-october-2026",
  "best-open-source-ai-models-august-2026-full-collection":
    "best-open-source-ai-models-october-2026",
  "7-ai-tools-changed-developer-workflow-augustt-2026":
    "7-ai-tools-changed-developer-workflow-august-2026",

  // Monthly "best AI models" posts, all targeting the same query.
  "best-ai-models-april-2026": BEST_AI_MODELS,
  "best-ai-models-april-2026-comparison": BEST_AI_MODELS,
  "best-ai-models-leaderboard-april-2026-updated": BEST_AI_MODELS,
  "best-ai-models-may-2026-leaderboard": BEST_AI_MODELS,
  "best-ai-models-may-2026": BEST_AI_MODELS,
  "best-ai-models-june-2026-leaderboard": BEST_AI_MODELS,
  "best-ai-models-june-2026": BEST_AI_MODELS,
  "best-ai-models-july-2026-ranked": BEST_AI_MODELS,
  "best-ai-models-2026-full-ranked-analysis-and-benchmarks": BEST_AI_MODELS,
  "best-ai-models-this-week-july-2026-ranked": BEST_AI_MODELS,
  "best-ai-models-august-2026": BEST_AI_MODELS,
};
