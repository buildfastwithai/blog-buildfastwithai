"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getBlogComments,
  addBlogComment,
  deleteBlogComment,
  toggleBlogCommentLike,
  BlogComment,
} from "@/actions/blog-comments.actions";
import { useUser } from "@/hooks/use-user";
import useloginForm from "@/hooks/user-login-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Heart,
  Trash2,
  Reply,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostHog } from "posthog-js/react";

// ────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ────────────────────────────────────────────────────────
// Avatar
// ────────────────────────────────────────────────────────

function Avatar({
  avatarUrl,
  name,
  email,
  size = 36,
}: {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User"}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center flex-shrink-0 text-xs"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {getInitials(name, email)}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Comment Composer
// ────────────────────────────────────────────────────────

interface ComposerProps {
  blogId: number;
  parentId?: number | null;
  placeholder?: string;
  onSuccess: (comment: BlogComment) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

function CommentComposer({
  blogId,
  parentId,
  placeholder,
  onSuccess,
  onCancel,
  autoFocus,
}: ComposerProps) {
  const { data: user, isLoading } = useUser();
  const loginForm = useloginForm();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const posthog = usePostHog();

  const handleSubmit = async () => {
    if (!user || user.is_anonymous) {
      loginForm.onOpen();
      return;
    }
    if (!text.trim()) return;
    setSubmitting(true);
    const result = await addBlogComment({
      blog_id: blogId,
      content: text,
      parent_id: parentId ?? null,
    });
    setSubmitting(false);
    if (result.success && result.data) {
      setText("");
      posthog.capture("blog_comment_added", { is_reply: !!parentId });
      onSuccess(result.data);
      toast.success(parentId ? "Reply posted!" : "Comment posted!");
    } else {
      toast.error(result.error || "Failed to post. Please try again.");
    }
  };

  return (
    <div className="flex gap-3 items-start w-full">
      {!isLoading && user && !user.is_anonymous ? (
        <Avatar
          avatarUrl={(user as any).user_metadata?.avatar_url}
          name={(user as any).user_metadata?.full_name}
          email={user.email}
          size={34}
        />
      ) : (
        <div className="w-[34px] h-[34px] rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <UserCircle className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 flex flex-col gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            !user || user.is_anonymous
              ? "Sign in to join the conversation…"
              : placeholder ?? "Share your thoughts…"
          }
          rows={2}
          autoFocus={autoFocus}
          disabled={submitting}
          className="resize-none text-sm bg-muted/40 border-border focus-visible:ring-primary/30 placeholder:text-muted-foreground rounded-xl min-h-[72px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground/60 hidden sm:block">
            Ctrl+Enter to submit
          </p>
          <div className="flex gap-2 ml-auto">
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={
                !user || user.is_anonymous ? () => loginForm.onOpen() : handleSubmit
              }
              disabled={submitting || (!user || user.is_anonymous ? false : !text.trim())}
              className="h-7 text-xs gap-1.5 bg-primary hover:bg-primary/90"
            >
              {submitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              {!user || user.is_anonymous ? "Sign in to comment" : parentId ? "Reply" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Single Comment Card (Thread Style)
// ────────────────────────────────────────────────────────

interface CommentCardProps {
  comment: BlogComment;
  blogId: number;
  currentUserId?: string;
  depth?: number;
  isLast?: boolean;
  onDelete: (id: number) => void;
  onReply: (parent: BlogComment, newReply: BlogComment) => void;
  onLike: (id: number, liked: boolean, newLikes: number) => void;
}

function CommentCard({
  comment,
  blogId,
  currentUserId,
  depth = 0,
  isLast = true,
  onDelete,
  onReply,
  onLike,
}: CommentCardProps) {
  const [showReply, setShowReply] = useState(false);
  const [liked, setLiked] = useState(comment.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(comment.likes ?? 0);

  // Sync internal state with props in case of re-fetches (e.g. after login resolves)
  useEffect(() => {
    setLiked(comment.user_has_liked || false);
    setLikesCount(comment.likes ?? 0);
  }, [comment.user_has_liked, comment.likes]);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const loginForm = useloginForm();
  const { data: user } = useUser();
  const posthog = usePostHog();

  const isOwner = currentUserId === comment.user_id;
  const hasReplies = (comment.replies?.length ?? 0) > 0;

  // Sizing per depth
  const avatarSize = depth === 0 ? 36 : 28;

  const handleLike = async () => {
    if (!user || user.is_anonymous) {
      loginForm.onOpen();
      return;
    }
    const newLiked = !liked;
    const newCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLiked(newLiked);
    setLikesCount(newCount);
    const res = await toggleBlogCommentLike(comment.id, newLiked);
    if (res.success && res.likes !== undefined) {
      posthog.capture("blog_comment_liked", { action: newLiked ? "liked" : "unliked" });
      setLikesCount(res.likes);
      onLike(comment.id, newLiked, res.likes);
    } else {
      // revert
      setLiked(!newLiked);
      setLikesCount(likesCount);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteBlogComment(comment.id);
    setDeleting(false);
    if (res.success) {
      setDeleteDialogOpen(false);
      posthog.capture("blog_comment_deleted");
      onDelete(comment.id);
      toast.success("Comment deleted.");
    } else {
      toast.error(res.error || "Failed to delete.");
    }
  };

  const displayName =
    comment.user?.full_name ||
    (comment.user?.email ? comment.user.email.split("@")[0] : "Anonymous");

  return (
    <div className="relative">
     

      {/* Main Comment Row */}
      <div className="relative flex gap-3 z-10 w-full mb-3 group">
        <div className="flex-shrink-0 mt-0.5">
          <Avatar
            avatarUrl={comment.user?.avatar_url}
            name={comment.user?.full_name}
            email={comment.user?.email}
            size={avatarSize}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
            <span
              className={cn(
                "font-semibold text-foreground tracking-tight leading-tight",
                depth === 0 ? "text-[15px]" : "text-sm"
              )}
            >
              {displayName}
            </span>
            {isOwner && (
              <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-0.5">
                Author
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-1">
              {formatDate(comment.created_at)}
            </span>
              <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-7 px-2 text-xs flex items-center gap-1.5 transition-colors rounded-full",
                liked
                  ? "text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", liked && "fill-current text-primary")} />
              {likesCount > 0 && <span className="font-semibold">{likesCount}</span>}
            </Button>
        {/* Delete */}
            {isOwner && (
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleting}
                    className="h-7 px-2 ml-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full opacity-0 group-hover:opacity-100"
                  >
                    {deleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The comment will be removed from this
                      discussion.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

          </div>

          {/* Content */}
          <p
            className={cn(
              "text-foreground/90 whitespace-pre-wrap break-words leading-relaxed mb-2.5",
              depth === 0 ? "text-[15px]" : "text-sm"
            )}
          >
            {comment.content}
          </p>

          {/* Actions Bar */}
          <div className="flex items-center gap-1.5 -ml-1.5 mt-1">
          

            {/* Reply */}
            {depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReply((v) => !v)}
                className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                Reply
              </Button>
            )}

            {/* Toggle Replies (Collapsible) */}
            {depth === 0 && hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-7 px-2.5 ml-1 text-xs font-semibold text-primary hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
                    Hide {comment.replies!.length}{" "}
                    {comment.replies!.length === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
                    View {comment.replies!.length}{" "}
                    {comment.replies!.length === 1 ? "reply" : "replies"}
                  </>
                )}
              </Button>
            )}



          </div>

          {/* Reply Composer */}
          {showReply && depth === 0 && (
            <div className="mt-3 mb-2 animate-in slide-in-from-top-2 fade-in duration-200">
              <CommentComposer
                blogId={blogId}
                parentId={comment.id}
                placeholder={`Replying to ${displayName}…`}
                autoFocus
                onSuccess={(newReply) => {
                  setShowReply(false);
                  onReply(comment, newReply);
                  setShowReplies(true);
                }}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies Container */}
      {hasReplies && (
        <div className="pl-11 relative">
         
          {/* Nested Replies List */}
          <div
            className={cn(
              "flex flex-col gap-1 transition-all duration-300 ease-in-out relative z-10",
              showReplies ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
            )}
          >
            {comment.replies!.map((reply, idx) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                blogId={blogId}
                currentUserId={currentUserId}
                depth={depth + 1}
                isLast={idx === comment.replies!.length - 1}
                onDelete={onDelete}
                onReply={onReply}
                onLike={onLike}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Main BlogComments Wrapper
// ────────────────────────────────────────────────────────

interface BlogCommentsProps {
  blogId: number;
}

export function BlogComments({ blogId }: BlogCommentsProps) {
  const { data: user, refetch: refetchUser } = useUser();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const data = await getBlogComments(blogId, user?.id);
    setComments(data);
    setLoading(false);
  }, [blogId, user?.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    // The unsubscribe has to be captured out here — returning a cleanup from
    // inside .then() hands it to the promise chain, not to React, so the
    // subscription used to leak on unmount.
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    import("@/utils/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          refetchUser();
        }
      });

      if (cancelled) {
        subscription.unsubscribe();
        return;
      }
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [refetchUser]);

  const totalCount = comments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length ?? 0),
    0
  );

  // ── Mutations ──

  const updateCommentInTree = (
    list: BlogComment[],
    id: number,
    updateFn: (c: BlogComment) => BlogComment
  ): BlogComment[] => {
    return list.map((c) => {
      if (c.id === id) return updateFn(c);
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: updateCommentInTree(c.replies, id, updateFn) };
      }
      return c;
    });
  };

  const handleNewComment = (newComment: BlogComment) => {
    setComments((prev) => [{ ...newComment, replies: [] }, ...prev]);
  };

  const handleDelete = (deletedId: number) => {
    setComments((prev) => {
      const filtered = prev.filter((c) => c.id !== deletedId);
      return filtered.map((c) => ({
        ...c,
        replies: c.replies?.filter((r) => r.id !== deletedId) ?? [],
      }));
    });
  };

  const handleReply = (parent: BlogComment, newReply: BlogComment) => {
    setComments((prev) =>
      prev.map((c) => {
        const isParent = c.id === parent.id;
        const containsParent = c.replies?.some((r) => r.id === parent.id);

        if (isParent || containsParent) {
          return {
            ...c,
            replies: [...(c.replies ?? []), { ...newReply, replies: [] }],
          };
        }
        return c;
      })
    );
  };

  const handleLike = (id: number, liked: boolean, newLikes: number) => {
    setComments((prev) =>
      updateCommentInTree(prev, id, (c) => ({
        ...c,
        likes: newLikes,
        user_has_liked: liked,
      }))
    );
  };

  return (
    <section className="mt-16 py-10 border-t border-border">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-foreground">
            {loading ? "Comments" : `${totalCount} Comments`}
          </div>
        </div>
        <div className="flex items-center text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5"
          >
            <path d="M11 5h10"></path>
            <path d="M11 9h7"></path>
            <path d="M11 13h4"></path>
            <path d="m3 17 3 3 3-3"></path>
            <path d="M6 18V4"></path>
          </svg>
          Sort by
        </div>
      </div>

      {/* New Comment Composer */}
      <div className="mb-10">
        <CommentComposer
          blogId={blogId}
          placeholder="Add a comment..."
          onSuccess={handleNewComment}
        />
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2 mt-1">
                <div className="h-3 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-foreground font-medium">Be the first to comment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start the conversation below
            </p>
          </div>
        ) : (
          comments
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((comment, index) => (
              <div
                key={comment.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CommentCard
                  comment={comment}
                  blogId={blogId}
                  currentUserId={user?.id}
                  depth={0}
                  isLast={index === comments.length - 1}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  onLike={handleLike}
                />
              </div>
            ))
        )}
      </div>
    </section>
  );
}
