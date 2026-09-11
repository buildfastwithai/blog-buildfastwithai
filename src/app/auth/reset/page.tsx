"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

import Logo from "@/components/header/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BG from "@/public/bg.webp";
import { createClient } from "@/utils/supabase/client";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const password = formData.get("password") as string;
      const confirm_password = formData.get("confirm_password") as string;

      if (password !== confirm_password) {
        toast.error("Passwords do not match", {
          position: "top-center",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.log({ error });
        toast.error("Something went wrong!", {
          position: "top-center",
        });
        return;
      }
      setLoading(false);
      toast.success("Password updated successfully", {
        position: "top-center",
      });
      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r ">
        <div className="bg-gradient-to-t from-black via-transparent to-transparent absolute top-0 left-0 w-full h-full z-20"></div>
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo />
        </div>
        <Image src={BG} alt="BuildFastwithAI" fill className="object-cover" />
        <div className="relative z-20 mt-auto">
          <p className="text-md">
            Discover the art of transforming your innovative AI ideas into
            reality with our pocket-friendly workshops and courses. No
            experience required!
          </p>
        </div>
      </div>
      <div className="p-4 lg:p-8 w-full">
        <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-6">
          <div className="flex flex-col items-center lg:hidden">
            <Logo />
          </div>
          <form onSubmit={handleSubmit} className="w-full">
            <Card className="bg-muted/50 border-none rounded-2xl">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">
                  Update Your Password
                </CardTitle>
                <CardDescription>
                  Enter your new password below to update
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="******"
                    className="bg-background/80 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 py-6 px-4"
                  />
                  <span
                    onClick={() => setShowPass(!showPass)}
                    className="absolute cursor-pointer right-3 top-[35px]"
                  >
                    {!showPass ? (
                      <EyeIcon size={18} className="stroke-muted-foreground" />
                    ) : (
                      <EyeOffIcon
                        size={18}
                        className="stroke-muted-foreground"
                      />
                    )}
                  </span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type={showPass ? "text" : "password"}
                    name="confirm_password"
                    placeholder="******"
                    className="bg-background/80 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 py-6 px-4"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button
                  className="w-full py-6 text-base font-semibold"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
          </form>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
