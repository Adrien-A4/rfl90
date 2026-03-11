"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  MapPin,
  Search,
  Shield,
  Tag,
  Trophy,
  User,
  X,
} from "lucide-react";
import Image from "next/image";

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  logo: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

type League = {
  id: string;
  name: string;
  short_name: string | null;
  logo: string | null;
};

type Match = {
  id: string;
  league_id: string | null;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  scheduled_at: string | null;
  competition: string | null;
  round: string | null;
  venue: string | null;
  referee: string | null;
  home_team: Team | null;
  away_team: Team | null;
  league: League | null;
};

const MatchesPage = () => {
  const [mounted, setMounted] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/admin/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const leagues = useMemo(() => {
    const names = matches
      .map((match) => match.league?.name)
      .filter((name): name is string => Boolean(name));
    return [...new Set(names)];
  }, [matches]);

  const filteredMatches = matches.filter((match) => {
    const searchable = [
      match.home_team?.name,
      match.home_team?.short_name,
      match.away_team?.name,
      match.away_team?.short_name,
      match.league?.name,
      match.league?.short_name,
      match.competition,
      match.round,
      match.status,
      match.venue,
      match.referee,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchable.includes(searchQuery.toLowerCase());
    const matchesLeague = selectedLeague
      ? match.league?.name === selectedLeague
      : true;
    return matchesSearch && matchesLeague;
  });

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "TBD";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatScore = (match: Match) => {
    if (match.home_score == null || match.away_score == null) return "VS";
    return `${match.home_score} - ${match.away_score}`;
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
                <Image
                  src="/rff.png"
                  draggable={false}
                  alt="Real Futbol Fantasy"
                  width={80}
                  height={80}
                />
              </a>

              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="/news"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  News
                </a>
                <a
                  href="/matches"
                  className="text-sm font-medium text-white transition-colors"
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
                  placeholder="Search matches..."
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
          <h1 className="text-3xl font-bold mb-2">Latest Matches</h1>
          <p className="text-white/40">
            Track fixtures, results, and match details across leagues
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedMatch ? (
            <motion.article
              key={selectedMatch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <div className="relative">
                <div className="p-8 bg-[#151515] border-b border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setSelectedMatch(null)}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back to all matches
                    </button>
                    <button
                      onClick={() => setSelectedMatch(null)}
                      className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      {selectedMatch.home_team?.logo ? (
                        <Image
                          src={selectedMatch.home_team.logo}
                          alt={selectedMatch.home_team.name}
                          width={56}
                          height={56}
                          className="rounded-full object-contain"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white/60" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-white/60">Home</p>
                        <h2 className="text-2xl font-semibold">
                          {selectedMatch.home_team?.name || "Home Team"}
                        </h2>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-white/60 mb-1">Final / Live</p>
                      <div className="text-3xl font-bold">
                        {formatScore(selectedMatch)}
                      </div>
                      <p className="text-xs text-white/50 uppercase mt-1">
                        {selectedMatch.status}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 md:justify-end">
                      <div className="text-right">
                        <p className="text-sm text-white/60">Away</p>
                        <h2 className="text-2xl font-semibold">
                          {selectedMatch.away_team?.name || "Away Team"}
                        </h2>
                      </div>
                      {selectedMatch.away_team?.logo ? (
                        <Image
                          src={selectedMatch.away_team.logo}
                          alt={selectedMatch.away_team.name}
                          width={56}
                          height={56}
                          className="rounded-full object-contain"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white/60" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                      <Trophy className="w-3 h-3" />
                      {selectedMatch.league?.name || "League"}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(selectedMatch.scheduled_at)}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 p-4 bg-[#121212] rounded-lg border border-white/5">
                      <Tag className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-xs text-white/40">Competition</p>
                        <p className="text-sm">
                          {selectedMatch.competition || "League"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#121212] rounded-lg border border-white/5">
                      <Tag className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-xs text-white/40">Round</p>
                        <p className="text-sm">
                          {selectedMatch.round || "TBD"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#121212] rounded-lg border border-white/5">
                      <MapPin className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-xs text-white/40">Venue</p>
                        <p className="text-sm">
                          {selectedMatch.venue || "TBD"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#121212] rounded-lg border border-white/5">
                      <User className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-xs text-white/40">Referee</p>
                        <p className="text-sm">
                          {selectedMatch.referee || "TBD"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ) : (
            <motion.div
              key="matches-list"
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
                    Leagues
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedLeague(null)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedLeague === null
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">All Matches</span>
                    </button>
                    {leagues.map((league) => (
                      <button
                        key={league}
                        onClick={() => setSelectedLeague(league)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedLeague === league
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-medium">{league}</span>
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
                ) : filteredMatches.length > 0 ? (
                  <div className="grid gap-6">
                    {filteredMatches.map((match, index) => (
                      <motion.article
                        key={match.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#1a1a1a] rounded-xl overflow-hidden hover:bg-white/5 transition-colors duration-300 cursor-pointer"
                        onClick={() => setSelectedMatch(match)}
                      >
                        <div className="p-6">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-white">
                              {match.league?.name || "League"}
                            </span>
                            <span className="text-xs text-white/60">
                              {formatDateTime(match.scheduled_at)}
                            </span>
                            <span className="text-xs text-white/50 uppercase">
                              {match.status}
                            </span>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              {match.home_team?.logo ? (
                                <Image
                                  src={match.home_team.logo}
                                  alt={match.home_team.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-contain"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                  <Shield className="w-4 h-4 text-white/60" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm text-white/60">Home</p>
                                <p className="text-base font-medium truncate">
                                  {match.home_team?.name || "Home Team"}
                                </p>
                              </div>
                            </div>

                            <div className="text-center">
                              <p className="text-sm text-white/60">Score</p>
                              <p className="text-xl font-semibold">
                                {formatScore(match)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 min-w-0 md:justify-end">
                              <div className="text-right min-w-0">
                                <p className="text-sm text-white/60">Away</p>
                                <p className="text-base font-medium truncate">
                                  {match.away_team?.name || "Away Team"}
                                </p>
                              </div>
                              {match.away_team?.logo ? (
                                <Image
                                  src={match.away_team.logo}
                                  alt={match.away_team.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-contain"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                  <Shield className="w-4 h-4 text-white/60" />
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-white/60 mt-4">
                            {match.competition || "League"}{" "}
                            {match.round ? `• Round ${match.round}` : ""}
                          </p>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-white/60">No matches found.</p>
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

export default MatchesPage;
