"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthCodeErrorPage() {
  const router = useRouter();

  const handleRetry = () => {
    // Go back to sign in page
    router.push("/auth/sign-in");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-muted rounded-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <div>
            <CardTitle className="text-xl">Authentication Failed</CardTitle>
            <CardDescription className="mt-2">
              Something went wrong during the sign-in process. Please try again.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button onClick={handleRetry} className="w-full" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/sign-in">
              <Mail className="w-4 h-4 mr-2" />
              Sign in with Email & Password
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
