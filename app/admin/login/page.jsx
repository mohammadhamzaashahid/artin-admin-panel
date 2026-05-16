"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLogin } from "@/lib/hooks/useAuth";
import { hasAdminSession } from "@/lib/auth/require-admin";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const loginMutation = useAdminLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  useEffect(() => {
    if (hasAdminSession()) {
      router.replace("/admin");
    }
  }, [router]);

  const onSubmit = (values) => {
    loginMutation.mutate(values);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden lg:block">
            <div className="rounded-[2rem] border bg-white p-10 shadow-sm">
              <div className="mb-10 inline-flex rounded-full border bg-neutral-50 px-4 py-2 text-sm text-muted-foreground">
                Artin Institute Admin
              </div>

              <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-neutral-950">
                Manage courses, lectures, media and pricing from one clean panel.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                A minimal, secure and responsive dashboard for handling your full
                course platform operations.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                {["Courses", "Lectures", "Media"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border bg-neutral-50 px-4 py-5"
                  >
                    <p className="text-sm font-medium">{item}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Admin CRUD
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Card className="mx-auto w-full max-w-md rounded-[2rem] border-0 shadow-xl shadow-neutral-200/80">
            <CardHeader className="space-y-2 px-7 pt-7">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <CardTitle className="text-2xl font-semibold tracking-tight">
                Admin login
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Sign in with your admin account to continue.
              </p>
            </CardHeader>

            <CardContent className="px-7 pb-7">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label>Email or username</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-11 rounded-xl pl-10"
                      placeholder="admin@artininstitute.com"
                      autoComplete="username"
                      {...register("emailOrUsername")}
                    />
                  </div>
                  {errors.emailOrUsername && (
                    <p className="text-xs text-destructive">
                      {errors.emailOrUsername.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    className="h-11 rounded-xl"
                    placeholder="Enter password"
                    type="password"
                    autoComplete="current-password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}