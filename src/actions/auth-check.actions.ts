"use server";

import { getSupabaseAdminClient } from "@/utils/supabase/admin-client";

export type EmailCheckStatus = "registered" | "new" | "unknown";

/**
 * Checks whether an email already has an account, so the login dialog can send
 * the user straight to the right step instead of making them pick sign-in vs
 * sign-up themselves. Returns "unknown" when we cannot tell — callers should
 * fall back to the sign-in step in that case.
 */
export async function checkEmailRegistered(
	rawEmail: string,
): Promise<{ status: EmailCheckStatus }> {
	const email = rawEmail.trim().toLowerCase();

	if (!email || !email.includes("@")) return { status: "unknown" };

	try {
		const admin = getSupabaseAdminClient();

		// Fast path: most accounts have a matching public.users row.
		const { data: publicUsers } = await admin
			.from("users")
			.select("id")
			.ilike("email", email)
			.limit(1);

		if (publicUsers && publicUsers.length > 0) {
			return { status: "registered" };
		}

		// public.users is not guaranteed to be in sync with auth.users, so confirm
		// against the auth admin API. generateLink only mints a link server-side,
		// it does not send any email to the user.
		const { error } = await admin.auth.admin.generateLink({
			type: "recovery",
			email,
		});

		if (!error) return { status: "registered" };

		const message = error.message?.toLowerCase() ?? "";
		if (error.status === 404 || message.includes("user not found")) {
			return { status: "new" };
		}

		return { status: "unknown" };
	} catch (error) {
		console.error("[checkEmailRegistered]", error);
		return { status: "unknown" };
	}
}
