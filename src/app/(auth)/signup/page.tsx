"use client";

import { signup } from "../actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignupForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="text-primary">Write</span>Loft
                </h1>
                <p className="mt-2 text-sm text-muted">Create your account</p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                    {error}
                </div>
            )}

            <form action={signup} className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium text-muted"
                    >
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-muted"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div>
                    <label
                        htmlFor="password"
                        className="mb-1 block text-sm font-medium text-muted"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover cursor-pointer"
                >
                    Create Account
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-medium text-primary hover:text-primary-hover transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense>
            <SignupForm />
        </Suspense>
    );
}
