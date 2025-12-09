"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { Loader2, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface MoodStat {
    name: string;
    value: number;
}

export default function AnalyticsPage() {
    const [moodData, setMoodData] = useState<MoodStat[]>([]);
    const [totalEntries, setTotalEntries] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/entries/analytics");
                setMoodData(res.data.data.moodDistribution);
                setTotalEntries(res.data.data.totalEntries);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const COLORS = ['#FACC15', '#60A5FA', '#F87171', '#34D399', '#A78BFA', '#F472B6', '#FB923C', '#9CA3AF'];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Mood Analytics</h2>
                <p className="text-yellow-900/60 mt-1">Understanding your emotional journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-3xl border border-yellow-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-2xl text-yellow-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Entries</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalEntries}</h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Keep tracking to see more accurate insights.</p>
                </div>

                {/* Dominant Mood Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                            <PieIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Dominant Mood</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {moodData.length > 0 ? moodData.sort((a, b) => b.value - a.value)[0].name : "N/A"}
                            </h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Your most frequent state of mind.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-yellow-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Mood Distribution</h3>
                <div className="h-[300px] w-full">
                    {moodData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={moodData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {moodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            Not enough data yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
