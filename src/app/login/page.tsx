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
import { BookHeart } from "lucide-react";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const { login } = useAuthStore();
    const router = useRouter();
    const [error, setError] = useState("");
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            setError("");
            const res = await api.post("/auth/login", data);
            login(res.data.token, res.data.data.user);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FEF9E7] p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-all">
                <div className="bg-yellow-400 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                        <BookHeart className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-yellow-900/80">Continue writing your story</p>
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

                        <Button
                            type="submit"
                            className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-md font-bold text-base h-11"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link href="/register" className="font-bold text-yellow-600 hover:text-yellow-700 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
