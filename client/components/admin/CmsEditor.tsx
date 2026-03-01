"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

interface CmsEditorProps {
    item: any | null;
    onSave: (saved: any) => void;
    onCancel: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CmsEditor({ item, onSave, onCancel }: CmsEditorProps) {
    const { success, error: showError } = useToast();
    const [title, setTitle] = useState(item?.title || "");
    const [slug, setSlug] = useState(item?.slug || "");
    const [type, setType] = useState(item?.type || "blog");
    const [status, setStatus] = useState(item?.status || "draft");
    const [featured, setFeatured] = useState(item?.featured || false);
    const [bodyText, setBodyText] = useState(item ? JSON.stringify(item.body, null, 2) : "");
    const [saving, setSaving] = useState(false);

    // Auto-generate slug on title change ONLY IF creating a new item
    useEffect(() => {
        if (!item) {
            const autoSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setSlug(autoSlug);
        }
    }, [title, item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const bodyJson = (() => {
            try { return JSON.parse(bodyText); }
            catch { return { content: bodyText }; } // Fallback if invalid JSON
        })();

        try {
            const url = item
                ? `${API}/api/cms/content/${item.id}`
                : `${API}/api/cms/content`;

            const method = item ? "PATCH" : "POST";

            const payload = item
                ? { title, body: bodyJson, status, featured }
                : { type, title, slug, body: bodyJson, status, featured };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            const data = await res.json();
            if (res.ok && data.success !== false) {
                // Determine what to pass back.
                // PATCH backend returns the raw item. POST returns { success: true, data: { ... } }
                const savedItem = data.data || data;
                success(`Content successfully ${item ? "updated" : "created"}!`);
                onSave(savedItem);
            } else {
                showError(data.error || "Failed to save content");
            }
        } catch (err) {
            showError("Network error occurred");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white border border-primary/10 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/10">
                <h3 className="font-display font-bold text-2xl text-primary">
                    {item ? `Edit: ${item.title}` : "Create New Content"}
                </h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm font-bold text-primary/50 hover:text-primary transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to list
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary/70">Title</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-primary/20 bg-background-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Enter content title..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary/70">Slug</label>
                        <input
                            required
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            disabled={!!item} // Do not change slug of existing items
                            className="w-full h-12 px-4 rounded-xl border border-primary/20 bg-background-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                            placeholder="url-friendly-slug"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary/70">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            disabled={!!item}
                            className="w-full h-12 px-4 rounded-xl border border-primary/20 bg-background-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                        >
                            <option value="blog">Blog</option>
                            <option value="testimonial">Testimonial</option>
                            <option value="offer">Offer</option>
                            <option value="gallery">Gallery</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary/70">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-primary/20 bg-background-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                    <div className="flex items-center pt-8">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                                className="size-5 rounded border-primary/20 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-bold text-primary/70">Featured Post</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-primary/70 flex items-center justify-between">
                        Body (JSON or Plain Text)
                        <span className="text-xs font-normal text-primary/40">
                            For blog: {`{ "excerpt": "...", "image": "url", "category": "...", "content": "<p>html</p>" }`}
                        </span>
                    </label>
                    <textarea
                        required
                        rows={12}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        className="w-full p-4 font-mono text-sm rounded-xl border border-primary/20 bg-background-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                        placeholder="Enter JSON structure..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-primary text-white h-14 rounded-xl font-bold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Content"}
                </button>
            </form>
        </div>
    );
}
