"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, signUp } from "@/lib/auth-client";
import Link from "next/link";

export default function SignUpPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", orgName: "" });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"idle" | "account" | "org" | "activating">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Step 1: Create account
            setStep("account");
            const res = await signUp.email({
                name: form.name,
                email: form.email,
                password: form.password,
            });

            if (res.error) {
                setError(res.error.message ?? "Signup failed");
                setIsLoading(false);
                setStep("idle");
                return;
            }

            // Step 2: Create organization
            setStep("org");
            const orgRes = await authClient.organization.create({
                name: form.orgName,
                slug: form.orgName.toLowerCase().replace(/\s+/g, "-"),
            });

            if (orgRes.error) {
                setError("Account created but organization setup failed. Please contact support.");
                setIsLoading(false);
                setStep("idle");
                return;
            }

            // Step 3: Set organization as active
            setStep("activating");
            await authClient.organization.setActive({
                organizationId: orgRes.data.id,
            });

            // Done — redirect to dashboard
            router.push("/");
        } catch (err: any) {
            setError(err.message ?? "Something went wrong");
            setIsLoading(false);
            setStep("idle");
        }
    };

    const getStepText = () => {
        if (step === "account") return "Creating your account...";
        if (step === "org") return "Setting up your organization...";
        if (step === "activating") return "Finalizing setup...";
        return "Create Account";
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "var(--background)" }}>
            <div className="w-full max-w-md animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-2">NexaDesk</h1>
                    <p className="text-slate-400 text-sm">Smart Ticket Management</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8">
                    <h2 className="text-white font-bold text-xl mb-2">Create Account</h2>
                    <p className="text-slate-400 text-sm mb-6">Set up your account and organization</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Section label */}
                        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Your Details</p>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                required
                                minLength={8}
                            />
                        </div>

                        {/* Divider */}
                        <div className="pt-2">
                            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">Your Organization</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Organization Name</label>
                                <input
                                    type="text"
                                    value={form.orgName}
                                    onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                                    placeholder="e.g. Acme Corp, My Company"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    required
                                    minLength={2}
                                />
                                <p className="text-xs text-slate-500 mt-1">All your tickets will be scoped to this organization.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                        >
                            {isLoading ? getStepText() : "Create Account & Organization"}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}