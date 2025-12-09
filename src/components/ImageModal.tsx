"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ImageModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!imageUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
                <X className="h-6 w-6" />
            </button>
            <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
                <img
                    src={imageUrl}
                    alt="Full size memory"
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
            </div>
        </div>
    );
}
