"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/utils/store";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const { login } = useAuthStore();
    const router = useRouter();
    const [error, setError] = useState("");
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            setError("");
            const res = await api.post("/auth/register", {
                email: data.email,
                password: data.password,
            });
            login(res.data.token, res.data.data.user);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FEF9E7] p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-all">
                <div className="bg-yellow-400 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                        <Sparkles className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Start Your Journey</h2>
                    <p className="mt-2 text-yellow-900/80">Create your personal space</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
                            <Input
                                {...register("email")}
                                className="border-gray-200 bg-gray-50 focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/50"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
                            <Input
                                type="password"
                                {...register("password")}
                                className="border-gray-200 bg-gray-50 focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/50"
                                placeholder="••••••"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Confirm Password</label>
                            <Input
                                type="password"
                                {...register("confirmPassword")}
                                className="border-gray-200 bg-gray-50 focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/50"
                                placeholder="••••••"
                            />
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-md font-bold text-base h-11"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Create Account" : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link href="/login" className="font-bold text-yellow-600 hover:text-yellow-700 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
