import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_ARTICLES } from "@/lib/blog-data";

interface Props {
    params: Promise<{ slug: string }>;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getArticle(slug: string) {
    try {
        const res = await fetch(
            `${API}/api/cms/content/${slug}`,
            { next: { revalidate: 300 } }
        );
        if (res.ok) {
            const item = await res.json();
            return {
                slug: item.slug,
                title: item.title,
                excerpt: item.body?.excerpt || "",
                image: item.body?.image || "",
                category: item.body?.category || "Dental Health",
                date: new Date(item.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                }),
                readTime: item.body?.readTime || "5 min read",
                content: item.body?.content || "<p>Article content coming soon.</p>",
            };
        }
    } catch { /* fall through */ }

    return BLOG_ARTICLES.find((a) => a.slug === slug) || null;
}

export async function generateStaticParams() {
    return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const article = await getArticle(slug);
    if (!article) return {};
    return {
        title: `${article.title} | SmileCare Blog`,
        description: article.excerpt,
    };
}

export default async function BlogArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = await getArticle(slug);
    if (!article) notFound();

    const others = BLOG_ARTICLES.filter((a) => a.slug !== slug);

    return (
        <main className="min-h-screen bg-background-light pt-28 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-10">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>›</span>
                    <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                    <span>›</span>
                    <span className="text-gray-600 truncate max-w-xs">{article.title}</span>
                </nav>

                {/* Category & Meta */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                        {article.category}
                    </span>
                    <span className="text-sm text-gray-400">{article.date}</span>
                    <span className="text-sm text-gray-400">· {article.readTime}</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-display font-bold text-navy-deep leading-tight mb-8">
                    {article.title}
                </h1>

                {/* Hero Image */}
                <div className="relative h-[400px] rounded-3xl overflow-hidden mb-12 shadow-xl">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Article Body */}
                <div
                    className="prose prose-lg prose-navy max-w-none
                        prose-headings:font-display prose-headings:text-navy-deep
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* CTA */}
                <div className="mt-16 p-10 bg-navy-deep rounded-[2rem] text-center text-white">
                    <h3 className="text-2xl font-display font-bold mb-3">
                        Ready to Experience the Difference?
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Book your consultation with one of our world-class specialists today.
                    </p>
                    <Link
                        href="/booking"
                        className="inline-block bg-accent-gold text-navy-deep px-4 sm:px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
                    >
                        Book an Appointment
                    </Link>
                </div>

                {/* Other Articles */}
                {others.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-display font-bold text-navy-deep mb-8">
                            More Articles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-8">
                            {others.map((a) => (
                                <Link
                                    key={a.slug}
                                    href={`/blog/${a.slug}`}
                                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex gap-5 p-4 items-center"
                                >
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                        <Image src={a.image} alt={a.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{a.category}</span>
                                        <p className="text-sm font-bold text-navy-deep group-hover:text-primary transition-colors leading-snug mt-0.5 line-clamp-2">{a.title}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
