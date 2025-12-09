"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Loader2, ArrowLeft, Save, ImagePlus, X } from "lucide-react";

export default function EditEntryPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [mood, setMood] = useState("😀");
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const { register, handleSubmit, setValue } = useForm();

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[300px] border-none p-6 bg-transparent outline-none text-gray-700',
            },
        },
    });

    useEffect(() => {
        const fetchEntry = async () => {
            try {
                const res = await api.get(`/entries/${params.id}`);
                const entry = res.data.data.entry;
                setValue("title", entry.title);
                setValue("tags", entry.tags.map((t: any) => t.name).join(", "));
                setMood(entry.mood);
                setImages(entry.images || []);
                setIsFavorite(entry.isFavorite || false);
                if (editor) {
                    editor.commands.setContent(entry.content);
                }
            } catch (error) {
                console.error("Failed to fetch entry", error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id && editor) {
            fetchEntry();
        }
    }, [params.id, editor, setValue]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const res = await api.post('/entries/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = `http://localhost:5000${res.data.data.url}`;
            setImages([...images, imageUrl]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: any) => {
        if (!editor) return;
        try {
            const content = editor.getHTML();
            const tags = data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
            await api.patch(`/entries/${params.id}`, {
                title: data.title,
                content,
                mood,
                tags,
                images,
                isFavorite
            });
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to update entry", error);
        }
    };

    const moods = ["😀", "😐", "😢", "😡", "😴", "🤩", "🤔", "🥳"];

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-900 hover:bg-white/50 pl-0 gap-2"
            >
                <ArrowLeft className="h-4 w-4" /> Cancel Edit
            </Button>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-sm border border-yellow-100 overflow-hidden">
                <div className="bg-yellow-50/50 p-6 sm:p-8 border-b border-yellow-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Entry</h2>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-yellow-500 bg-yellow-100' : 'text-gray-400 hover:bg-white'}`}
                                title="Pin to Favorites"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </button>
                            <span className="bg-yellow-200 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Editing Mode</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-yellow-900/70 uppercase tracking-wider">Current Mood</label>
                        <div className="flex flex-wrap gap-3">
                            {moods.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    className={`text-3xl p-3 rounded-2xl transition-all duration-200 border-2 ${mood === m ? 'bg-white border-yellow-400 shadow-md scale-110' : 'border-transparent hover:bg-white hover:border-yellow-200 scale-100 grayscale hover:grayscale-0'}`}
                                    onClick={() => setMood(m)}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    <div className="space-y-2">
                        <Input
                            {...register("title", { required: true })}
                            placeholder="Title"
                            className="text-3xl font-bold border-none px-0 shadow-none placeholder:text-gray-300 focus-visible:ring-0 bg-transparent h-auto"
                        />
                    </div>

                    <div>
                        <Input
                            {...register("tags")}
                            placeholder="#tags"
                            className="font-medium text-blue-600 bg-blue-50/50 border-none rounded-xl focus-visible:ring-0 focus-visible:bg-blue-50 placeholder:text-blue-300"
                        />
                    </div>

                    {/* Image Attachments */}
                    <div>
                        <div className="flex items-center gap-4 flex-wrap mb-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                                    <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="w-24 h-24 mt-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-colors text-gray-400 hover:text-yellow-600">
                                <ImagePlus className="h-6 w-6 mb-1" />
                                <span className="text-[10px] font-medium uppercase">Add Photo</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="min-h-[300px] border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30 focus-within:border-yellow-300 focus-within:bg-white transition-colors">
                        <EditorContent editor={editor} />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg gap-2">
                            <Save className="h-5 w-5" /> Update Memory
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
