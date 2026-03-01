"use client";

import { useState, useEffect } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CmsEditor from "@/components/admin/CmsEditor";
import { useToast } from "@/context/ToastContext";
import { Edit2, Trash2, Star, Plus } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPES = ["All", "blog", "testimonial", "offer", "gallery"];

export default function AdminCmsPage() {
    const { success, error: showError } = useToast();
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [typeFilter, setTypeFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const url = new URL(`${API}/api/cms/content`);
            if (typeFilter !== "All") url.searchParams.append("type", typeFilter);

            // fetch up to 100 for admin view instead of 10
            url.searchParams.append("limit", "100");

            const res = await fetch(url.toString(), { credentials: "include" });
            const data = await res.json();
            if (data.items) {
                setItems(data.items);
            }
        } catch {
            showError("Failed to fetch CMS content.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showForm) {
            fetchContent();
        }
    }, [typeFilter, showForm]);

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setShowForm(true);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            const res = await fetch(`${API}/api/cms/content/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                success("Content deleted.");
                setItems(prev => prev.filter(i => i.id !== id));
            } else {
                showError("Failed to delete content.");
            }
        } catch {
            showError("Network error.");
        }
    };

    return (
        <div>
            <AdminPageHeader
                title="Content Manager"
                subtitle="Publish blogs, testimonials, and offers"
                action={!showForm && (
                    <button
                        onClick={() => { setSelectedItem(null); setShowForm(true); }}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> New Content
                    </button>
                )}
            />

            <div className="grid lg:grid-cols-12 gap-8 items-start">

                {/* Left side: List */}
                <div className={`col-span-12 ${showForm ? 'lg:col-span-4' : ''} transition-all duration-300`}>

                    {/* Types Filter */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        {TYPES.map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTypeFilter(t); setShowForm(false); }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                    ${typeFilter === t
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-white border border-primary/10 text-primary/60 hover:border-primary/30"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {loading && !showForm ? (
                        <div className="text-center py-20 text-primary/40 flex flex-col items-center gap-4">
                            <div className="size-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            Loading content...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-primary/10 rounded-2xl">
                            <p className="text-primary/40 font-semibold mb-4">No content found.</p>
                            {!showForm && (
                                <button
                                    onClick={() => { setSelectedItem(null); setShowForm(true); }}
                                    className="text-primary font-bold hover:underline"
                                >
                                    Create your first post →
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className={`bg-white border p-4 rounded-xl transition-all
                                        ${selectedItem?.id === item.id
                                            ? "border-primary shadow-md"
                                            : "border-primary/10 hover:border-primary/30"}`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0 pr-2">
                                            <h4 className="font-bold text-primary truncate flex items-center gap-2">
                                                {item.featured && <Star size={14} className="text-accent-gold fill-accent-gold" />}
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="px-2 py-0.5 rounded bg-primary/5 text-primary/60 text-[10px] font-bold uppercase tracking-wide">
                                                    {item.type}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                    ${item.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-primary/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.title)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right side: Editor */}
                {showForm && (
                    <div className="col-span-12 lg:col-span-8 animate-in slide-in-from-right-8 duration-500">
                        <CmsEditor
                            key={selectedItem?.id || "new"} // force remount on item change
                            item={selectedItem}
                            onSave={() => {
                                setShowForm(false);
                                fetchContent();
                            }}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
