"use client";

import { useAuthStore } from "@/utils/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Book, LogOut, User } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isLoading, checkAuth } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (mounted && !isLoading && !user) {
            router.push("/login");
        }
    }, [isLoading, user, router, mounted]);

    if (!mounted || isLoading) {
        return <div className="flex h-screen items-center justify-center bg-[#FEF9E7] text-yellow-800">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FEF9E7] font-sans">
            <header className="sticky top-0 z-50 border-b border-yellow-200/50 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-white shadow-sm">
                            <Book className="h-6 w-6 text-gray-900" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">
                            <Link href="/dashboard" className="hover:text-yellow-600 transition-colors">TastGo Diary</Link>
                        </h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/dashboard" className="text-gray-600 hover:text-yellow-600 font-medium transition-colors">Home</Link>
                        <Link href="/dashboard/calendar" className="text-gray-600 hover:text-yellow-600 font-medium transition-colors">Calendar</Link>
                        <Link href="/dashboard/analytics" className="text-gray-600 hover:text-yellow-600 font-medium transition-colors">Analytics</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900">{user.email?.split('@')[0]}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <Button
                            onClick={logout}
                            className="group flex items-center gap-2 bg-white border-2 border-transparent hover:border-red-100 text-gray-600 hover:text-red-600 hover:bg-red-50 shadow-sm transition-all rounded-xl"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
