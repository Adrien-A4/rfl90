"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Trophy, Medal } from "lucide-react";
import { useRouter } from "next/navigation";
import RedirectWithFadeButton from "../components/RedirectWithFadeButton";
import SettingsMenu from "../components/SettingsMenu";
import Image from "next/image";
import Loader from "@/components/ui/spinner";

type League = {
  id: string;
  name: string;
  short_name?: string;
  country: string;
  logo: string;
};

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

type LeaderboardEntry = {
  id: string;
  team_name: string;
  total_points: number;
  user_id: string;
  profiles: {
    username: string;
    avatar: string | null;
    discriminator: string;
  } | null;
};

const LeaderboardPage = () => {
  const [mounted, setMounted] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchLeagues();
    fetchNews();
    fetchLeaderboard();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/admin/news?published=true");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setNews(data.news?.slice(0, 3) || []);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  const fetchLeagues = async () => {
    try {
      const res = await fetch("/api/admin/leagues");
      const data = await res.json();
      if (data.leagues) setLeagues(data.leagues);
    } catch (err) {
      console.error("Failed to fetch leagues:", err);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fantasy/leaderboard");
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.team_name.toLowerCase().includes(query) ||
      entry.profiles?.username?.toLowerCase().includes(query)
    );
  });

  if (!mounted) return null;

  const getRankBadge = (rank: number) => {
    if (rank === 0) return <Medal className="w-5 h-5 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-sm font-semibold text-muted-foreground/60 w-5 text-center">
        {rank + 1}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .leaderboard-card:hover { background: rgba(255, 255, 255, 0.03); }
      `}</style>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-card border-b border-border transition-colors duration-300"
      >
        <div className="max-w-400 mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1
                className="text-2xl font-bold tracking-tight cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Image
                  src="/rff.png"
                  alt="Real Futbol Fantasy"
                  width={80}
                  draggable={false}
                  height={80}
                />
              </h1>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Search teams or users"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-input border border-border rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm"
                />
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="/news"
                className="text-sm font-medium text-white/80 hover:text-white"
              >
                News
              </a>
              <a
                href="/matches"
                className="text-sm font-medium text-white/80 hover:text-white"
              >
                Matches
              </a>
              <a
                href="/fantasy"
                className="text-sm font-medium text-white/80 hover:text-white"
              >
                Fantasy
              </a>
              <SettingsMenu />
            </nav>
          </div>
        </div>
      </motion.header>

      <div className="max-w-400 mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="col-span-3"
          >
            <div className="bg-card rounded-xl p-4 sticky top-24">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/40 mb-4 px-2">
                Top leagues
              </h2>
              <div className="space-y-1">
                {leagues.map((league, index) => (
                  <button
                    key={league.id}
                    onClick={() =>
                      router.push(
                        `/matches?league=${encodeURIComponent(league.name)}`,
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-5 h-5 relative shrink-0">
                      <Image
                        src={league.logo}
                        alt={league.name}
                        width={20}
                        draggable={false}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <span className="flex-1 text-left font-medium text-sm">
                      {league.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          <main className="col-span-6">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Global Leaderboard</h2>
              </div>

              <div className="bg-card rounded-xl overflow-hidden border border-border">
                <div className="grid grid-cols-12 px-6 py-4 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground/40">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-7">Team & Manager</div>
                  <div className="col-span-4 text-right">Points</div>
                </div>

                <div className="divide-y divide-border">
                  {loading ? (
                    <div className="p-12 text-center text-muted-foreground/60">
                      <Loader size="s" />
                    </div>
                  ) : filteredLeaderboard.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground/60">
                      No teams found matching your search.
                    </div>
                  ) : (
                    filteredLeaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 px-6 py-4 items-center leaderboard-card transition-colors"
                      >
                        <div className="col-span-1">{getRankBadge(index)}</div>
                        <div className="col-span-7 flex items-center gap-4">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-secondary">
                            {entry.profiles?.avatar ? (
                              <Image
                                src={`https://cdn.discordapp.com/avatars/${entry.user_id}/${entry.profiles.avatar}.png`}
                                alt={entry.profiles.username}
                                fill
                                draggable={false}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-white/10">
                                {entry.profiles?.username?.[0] || "?"}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {entry.team_name}
                            </div>
                            <div className="text-xs text-muted-foreground/60">
                              @{entry.profiles?.username || "Unknown"}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-4 text-right">
                          <span className="text-lg font-bold text-yellow-500">
                            {entry.total_points.toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </main>

          <aside className="col-span-3">
            <div className="space-y-6 sticky top-24">
              <div className="bg-card rounded-xl p-6">
                <h3 className="font-semibold text-sm mb-4">Your Team</h3>
                <RedirectWithFadeButton
                  to="/fantasy"
                  className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors text-left"
                >
                  Manage My Team
                </RedirectWithFadeButton>
              </div>

              <div className="bg-card rounded-xl p-6">
                <h3 className="font-semibold text-sm mb-4">Latest News</h3>
                <div className="space-y-4">
                  {news.map((item) => (
                    <a key={item.id} href="/news" className="group block">
                      <div className="aspect-video bg-white/5 rounded-lg mb-3 overflow-hidden">
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            width={300}
                            height={169}
                            draggable={false}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <h4 className="font-medium text-sm group-hover:text-white/80 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
