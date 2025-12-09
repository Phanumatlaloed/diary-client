"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import 'react-calendar/dist/Calendar.css';
import './calendar.css'; // Custom styles we'll create

interface Entry {
    id: string;
    title: string;
    mood: string;
    createdAt: string;
}

export default function CalendarPage() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<Date | null>(new Date());
    const router = useRouter();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await api.get("/entries");
                setEntries(res.data.data.entries);
            } catch (error) {
                console.error("Failed to fetch entries", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

    const getEntriesForDate = (date: Date) => {
        return entries.filter(
            (entry) =>
                format(new Date(entry.createdAt), "yyyy-MM-dd") ===
                format(date, "yyyy-MM-dd")
        );
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === "month") {
            const dayEntries = getEntriesForDate(date);
            if (dayEntries.length > 0) {
                return (
                    <div className="flex justify-center gap-1 mt-1">
                        {dayEntries.slice(0, 3).map((entry) => (
                            <span key={entry.id} className="text-[10px]" title={entry.mood}>
                                {entry.mood}
                            </span>
                        ))}
                        {dayEntries.length > 3 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>}
                    </div>
                );
            }
        }
        return null;
    };

    const onDateClick = (value: Date) => {
        const dayEntries = getEntriesForDate(value);
        if (dayEntries.length === 1) {
            router.push(`/dashboard/${dayEntries[0].id}/edit`);
        } else if (dayEntries.length > 1) {
            // Could open a modal or filter dashboard list
            router.push(`/dashboard?startDate=${value.toISOString()}&endDate=${value.toISOString()}`);
        } else {
            router.push('/dashboard/new');
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-yellow-100">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">Your Journey</h2>
                    <div className="text-sm font-medium text-yellow-900/60 bg-yellow-50 px-3 py-1 rounded-full">
                        {entries.length} Memories Collected
                    </div>
                </div>

                <div className="calendar-container flex justify-center">
                    <Calendar
                        onChange={(v) => setDate(v as Date)}
                        value={date}
                        tileContent={tileContent}
                        onClickDay={onDateClick}
                        className="w-full border-none font-sans text-gray-700 custom-calendar"
                        prevLabel={<ChevronLeft className="h-5 w-5 text-gray-400 hover:text-yellow-600" />}
                        nextLabel={<ChevronRight className="h-5 w-5 text-gray-400 hover:text-yellow-600" />}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-3xl border border-yellow-100">
                    <h3 className="font-bold text-lg mb-2 text-yellow-900">Consistency Streak</h3>
                    <p className="text-3xl font-bold text-gray-900">{(entries.length > 0 ? Math.ceil(entries.length / 7) : 0)} <span className="text-sm font-normal text-gray-500">weeks active</span></p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100">
                    <h3 className="font-bold text-lg mb-2 text-blue-900">Total Memories</h3>
                    <p className="text-3xl font-bold text-gray-900">{entries.length} <span className="text-sm font-normal text-gray-500">entries</span></p>
                </div>
            </div>
        </div>
    );
}
