"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

function getInitials(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

/**
 * Shared sign-out flow — used by the navbar avatar menu and the mobile sheet.
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const posthog = usePostHog();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async (source: string) => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      posthog?.capture("user_signout", { login_source: source });
      // Drop the cached user so every useUser() consumer (comments, menus)
      // flips to logged-out immediately. AuthProvider refreshes the page.
      queryClient.setQueryData(["user"], null);
      toast.success("Signed out", { position: "top-center" });
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Couldn't sign out. Please try again.", {
        position: "top-center",
      });
    } finally {
      setSigningOut(false);
    }
  };

  return { signOut, signingOut };
}

/** Round avatar: photo when available, otherwise initials on primary. */
export function UserAvatar({
  user,
  className,
}: {
  user: { email?: string | null; user_metadata?: Record<string, any> };
  className?: string;
}) {
  const name: string | null = user.user_metadata?.full_name ?? null;
  const email = user.email ?? null;
  const avatarUrl: string | null = user.user_metadata?.avatar_url ?? null;

  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary text-xs font-semibold text-primary-foreground",
        className,
      )}
    >
      {avatarUrl ? (
        // Google avatars are on an external host; a plain <img> avoids
        // having to allow-list every provider in next.config images.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name || email || "Account"}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(name, email)
      )}
    </span>
  );
}

/**
 * Navbar avatar for a signed-in reader. Renders nothing while logged out —
 * sign-in is initiated from the comments section, same as the main site.
 * Clicking the avatar opens a menu with the account and a Log out action.
 */
export function UserMenu({ className }: { className?: string }) {
  const { data: user, isLoading } = useUser();
  const { signOut, signingOut } = useSignOut();

  if (isLoading || !user || user.is_anonymous) return null;

  const name: string | null = user.user_metadata?.full_name ?? null;
  const email = user.email ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            "rounded-full ring-offset-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          <UserAvatar user={user} className={className} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            {name && (
              <span className="truncate text-sm font-medium text-foreground">
                {name}
              </span>
            )}
            {email && (
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            signOut("blog_navbar");
          }}
          disabled={signingOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut />
          {signingOut ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
