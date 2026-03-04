import Image from "next/image";
import Link from "next/link";
import { BLOG_ARTICLES } from "@/lib/blog-data";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getBlogArticles() {
    try {
        const res = await fetch(
            `${API}/api/cms/content?type=blog`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) return null;
        const { items } = await res.json();
        if (!items || items.length === 0) return null;

        return items.map((item: any) => ({
            slug: item.slug,
            title: item.title,
            excerpt: item.body?.excerpt || item.title,
            image: item.body?.image || "",
            category: item.body?.category || "Dental Health",
            date: new Date(item.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
            }),
            readTime: item.body?.readTime || "5 min read",
            content: item.body?.content || "",
        }));
    } catch {
        return null;
    }
}

export const metadata = {
    title: "Blog | SmileCare Dental",
    description: "Dental health tips, technology insights, and expert advice from the SmileCare team.",
};

export default async function BlogPage() {
    const apiArticles = await getBlogArticles();

    const articles = apiArticles && apiArticles.length > 0
        ? apiArticles
        : BLOG_ARTICLES;

    return (
        <main className="min-h-screen bg-background-light pt-28 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">
                        Our Blog
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-navy-deep mb-6 leading-tight">
                        Dental Health{" "}
                        <span className="text-accent-gold italic">Tips & News</span>
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Expert insights from our clinical team to help you maintain a healthy, confident smile every day.
                    </p>
                </div>

                {/* Article Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {articles.map((article: any) => (
                        <article
                            key={article.slug}
                            className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-primary uppercase tracking-wider shadow-sm">
                                    {article.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-8 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                    <span>{article.date}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span>{article.readTime}</span>
                                </div>
                                <h2 className="text-2xl font-display font-bold text-navy-deep mb-4 group-hover:text-primary transition-colors leading-snug">
                                    {article.title}
                                </h2>
                                <p className="text-gray-600 leading-relaxed mb-8 line-clamp-3">
                                    {article.excerpt}
                                </p>
                                <div className="mt-auto">
                                    <Link
                                        href={`/blog/${article.slug}`}
                                        className="inline-flex items-center gap-2 text-navy-deep font-bold border-b-2 border-accent-gold/30 hover:border-accent-gold transition-all pb-1 group/link"
                                    >
                                        Read Article
                                        <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}
