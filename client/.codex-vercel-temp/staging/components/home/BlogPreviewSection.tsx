import Image from "next/image";
import Link from "next/link";
import { BLOG_ARTICLES } from "@/lib/blog-data";

const BlogPreviewSection = () => {
    // Show only the first 2 articles on the homepage
    const recentArticles = BLOG_ARTICLES.slice(0, 2);

    return (
        <section className="py-24 bg-background-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                    <div className="max-w-2xl">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Latest Insights</span>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-deep leading-tight">
                            Dental Health <span className="text-accent-gold italic">Tips & News</span>
                        </h2>
                    </div>
                    <div>
                        <Link href="/blog" className="flex items-center gap-2 text-primary font-bold group inline-flex">
                            <span>Visit Our Full Blog</span>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                <svg className="w-5 h-5 leading-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="space-y-8">
                    {recentArticles.map((article, idx) => (
                        <div key={idx} className="group bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all duration-500 border border-gray-100">
                            {/* Thumbnail */}
                            <div className="md:w-1/3 relative h-[250px] md:h-auto overflow-hidden">
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-primary uppercase tracking-wider shadow-sm">
                                    {article.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="md:w-2/3 p-4 sm:p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                    <span>{article.date}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span>{article.readTime}</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-display font-bold text-navy-deep mb-4 group-hover:text-primary transition-colors leading-tight">
                                    {article.title}
                                </h3>
                                <p className="text-gray-600 text-lg mb-8 leading-relaxed line-clamp-2">
                                    {article.excerpt}
                                </p>
                                <div className="mt-auto">
                                    <Link href={`/blog/${article.slug}`} className="inline-flex items-center gap-2 text-navy-deep font-bold border-b-2 border-accent-gold/30 hover:border-accent-gold transition-all pb-1 group/link">
                                        Read Article
                                        <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogPreviewSection;
