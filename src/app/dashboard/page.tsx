"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Pencil, Trash2, Calendar, Plus, Search, Filter, X, Pin, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import ImageModal from "@/components/ImageModal";

interface Entry {
    id: string;
    title: string;
    content: string;
    mood: string;
    createdAt: string;
    tags: { id: string; name: string }[];
    isFavorite: boolean;
    images: string[];
}

export default function DashboardPage() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);
    const [selectedMood, setSelectedMood] = useState("");
    const [selectedTag, setSelectedTag] = useState("");
    const [isThisMonth, setIsThisMonth] = useState(false);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    const router = useRouter();
    const moods = ["😀", "😐", "😢", "😡", "😴", "🤩", "🤔", "🥳"];

    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {
                sort: sortOrder,
            };

            if (debouncedSearch) params.search = debouncedSearch;
            if (selectedMood) params.mood = selectedMood;
            if (selectedTag) params.tag = selectedTag;

            if (isThisMonth) {
                const now = new Date();
                params.startDate = startOfMonth(now).toISOString();
                params.endDate = endOfMonth(now).toISOString();
            }

            const res = await api.get("/entries", { params });
            // Client-side sort: Favorites first
            const fetchedEntries: Entry[] = res.data.data.entries;
            fetchedEntries.sort((a, b) => (Number(b.isFavorite) - Number(a.isFavorite)));
            setEntries(fetchedEntries);
        } catch (error) {
            console.error("Failed to fetch entries", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedMood, selectedTag, isThisMonth, sortOrder]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this memory?")) return;

        try {
            await api.delete(`/entries/${id}`);
            setEntries(entries.filter(entry => entry.id !== id));
        } catch (error) {
            console.error("Failed to delete entry", error);
            alert("Failed to delete entry");
        }
    };

    const handleTogglePin = async (e: React.MouseEvent, entry: Entry) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const newStatus = !entry.isFavorite;
            // Optimistic update
            const updatedEntries = entries.map(e => e.id === entry.id ? { ...e, isFavorite: newStatus } : e);
            // Re-sort
            updatedEntries.sort((a, b) => (Number(b.isFavorite) - Number(a.isFavorite)));
            setEntries(updatedEntries);

            await api.patch(`/entries/${entry.id}`, { isFavorite: newStatus });
        } catch (error) {
            console.error("Failed to toggle pin", error);
            alert("Failed to update pin");
            fetchEntries(); // Revert on error
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedMood("");
        setSelectedTag("");
        setIsThisMonth(false);
        setSortOrder("newest");
    };

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-yellow-100">
                <div className="w-full md:w-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Your Diary</h2>
                    <p className="text-yellow-900/60 mt-1">Capture your daily moments</p>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search memories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-yellow-50/50 border-yellow-100 focus:bg-white rounded-xl"
                        />
                    </div>
                    <Link href="/dashboard/new">
                        <Button className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-lg transition-all rounded-xl px-4 py-2 h-10 font-bold gap-2 whitespace-nowrap">
                            <Plus className="h-5 w-5" /> New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 py-2 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-yellow-100 shadow-sm">
                    <Filter className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-gray-700">Filters:</span>
                </div>

                {/* Mood Filter */}
                <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-yellow-100 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 cursor-pointer hover:bg-yellow-50 transition-colors appearance-none"
                >
                    <option value="">All Moods</option>
                    {moods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                {/* Time Filter */}
                <Button
                    variant={isThisMonth ? "default" : "outline"}
                    onClick={() => setIsThisMonth(!isThisMonth)}
                    className={`rounded-xl h-auto py-1.5 text-sm font-medium border-yellow-100 ${isThisMonth ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500' : 'bg-white text-gray-700 hover:bg-yellow-50'}`}
                >
                    This Month
                </Button>

                {/* Sort Filter */}
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                    className="px-3 py-1.5 rounded-xl border border-yellow-100 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 cursor-pointer hover:bg-yellow-50 transition-colors appearance-none"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>

                {(selectedMood || isThisMonth || search || selectedTag) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl h-auto py-1.5 gap-1"
                    >
                        <X className="h-3 w-3" /> Clear
                    </Button>
                )}
            </div>

            {/* Entries Grid */}
            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-2xl bg-white/50 animate-pulse border border-yellow-100/50"></div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                    {entries.map((entry) => (
                        <div key={entry.id} className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${entry.isFavorite ? 'border-yellow-400 shadow-yellow-100 ring-4 ring-yellow-50' : 'border-yellow-100 hover:shadow-yellow-100/50'}`}>

                            {/* Pin Button */}
                            <button
                                onClick={(e) => handleTogglePin(e, entry)}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${entry.isFavorite ? 'text-yellow-500 bg-yellow-50 opacity-100' : 'text-gray-300 hover:bg-gray-50 opacity-0 group-hover:opacity-100'}`}
                                title={entry.isFavorite ? "Unpin memory" : "Pin memory"}
                            >
                                <Pin className={`h-4 w-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
                            </button>

                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <span
                                        className="text-4xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform cursor-pointer"
                                        title="Filter by this mood"
                                        onClick={() => setSelectedMood(entry.mood)}
                                    >
                                        {entry.mood}
                                    </span>
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-yellow-600 transition-colors pr-8">
                                            <Link href={`/dashboard/${entry.id}/edit`}>{entry.title}</Link>
                                        </h3>
                                        <div className="flex items-center text-xs font-medium text-yellow-700 gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100 w-fit mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(entry.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                </div>

                                {/* Images Preview */}
                                {entry.images && entry.images.length > 0 && (
                                    <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                        {entry.images.slice(0, 3).map((img, idx) => (
                                            <div key={idx} className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:border-yellow-400 transition-colors" onClick={() => setSelectedImage(img)}>
                                                <img src={img} alt="memory" className="h-full w-full object-cover transform hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                        {entry.images.length > 3 && (
                                            <div
                                                className="h-16 w-16 flex-shrink-0 rounded-lg bg-yellow-50 border border-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs cursor-pointer hover:bg-yellow-100"
                                                onClick={() => setSelectedImage(entry.images[3])}
                                            >
                                                +{entry.images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div
                                    className="mb-6 text-gray-600 line-clamp-3 text-sm prose prose-sm prose-yellow"
                                    dangerouslySetInnerHTML={{ __html: entry.content }}
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex flex-wrap gap-2">
                                    {entry.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag.id}
                                            onClick={() => setSelectedTag(tag.name)}
                                            className="cursor-pointer rounded-lg bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700 border border-yellow-100 hover:bg-yellow-100 transition-colors"
                                            title="Filter by this tag"
                                        >
                                            #{tag.name}
                                        </span>
                                    ))}
                                    {entry.tags.length > 3 && <span className="text-xs text-gray-400 flex items-center">+{entry.tags.length - 3}</span>}
                                </div>

                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Link href={`/dashboard/${entry.id}/edit`}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                        onClick={(e) => handleDelete(e, entry.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {entries.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-yellow-200 rounded-3xl bg-white/50">
                            <div className="bg-yellow-100 p-6 rounded-full shadow-sm mb-6">
                                <Search className="h-10 w-10 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No memories found</h3>
                            <p className="mt-2 text-gray-500 max-w-sm mb-8">Try adjusting your filters or search terms.</p>
                            <Button onClick={clearFilters} variant="outline" className="border-yellow-200 hover:bg-yellow-50">
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
        </div>
    );
}
