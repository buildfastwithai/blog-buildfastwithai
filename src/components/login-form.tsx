"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { createClient } from "@/utils/supabase/client";
import { getURL } from "@/lib/utils";
import useLoginForm from "@/hooks/user-login-form";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	ArrowLeftIcon,
	EyeIcon,
	EyeOffIcon,
	Loader2,
	MailCheckIcon,
	PencilIcon,
} from "lucide-react";
import { Alert, AlertTitle } from "./ui/alert";
import { trackLoginEvent } from "@/actions/login-tracking.actions";
import { usePostHog } from "posthog-js/react";
import { checkEmailRegistered } from "@/actions/auth-check.actions";

type Step = "email" | "password" | "create" | "sent";
type SentKind = "signup" | "verify";
type Notice = { tone: "info" | "success" | "error"; text: string } | null;

const noticeStyles: Record<"info" | "success" | "error", string> = {
	info: "text-[var(--claude-dark)]",
	success: "text-[var(--claude-success-fg)]",
	error: "text-[var(--claude-orange-dark)]",
};

export default function LoginForm() {
	const pathname = usePathname();
	const loginForm = useLoginForm();
	const supabase = createClient();
	const router = useRouter();
	const posthog = usePostHog();
	const [loading, setLoading] = useState<boolean>(false);
	const [showPass, setShowPass] = useState<boolean>(false);
	const [forgotPassword, setForgotPassword] = useState<boolean>(false);
	const [mailMessage, setMailMessage] = useState<boolean>(false);

	// Single email-first flow: ask for the email, look it up, then send the user
	// to the sign-in or sign-up step automatically.
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [notice, setNotice] = useState<Notice>(null);
	const [sentKind, setSentKind] = useState<SentKind>("signup");
	const [resendIn, setResendIn] = useState<number>(0);

	const state = step === "create" ? "sign-up" : "sign-in";

	// Countdown that keeps the "Resend" button locked for a bit after each send
	useEffect(() => {
		if (resendIn <= 0) return;
		const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
		return () => clearTimeout(timer);
	}, [resendIn]);

	const resetForm = () => {
		setStep("email");
		setEmail("");
		setPassword("");
		setNotice(null);
		setShowPass(false);
		setForgotPassword(false);
		setMailMessage(false);
		setLoading(false);
		setResendIn(0);
	};

	const closeForm = () => {
		resetForm();
		loginForm.onClose();
	};

	const handleLoginWithOAuth = async (provider: "google") => {
		try {
			// Track OAuth login attempt in PostHog
			posthog?.capture("oauth_login_initiated", {
				provider: provider,
				login_source: pathname,
				was_anonymous: false,
			});

			// Remember where the reader was. /auth/callback sends them back here.
			// Carried in a cookie (not the redirect URL) so the redirectTo below
			// stays a fixed, query-less URL that matches Supabase's allow-list
			// exactly — if it doesn't match, Supabase falls back to the project's
			// Site URL, i.e. the main site.
			document.cookie = `login_source=${encodeURIComponent(pathname)}; path=/; max-age=600; SameSite=Lax`;

			// Must be on Supabase → Auth → URL Configuration → Redirect URLs
			// (https://blog.buildfastwithai.com/**).
			const fullRedirectUrl = `${getURL()}auth/callback`;

			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: fullRedirectUrl,
					scopes: "https://www.googleapis.com/auth/userinfo.email",
				},
			});

			if (error) throw error;
		} catch (error) {
			console.error("OAuth error:", error);
			toast.error("Authentication failed. Please try again.", {
				position: "top-center",
			});
		}
	};

	// Step 1: look up the email and decide whether this is a sign-in or a sign-up
	const handleEmailContinue = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const trimmedEmail = email.trim();

		if (!trimmedEmail) {
			setNotice({ tone: "error", text: "Please enter your email address." });
			return;
		}

		try {
			setLoading(true);
			setNotice(null);

			const { status } = await checkEmailRegistered(trimmedEmail);

			posthog?.capture("auth_email_checked", {
				status,
				login_source: pathname,
			});

			if (status === "new") {
				setStep("create");
				setNotice({
					tone: "info",
					text: "We couldn't find an account with this email. Create one below — it only takes a moment.",
				});
				return;
			}

			// "registered" and "unknown" both land on the password step; an unknown
			// result just means we couldn't verify, so we assume an existing user.
			setStep("password");
		} catch (error) {
			console.error("Email check failed:", error);
			setStep("password");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			setLoading(true);
			setNotice(null);

			const trimmedEmail = email.trim();

			if (trimmedEmail === "" || password === "") {
				setNotice({ tone: "error", text: "Please fill in all fields." });
				return;
			}

			if (state === "sign-up" && password.length < 6) {
				setNotice({
					tone: "error",
					text: "Password must be at least 6 characters.",
				});
				return;
			}

			// The blog never signs users in anonymously, so there is no anonymous
			// session to upgrade or transfer here.
			const isAnonymous = false;

			if (state === "sign-up") {
				const { error, data } = await supabase.auth.signUp({
					email: trimmedEmail,
					password,
					options: {
						data: {
							email: trimmedEmail,
						},
						// Absolute: Supabase resolves a relative URL against the project's
						// Site URL (the main site), which would land the confirmation on
						// the wrong domain.
						emailRedirectTo: `${getURL()}auth/confirm?next=${pathname}`,
					},
				});

				if (error) {
					if (error.status === 429) {
						setNotice({
							tone: "error",
							text: "Too many attempts. Please try again in a few minutes.",
						});
						return;
					}
					// Race: the account was created between our check and this call
					if (error.message?.toLowerCase().includes("already registered")) {
						setStep("password");
						setPassword("");
						setNotice({
							tone: "info",
							text: "This email already has an account. Enter your password to sign in.",
						});
						return;
					}
					setNotice({ tone: "error", text: error.message });
					return;
				}

				// Check if user already exists (email is already registered and verified)
				if (
					data?.user &&
					data.user.identities &&
					data.user.identities.length === 0
				) {
					// User already exists and is verified - send them back to sign-in
					setStep("password");
					setPassword("");
					setNotice({
						tone: "info",
						text: "This email already has an account. Enter your password to sign in.",
					});
					return;
				}

				// New registration or unconfirmed account - send confirmation email
				// Link workshop registrations if user was created successfully
				if (data?.user) {
					// Track sign-up in PostHog
					posthog?.capture("user_signup", {
						method: "email_password",
						login_source: pathname,
						was_anonymous: isAnonymous,
					});

					// Track in database
					trackLoginEvent({
						user_id: data.user.id,
						email: data.user.email ?? null,
						login_source: pathname,
						login_method: "email_password",
						login_type: "sign_up",
						was_anonymous: isAnonymous,
					}).catch((error) => {
						console.error("Failed to track signup event:", error);
					});
				}

				setSentKind("signup");
				setResendIn(30);
				setStep("sent");
				return;
			}

			// Sign in with email/password
			const { error, data } = await supabase.auth.signInWithPassword({
				email: trimmedEmail,
				password,
			});

			if (error) {
				// We already confirmed the account exists, so this is a wrong password
				if (
					error.message?.toLowerCase().includes("invalid login credentials")
				) {
					setNotice({
						tone: "error",
						text: "Incorrect password. Try again or reset your password.",
					});
					return;
				}
				setNotice({ tone: "error", text: error.message });
				return;
			}

			if (data?.user) {
				// Track sign-in in PostHog
				posthog?.capture("user_signin", {
					method: "email_password",
					login_source: pathname,
					was_anonymous: isAnonymous,
				});

				// Track in database
				trackLoginEvent({
					user_id: data.user.id,
					email: data.user.email ?? null,
					login_source: pathname,
					login_method: "email_password",
					login_type: "sign_in",
					was_anonymous: isAnonymous,
				}).catch((error) => {
					console.error("Failed to track signin event:", error);
				});
			}

			closeForm();
			router.refresh();
		} catch (error) {
			console.log(error);
			setNotice({
				tone: "error",
				text: "Something went wrong. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleResendConfirmation = async () => {
		if (resendIn > 0 || loading) return;

		try {
			setLoading(true);
			setNotice(null);

			const { error } = await supabase.auth.resend({
				type: "signup",
				email: email.trim(),
			});

			if (error) {
				setNotice({ tone: "error", text: error.message });
				return;
			}

			setResendIn(30);
			setNotice({ tone: "success", text: "Sent again. Check your inbox." });
		} catch (error) {
			console.error("Resend confirmation failed:", error);
			setNotice({
				tone: "error",
				text: "Couldn't resend right now. Please try again shortly.",
			});
		} finally {
			setLoading(false);
		}
	};

	const ResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			const resetEmail = formData.get("email") as string;

			const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
				redirectTo: `${getURL()}auth/reset`,
			});

			if (error) {
				console.log({ error });
				toast.error("Something went wrong!", {
					position: "top-center",
				});
				return;
			}

			setMailMessage(true);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const heading =
		step === "email"
			? "Sign in or create an account"
			: step === "create"
				? "Create your account"
				: "Welcome back!";

	const subheading =
		step === "email"
			? "Enter your email and we'll take it from there"
			: step === "create"
				? "Pick a password to finish setting up your account"
				: "Enter your password to continue";

	return (
		<Dialog
			open={loginForm.isOpen}
			onOpenChange={(open) => {
				if (!open) closeForm();
			}}
		>
			<DialogContent
				className={
					"claude-course-theme font-sans antialiased z-[200] max-h-[90vh] max-w-[560px] overflow-y-auto rounded-[24px] border border-border bg-background px-4 py-5 text-foreground shadow-[0_24px_64px_rgba(24,21,15,0.12)] sm:p-8"
				}
			>
				<DialogTitle className="sr-only">Login</DialogTitle>
				<div className="p-0">
					{!forgotPassword ? (
						<div className="mx-auto flex w-full max-w-lg flex-col justify-center">
							{step === "sent" ? (
								/* Step 3 — confirmation email sent */
								<Card className="border-transparent bg-transparent shadow-none">
									<CardHeader className="space-y-3">
										<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--claude-cream-2)]">
											<MailCheckIcon className="h-6 w-6 text-[var(--claude-orange-dark)]" />
										</div>
										<CardTitle className="text-center text-2xl text-[var(--claude-dark)]">
											Check your email
										</CardTitle>
										<CardDescription className="text-center text-[var(--claude-mid)]">
											{sentKind === "verify"
												? "We sent a verification link to"
												: "We sent a confirmation link to"}
										</CardDescription>
										<p className="break-all text-center font-medium text-[var(--claude-dark)]">
											{email}
										</p>
									</CardHeader>
									<CardContent className="grid gap-3">
										<div className="rounded-xl border border-border bg-card/80 px-4 py-3 text-sm text-[var(--claude-mid)]">
											<p className="mb-1 font-medium text-[var(--claude-dark)]">
												What&apos;s next
											</p>
											<p>
												{sentKind === "verify"
													? "Open the email and click the link to verify your address. Your account will be ready right after."
													: "Open the email and click the link to activate your account, then come back here and sign in."}
											</p>
										</div>
										<p className="text-center text-sm text-[var(--claude-mid)]">
											Can&apos;t find it? Check your spam or promotions folder.
										</p>
									</CardContent>
									<CardFooter className="flex flex-col space-y-3">
										<Button
											type="button"
											variant="outline"
											disabled={loading || resendIn > 0}
											onClick={handleResendConfirmation}
											className="w-full border-border bg-card text-foreground hover:bg-[var(--claude-cream-2)]"
										>
											{loading ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Sending...
												</>
											) : resendIn > 0 ? (
												`Resend link in ${resendIn}s`
											) : (
												"Resend link"
											)}
										</Button>
										{notice && (
											<p
												className={`text-center text-sm ${noticeStyles[notice.tone]}`}
											>
												{notice.text}
											</p>
										)}
										<div className="flex flex-col items-center gap-1">
											<button
												type="button"
												onClick={() => {
													setStep("password");
													setPassword("");
													setNotice(null);
												}}
												className="text-sm text-[var(--claude-dark)] hover:underline"
											>
												Already confirmed? Sign in
											</button>
											<button
												type="button"
												onClick={() => {
													setStep("email");
													setPassword("");
													setNotice(null);
												}}
												className="text-sm text-[var(--claude-mid)] hover:text-[var(--claude-dark)] hover:underline"
											>
												Use a different email
											</button>
										</div>
									</CardFooter>
								</Card>
							) : (
								<>
									<Card className="border-transparent bg-transparent shadow-none">
										<CardHeader className="space-y-1">
											{step !== "email" && (
												<button
													type="button"
													onClick={() => {
														setStep("email");
														setPassword("");
														setNotice(null);
													}}
													className="absolute left-4 top-5 flex items-center gap-1 text-sm text-[var(--claude-mid)] hover:text-[var(--claude-dark)] sm:left-8 sm:top-8"
												>
													<ArrowLeftIcon size={16} />
													Back
												</button>
											)}
											<CardTitle className="text-center text-2xl text-[var(--claude-dark)]">
												{heading}
											</CardTitle>
											<CardDescription className="text-center text-[var(--claude-mid)]">
												{subheading}
											</CardDescription>
										</CardHeader>
									</Card>

									{step === "email" ? (
										/* Step 1 — email lookup */
										<form onSubmit={handleEmailContinue} className="w-full">
											<Card className="border-transparent bg-transparent shadow-none">
												<CardContent className="grid gap-4">
													<Button
														onClick={() => handleLoginWithOAuth("google")}
														variant="outline"
														type="button"
														className="w-full border-border bg-card text-foreground shadow-[0_1px_3px_rgba(24,21,15,0.08)] hover:bg-[var(--claude-cream-2)]"
													>
														<Icons.google className="mr-2 h-4 w-4" />
														Continue with Google
													</Button>
													<div className="relative">
														<div className="absolute inset-0 flex items-center">
															<span className="w-full border-t border-border" />
														</div>
														<div className="relative flex justify-center text-xs uppercase">
															<span className="bg-background px-2 text-[var(--claude-mid)]">
																Or continue with
															</span>
														</div>
													</div>
													<div className="grid gap-2">
														<Label
															htmlFor="email"
															className="text-[var(--claude-dark)]"
														>
															Email
														</Label>
														<Input
															id="email"
															name="email"
															type="email"
															autoComplete="email"
															autoFocus
															required
															value={email}
															onChange={(e) => setEmail(e.target.value)}
															placeholder="me@example.com"
															className="border-border bg-card/80 px-4 py-6 focus-visible:ring-2 focus-visible:ring-[var(--claude-orange)] focus-visible:ring-offset-0"
														/>
													</div>
												</CardContent>
												<CardFooter className="flex flex-col space-y-4">
													<Button
														disabled={loading}
														className="mb-2 w-full"
														type="submit"
													>
														{loading ? (
															<>
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																Checking...
															</>
														) : (
															"Continue"
														)}
													</Button>
													{notice && (
														<p
															className={`text-center text-sm ${noticeStyles[notice.tone]}`}
														>
															{notice.text}
														</p>
													)}
													<p className="text-center text-sm text-[var(--claude-mid)]">
														New here? We&apos;ll set up your account on the next
														step.
													</p>
												</CardFooter>
											</Card>
										</form>
									) : (
										/* Step 2 — password (sign in) or create password (sign up) */
										<form onSubmit={handleSubmit} className="w-full">
											<Card className="border-transparent bg-transparent shadow-none">
												<CardContent className="grid gap-4">
													<div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 py-3">
														<span className="truncate text-sm text-[var(--claude-dark)]">
															{email}
														</span>
														<button
															type="button"
															onClick={() => {
																setStep("email");
																setPassword("");
																setNotice(null);
															}}
															className="flex shrink-0 items-center gap-1 text-sm text-[var(--claude-mid)] hover:text-[var(--claude-dark)] hover:underline"
														>
															<PencilIcon size={14} />
															Change
														</button>
													</div>
													<div className="grid gap-2 relative">
														<Label
															htmlFor="password"
															className="text-[var(--claude-dark)]"
														>
															{state === "sign-up"
																? "Create a password"
																: "Password"}
														</Label>
														<Input
															id="password"
															name="password"
															type={showPass ? "text" : "password"}
															autoComplete={
																state === "sign-up"
																	? "new-password"
																	: "current-password"
															}
															autoFocus
															required
															value={password}
															onChange={(e) => setPassword(e.target.value)}
															placeholder={
																state === "sign-up"
																	? "At least 6 characters"
																	: "******"
															}
															className="border-border bg-card/80 px-4 py-6 pr-11 focus-visible:ring-2 focus-visible:ring-[var(--claude-orange)] focus-visible:ring-offset-0"
														/>
														<span
															onClick={() => setShowPass(!showPass)}
															className="absolute cursor-pointer right-3 top-[36px]"
														>
															{showPass ? (
																<EyeIcon
																	size={18}
																	className="stroke-muted-foreground"
																/>
															) : (
																<EyeOffIcon
																	size={18}
																	className="stroke-muted-foreground"
																/>
															)}
														</span>
													</div>
												</CardContent>
												<CardFooter className="flex flex-col space-y-4">
													<Button
														disabled={loading}
														className="mb-2 w-full"
														type="submit"
													>
														{loading ? (
															<>
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																Please wait...
															</>
														) : state === "sign-up" ? (
															"Create account"
														) : (
															"Sign in"
														)}
													</Button>
													{state === "sign-in" && (
														<Button
															variant={"link"}
															onClick={() => setForgotPassword(true)}
															type="button"
															className="h-4 border-none py-0 text-sm text-[var(--claude-mid)] hover:text-[var(--claude-dark)] hover:underline"
														>
															Forgot Password?
														</Button>
													)}
													{notice && (
														<p
															className={`text-center text-sm ${noticeStyles[notice.tone]}`}
														>
															{notice.text}
														</p>
													)}
													{/* Manual escape hatch in case the lookup guessed wrong */}
													<div className="flex items-center gap-2">
														<p className="text-sm text-[var(--claude-mid)]">
															{state === "sign-up"
																? "Already have an account?"
																: "Don't have an account?"}
														</p>
														<button
															type="button"
															onClick={() => {
																setStep(
																	state === "sign-up" ? "password" : "create",
																);
																setPassword("");
																setNotice(null);
															}}
															className="text-sm text-[var(--claude-dark)] hover:underline"
														>
															{state === "sign-up" ? "Sign in" : "Create one"}
														</button>
													</div>
												</CardFooter>
											</Card>
										</form>
									)}
								</>
							)}
						</div>
					) : (
						<form onSubmit={ResetPassword}>
							<Card className="border-0 bg-transparent shadow-none">
								<CardHeader className="space-y-1 text-center">
									<CardTitle className="text-2xl text-[var(--claude-dark)]">
										Reset Your Password
									</CardTitle>
									<CardDescription className="text-[var(--claude-mid)]">
										Enter your email below and we&apos;ll send you a reset link
									</CardDescription>
								</CardHeader>
								<CardContent className="grid gap-4">
									<div className="grid gap-2">
										<Label
											htmlFor="reset-email"
											className="text-[var(--claude-dark)]"
										>
											Email
										</Label>
										<Input
											id="reset-email"
											type="email"
											name="email"
											required
											defaultValue={email}
											placeholder="me@example.com"
											className="border-border bg-card/80 px-4 py-6 focus-visible:ring-2 focus-visible:ring-[var(--claude-orange)] focus-visible:ring-offset-0"
										/>
									</div>
								</CardContent>
								<CardFooter className="flex flex-col space-y-4">
									<Button className="w-full" type="submit" disabled={loading}>
										{loading ? "Wait a moment..." : "Reset"}
									</Button>
									<Button
										variant={"link"}
										onClick={() => {
											setForgotPassword(false);
											setMailMessage(false);
										}}
										type="button"
										className="text-muted-foreground text-sm hover:underline hover:text-foreground"
									>
										Back to Login
									</Button>
									{mailMessage && (
										<Alert className="border border-teal-600 bg-teal-950">
											<AlertTitle className="text-teal-500 text-sm text-center">
												Check your email for a password reset link
											</AlertTitle>
										</Alert>
									)}
								</CardFooter>
							</Card>
						</form>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
