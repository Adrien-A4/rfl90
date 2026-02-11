"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import RedirectWithFadeButton from "./components/RedirectWithFadeButton";
import SettingsMenu from "./components/SettingsMenu";
import Image from "next/image";

type League = {
  id: string;
  name: string;
  short_name?: string;
  country: string;
  logo: string;
};

type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "finished";
  scheduled_at: string;
  competition: string;
  round: string;
  home_team?: {
    id: string;
    name: string;
    short_name: string;
    logo: string;
    primary_color: string;
  };
  away_team?: {
    id: string;
    name: string;
    short_name: string;
    logo: string;
    primary_color: string;
  };
};

const news: any[] = [];

const DEFAULT_LEAGUES: League[] = [
  {
    id: "ECL",
    name: "English Elite Conference",
    country: "England",
    logo: "https://cdn.discordapp.com/emojis/1249053705681244170.webp?size=1024",
  },
];

const RFL90 = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("ongoing");
  const [expandedLeague, setExpandedLeague] = useState("league-1");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<
    Record<
      string,
      { name: string; short_name: string; logo: string; primary_color: string }
    >
  >({});
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchLeagues();
    fetchTeams();
    fetchMatches();
  }, []);

  const fetchLeagues = async () => {
    try {
      const res = await fetch("/api/admin/leagues");
      const data = await res.json();
      if (data.leagues && data.leagues.length > 0) {
        setLeagues(data.leagues);
      }
    } catch (err) {
      console.error("Failed to fetch leagues:", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/admin/teams");
      const data = await res.json();
      const teamsMap: Record<
        string,
        {
          name: string;
          short_name: string;
          logo: string;
          primary_color: string;
        }
      > = {};
      if (data.teams) {
        data.teams.forEach((team: any) => {
          teamsMap[team.id] = {
            name: team.name,
            short_name: team.short_name,
            logo: team.logo,
            primary_color: team.primary_color,
          };
        });
        setTeams(teamsMap);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/admin/matches");
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    }
  };

  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) {
      return "FT";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    }

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const getMatchStatus = (match: Match) => {
    const scheduledDate = new Date(match.scheduled_at);
    const now = new Date();

    if (match.status === "finished") {
      return { label: "FT", type: "finished" };
    }

    if (match.status === "live") {
      return { label: "LIVE", type: "live" };
    }

    const diff = scheduledDate.getTime() - now.getTime();
    if (diff > 0 && diff < 2 * 60 * 60 * 1000) {
      return { label: `${Math.floor(diff / 60000)}'`, type: "upcoming" };
    }

    return { label: formatMatchTime(match.scheduled_at), type: "scheduled" };
  };

  const groupedMatches = matches.reduce(
    (acc, match) => {
      const leagueId = match.competition || "Other";
      if (!acc[leagueId]) {
        acc[leagueId] = [];
      }
      acc[leagueId].push(match);
      return acc;
    },
    {} as Record<string, Match[]>,
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

        .match-card {
          transition: all 0.2s ease;
        }

        .match-card:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .league-item {
          transition: all 0.2s ease;
        }

        .league-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .live-dot {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-card border-b border-border transition-colors duration-300"
      >
        <div className="max-w-400 mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold tracking-tight">
                RFL <span className="text-muted-foreground/60">90'</span>
              </h1>

              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-80 bg-input border border-border rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm"
                />
              </div>
            </div>

            <nav className="flex items-center gap-6">
              <a
                href="/news"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                News
              </a>
              <a
                href="/matches"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Matches
              </a>
              <a
                href="/api/invite"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Discord
              </a>
              <div className="flex gap-1 ml-4 items-center">
                <SettingsMenu />
              </div>
            </nav>
          </div>
        </div>
      </motion.header>

      <div className="max-w-400 mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-3"
          >
            <div className="bg-card rounded-xl p-4 sticky top-24 transition-colors duration-300">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/40 mb-4 px-2">
                Top leagues
              </h2>

              <div className="space-y-1">
                {leagues.map((league, index) => (
                  <motion.button
                    key={league.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={mounted ? { x: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.15 + index * 0.02 }}
                    onClick={() => setExpandedLeague(league.id)}
                    className={`league-item w-full flex items-center gap-3 p-3 rounded-lg ${
                      expandedLeague === league.id ? "bg-white/10" : ""
                    }`}
                  >
                    <div className="w-5 h-5 relative shrink-0">
                      <Image
                        src={league.logo}
                        alt={league.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <span className="flex-1 text-left font-medium text-sm">
                      {league.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.aside>

          <main className="col-span-6">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-180 text-muted-foreground/60" />
                  </button>
                  <h2 className="text-lg font-semibold">Today</h2>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-muted-foreground/60" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSelectedTab("ongoing")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTab === "ongoing"
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground/60 hover:text-foreground"
                  }`}
                >
                  Ongoing
                </button>
                <button
                  onClick={() => setSelectedTab("ontv")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTab === "ontv"
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground/60 hover:text-foreground"
                  }`}
                >
                  On TV
                </button>
                <button
                  onClick={() => setSelectedTab("bytime")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTab === "bytime"
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground/60 hover:text-foreground"
                  }`}
                >
                  By time
                </button>
                <button className="ml-auto px-4 py-2 text-sm text-muted-foreground/60 hover:text-foreground transition-colors">
                  Filter
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(groupedMatches).map(
                  ([competition, competitionMatches]) => {
                    return (
                      <motion.div
                        key={competition}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-card rounded-xl overflow-hidden transition-colors duration-300"
                      >
                        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm">
                              {competition}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                        </div>

                        <div>
                          {competitionMatches.map((match) => {
                            const status = getMatchStatus(match);
                            const homeTeam =
                              match.home_team || teams[match.home_team_id];
                            const awayTeam =
                              match.away_team || teams[match.away_team_id];

                            return (
                              <div
                                key={match.id}
                                onClick={() =>
                                  router.push(`/match/${match.id}`)
                                }
                                className="match-card px-5 py-4 border-b border-white/5 last:border-0 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  {status.type === "finished" && (
                                    <div className="text-xs font-medium text-muted-foreground/40 w-12">
                                      FT
                                    </div>
                                  )}
                                  {status.type !== "finished" && (
                                    <div className="text-sm font-medium w-12 text-center">
                                      {status.type === "live" ? (
                                        <span className="text-green-400 flex items-center gap-1">
                                          <span className="w-2 h-2 bg-green-400 rounded-full live-dot" />
                                          {status.label}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground/60">
                                          {status.label}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex-1 flex items-center gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                      <span className="font-medium text-sm text-right flex-1">
                                        {homeTeam?.name || "Home"}
                                      </span>
                                      <div className="w-5 h-5 relative shrink-0 ml-auto">
                                        {homeTeam?.logo && (
                                          <Image
                                            src={homeTeam.logo}
                                            alt={homeTeam.name || "Home"}
                                            width={20}
                                            height={20}
                                            className="object-contain"
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 min-w-15 justify-center">
                                      {status.type === "finished" ? (
                                        <>
                                          <span className="text-lg font-semibold w-6 text-center">
                                            {match.home_score}
                                          </span>
                                          <span className="text-muted-foreground/30">
                                            -
                                          </span>
                                          <span className="text-lg font-semibold w-6 text-center">
                                            {match.away_score}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-white/40 text-sm">
                                          vs
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="w-5 h-5 relative shrink-0">
                                        {awayTeam?.logo && (
                                          <Image
                                            src={awayTeam.logo}
                                            alt={awayTeam.name || "Away"}
                                            width={20}
                                            height={20}
                                            className="object-contain"
                                          />
                                        )}
                                      </div>
                                      <span className="font-medium text-sm">
                                        {awayTeam?.name || "Away"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  },
                )}

                {matches.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground/40">
                    <p>No matches scheduled yet.</p>
                    <p className="text-sm mt-2">
                      Come back later, or wait for them to be added.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </main>

          <aside className="col-span-3">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6 sticky top-24"
            >
              <div className="bg-card rounded-xl p-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Build your own XI</h3>
                  <button className="text-white/40 hover:text-white transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-white/40 mb-4">
                  Try our lineup builder
                </p>

                <div className="flex">
                  <RedirectWithFadeButton
                    to="/lineup"
                    className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors text-left"
                  >
                    Open Lineup Builder
                  </RedirectWithFadeButton>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 transition-colors duration-300">
                <h3 className="font-semibold text-sm mb-4">News</h3>

                <div className="space-y-4">
                  {news.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                      <div className="aspect-video bg-white/5 rounded-lg mb-3 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={300}
                          height={169}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-medium text-sm group-hover:text-white/80 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-white/40 mt-1">
                        {item.source} • {item.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RFL90;
