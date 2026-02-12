"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, Calendar, User, Tag, X } from "lucide-react";
import Image from "next/image";

type News = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

const NewsPage = () => {
  const [mounted, setMounted] = useState(false);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/admin/news?published=true");
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(news.map((item) => item.category))];

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-white/10"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a href="/" className="text-2xl font-bold tracking-tight">
                RFL <span className="text-white/40">90'</span>
              </a>

              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="/news"
                  className="text-sm font-medium text-white transition-colors"
                >
                  News
                </a>
                <a
                  href="/matches"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Matches
                </a>
                <a
                  href="/api/invite"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Discord
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm text-white placeholder-white/40"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Latest News</h1>
          <p className="text-white/40">
            Stay updated with the latest football news and updates
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedArticle ? (
            <motion.article
              key={selectedArticle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <div className="relative">
                {selectedArticle.image_url ? (
                  <div className="aspect-video w-full relative">
                    <Image
                      src={selectedArticle.image_url}
                      alt={selectedArticle.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-[#2a2a2a] flex items-center justify-center">
                    <span className="text-white/40">No image available</span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-8">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to all news
                </button>

                <div className="mb-6">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white mb-4">
                    {selectedArticle.category}
                  </span>
                  <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                    {selectedArticle.title}
                  </h1>
                  <div className="flex items-center gap-6 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedArticle.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedArticle.created_at)}
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-white/80 leading-relaxed text-lg">
                    {selectedArticle.content}
                  </p>
                </div>
              </div>
            </motion.article>
          ) : (
            <motion.div
              key="news-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-8"
            >
              <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-64 shrink-0 hidden md:block"
              >
                <div className="bg-[#1a1a1a] rounded-xl p-4 sticky top-24">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4 px-2">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedCategory === null
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">All News</span>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-medium">{category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.aside>

              <main className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  </div>
                ) : filteredNews.length > 0 ? (
                  <div className="grid gap-6">
                    {filteredNews.map((item, index) => (
                      <motion.article
                        key={item.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#1a1a1a] rounded-xl overflow-hidden hover:bg-white/5 transition-colors duration-300 cursor-pointer"
                        onClick={() => setSelectedArticle(item)}
                      >
                        <div className="flex flex-col md:flex-row gap-0">
                          {item.image_url && (
                            <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative">
                              <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="p-6 flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-white">
                                {item.category}
                              </span>
                              <span className="text-xs text-white/60">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                            <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                              {item.title}
                            </h2>
                            <p className="text-sm text-white/60 line-clamp-3">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-white/60">No news articles found.</p>
                  </div>
                )}
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewsPage;
