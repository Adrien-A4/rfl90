"use client";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  Calendar,
  Plus,
  Trash2,
  Edit,
  X,
  Trophy,
  Lock,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/ui/sonner";
import { Select } from "./components/Select";
import { NumberInput } from "./components/NumberInput";

type Tab = "teams" | "players" | "matches" | "leagues" | "news";

interface AuthUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
}

interface League {
  id: string;
  name: string;
  short_name: string;
  logo: string;
  country: string;
  tier: number;
  season: string;
}

interface Team {
  id: string;
  name: string;
  short_name: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
}

interface Player {
  id: string;
  name: string;
  short_name: string;
  image: string;
  team_id: string;
  position: string;
  rating: number;
  age: number;
  nationality: string;
}

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: string;
  competition: string;
  round: string;
  scheduled_at: string;
}

interface News {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("teams");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    Team | Player | Match | League | News | null
  >(null);
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean | null>
  >({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/admin-check");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      setIsAdmin(data.isAdmin);
      setUser(data.user);
      if (!data.authenticated || !data.isAdmin) {
        toast({
          title: "Access Denied",
          description: data.authenticated
            ? "You don't have admin permissions."
            : "Please sign in to access the admin panel.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      toast({
        title: "Error",
        description: "Failed to verify admin permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!isAuthenticated || !isAdmin) return;

    try {
      const [teamsRes, playersRes, matchesRes, leaguesRes, newsRes] =
        await Promise.all([
          fetch("/api/admin/teams"),
          fetch("/api/admin/players"),
          fetch("/api/admin/matches"),
          fetch("/api/admin/leagues"),
          fetch("/api/admin/news"),
        ]);
      const teamsData = await teamsRes.json();
      const playersData = await playersRes.json();
      const matchesData = await matchesRes.json();
      const leaguesData = await leaguesRes.json();
      const newsData = await newsRes.json();
      setTeams(teamsData.teams || []);
      setPlayers(playersData.players || []);
      setMatches(matchesData.matches || []);
      setLeagues(leaguesData.leagues || []);
      setNews(newsData.news || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin]);

  const handleAdd = (type: Tab) => {
    setEditingItem(null);
    setFormData({});
    setModalOpen(true);
  };

  const handleEdit = (
    item: Team | Player | Match | League | News,
    type: Tab,
  ) => {
    setEditingItem(item);

    if (type === "teams") {
      const team = item as Team;
      setFormData({
        id: team.id,
        name: team.name,
        shortName: team.short_name,
        logo: team.logo,
        primaryColor: team.primary_color,
        secondaryColor: team.secondary_color,
      });
    } else if (type === "leagues") {
      const league = item as League;
      setFormData({
        id: league.id,
        name: league.name,
        shortName: league.short_name,
        logo: league.logo,
        country: league.country,
        tier: league.tier,
        season: league.season,
      });
    } else if (type === "players") {
      const player = item as Player;
      setFormData({
        id: player.id,
        name: player.name,
        shortName: player.short_name,
        image: player.image,
        teamId: player.team_id,
        position: player.position,
        rating: player.rating,
        age: player.age,
        nationality: player.nationality,
      });
    } else if (type === "matches") {
      const match = item as Match;
      setFormData({
        id: match.id,
        homeTeamId: match.home_team_id,
        awayTeamId: match.away_team_id,
        homeScore: match.home_score ?? 0,
        awayScore: match.away_score ?? 0,
        status: match.status,
        competition: match.competition,
        round: match.round,
        scheduledAt: match.scheduled_at,
      });
    } else if (type === "news") {
      const newsItem = item as News;
      setFormData({
        id: newsItem.id,
        title: newsItem.title,
        content: newsItem.content,
        imageUrl: newsItem.image_url,
        author: newsItem.author,
        category: newsItem.category,
        isPublished: newsItem.is_published,
        publishedAt: newsItem.published_at,
      });
    }

    setModalOpen(true);
  };

  const handleDelete = async (id: string, type: Tab) => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`))
      return;

    try {
      const res = await fetch(`/api/admin/${type.slice(0, -1)}s?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
        toast({
          title: "Success",
          description: `${type.slice(0, -1)} deleted successfully`,
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (type: Tab) => {
    try {
      const isEditing = !!editingItem;

      let body: Record<string, unknown> = { ...formData };

      if (type === "teams") {
        body = {
          id: formData.id,
          name: formData.name,
          shortName: formData.shortName,
          logo: formData.logo,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        };
      } else if (type === "leagues") {
        body = {
          id: formData.id,
          name: formData.name,
          shortName: formData.shortName,
          logo: formData.logo,
          country: formData.country,
          tier: formData.tier,
          season: formData.season,
        };
      } else if (type === "players") {
        body = {
          id: formData.id,
          name: formData.name,
          shortName: formData.shortName,
          image: formData.image,
          teamId: formData.teamId,
          position: formData.position,
          rating: formData.rating,
          age: formData.age,
          nationality: formData.nationality,
        };
      } else if (type === "matches") {
        body = {
          id: formData.id,
          home_team_id: formData.homeTeamId,
          away_team_id: formData.awayTeamId,
          home_score: formData.homeScore,
          away_score: formData.awayScore,
          status: formData.status,
          competition: formData.competition,
          round: formData.round,
          scheduled_at: formData.scheduledAt,
        };
      } else if (type === "news") {
        body = {
          id: formData.id,
          title: formData.title,
          content: formData.content,
          image_url: formData.imageUrl,
          author: formData.author,
          category: formData.category,
          is_published: formData.isPublished,
          published_at: formData.publishedAt,
        };
      }

      const res = await fetch(
        `/api/admin/${type === "leagues" ? "leagues" : type === "news" ? "news" : type.slice(0, -1) + "s"}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        fetchData();
        setModalOpen(false);
        toast({
          title: "Success",
          description: isEditing
            ? `${type.slice(0, -1)} updated successfully`
            : `${type === "news" ? "News article" : type.slice(0, -1)} created successfully`,
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D3D3D3] flex items-center justify-center">
        <Spinner size={8} />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="bg-[#1a1a1a] rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60 mb-6">
            {!isAuthenticated
              ? "Please sign in with Discord to access the admin panel."
              : "You don't have administrator permissions to access this page."}
          </p>
          {user && (
            <div className="flex items-center justify-center gap-3 mb-6 p-3 bg-[#0d0d0d] rounded-lg">
              {user.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10" />
              )}
              <span className="text-white">{user.username}</span>
            </div>
          )}
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            {user && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] rounded-full">
                {user.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt={user.username}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white/10" />
                )}
                <span className="text-sm text-white/60">{user.username}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAdd(activeTab)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors min-w-35"
            >
              <Plus className="w-4 h-4" />
              Add{" "}
              {activeTab === "matches"
                ? "Match"
                : activeTab === "leagues"
                  ? "League"
                  : activeTab === "news"
                    ? "News"
                    : activeTab.slice(0, -1)}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "teams", label: "Teams", icon: Trophy },
            { id: "leagues", label: "Leagues", icon: Shield },
            { id: "players", label: "Players", icon: Users },
            { id: "matches", label: "Matches", icon: Calendar },
            { id: "news", label: "News", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "bg-[#1a1a1a] text-white/60 hover:bg-[#2a2a2a]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "teams" && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">
                      Name
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Short
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Color
                    </th>
                    <th className="text-right p-4 text-white/60 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr
                      key={team.id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                            {team.logo ? (
                              <img
                                src={team.logo}
                                alt={team.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span
                                className="text-xs font-bold"
                                style={{
                                  backgroundColor: team.primary_color,
                                  color: team.secondary_color,
                                }}
                              >
                                {team.short_name}
                              </span>
                            )}
                          </div>
                          <span className="text-white font-medium">
                            {team.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-white/60">{team.short_name}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: team.primary_color }}
                          />
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: team.secondary_color }}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(team, "teams")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white/40" />
                          </button>
                          <button
                            onClick={() => handleDelete(team.id, "teams")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {teams.length === 0 && (
                <div className="p-8 text-center text-white/40">
                  No teams added yet. Click "Add Team" to get started.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "leagues" && (
            <motion.div
              key="leagues"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">
                      Logo
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Name
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Short
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Country
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Tier
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Season
                    </th>
                    <th className="text-right p-4 text-white/60 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leagues.map((league) => (
                    <tr
                      key={league.id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                          {league.logo ? (
                            <img
                              src={league.logo}
                              alt={league.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-white/40">
                              {league.short_name?.slice(0, 2) || "?"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-white font-medium">
                        {league.name}
                      </td>
                      <td className="p-4 text-white/60">{league.short_name}</td>
                      <td className="p-4 text-white/60">{league.country}</td>
                      <td className="p-4 text-white/60">{league.tier}</td>
                      <td className="p-4 text-white/60">{league.season}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(league, "leagues")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white/40" />
                          </button>
                          <button
                            onClick={() => handleDelete(league.id, "leagues")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leagues.length === 0 && (
                <div className="p-8 text-center text-white/40">
                  No leagues added yet. Click "Add League" to get started.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "players" && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">
                      Name
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Team
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Position
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Rating
                    </th>
                    <th className="text-right p-4 text-white/60 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => {
                    const team = teams.find((t) => t.id === player.team_id);
                    return (
                      <tr
                        key={player.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                              {player.image ? (
                                <img
                                  src={player.image}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold">
                                  {player.short_name?.slice(0, 2) || "?"}
                                </span>
                              )}
                            </div>
                            <span className="text-white font-medium">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
                              style={{
                                backgroundColor:
                                  team?.primary_color || "#1a1a1a",
                              }}
                            >
                              {team?.logo ? (
                                <img
                                  src={team.logo}
                                  alt={team.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span
                                  className="text-xs font-bold"
                                  style={{
                                    color: team?.secondary_color || "#fff",
                                  }}
                                >
                                  {team?.short_name?.slice(0, 2) || "?"}
                                </span>
                              )}
                            </div>
                            <span className="text-white/60">{team?.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              player.position === "GK"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : player.position === "DEF"
                                  ? "bg-blue-900/30 text-blue-400"
                                  : player.position === "MID"
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {player.position}
                          </span>
                        </td>
                        <td className="p-4 text-white/60">{player.rating}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(player, "players")}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-white/40" />
                            </button>
                            <button
                              onClick={() => handleDelete(player.id, "players")}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {players.length === 0 && (
                <div className="p-8 text-center text-white/40">
                  No players added yet. Click "Add Player" to get started.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "matches" && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">
                      Home
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Away
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Score
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Status
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Date
                    </th>
                    <th className="text-right p-4 text-white/60 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => {
                    const homeTeam = teams.find(
                      (t) => t.id === match.home_team_id,
                    );
                    const awayTeam = teams.find(
                      (t) => t.id === match.away_team_id,
                    );
                    return (
                      <tr
                        key={match.id}
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                        onClick={() => router.push(`/match/${match.id}`)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                              {homeTeam?.logo ? (
                                <img
                                  src={homeTeam.logo}
                                  alt={homeTeam.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-xs font-bold"
                                  style={{
                                    backgroundColor:
                                      homeTeam?.primary_color || "#1a1a1a",
                                    color:
                                      homeTeam?.secondary_color || "#2a2a2a",
                                  }}
                                >
                                  {homeTeam?.short_name?.slice(0, 2) || "?"}
                                </div>
                              )}
                            </div>
                            <span className="text-white">
                              {homeTeam?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                              {awayTeam?.logo ? (
                                <img
                                  src={awayTeam.logo}
                                  alt={awayTeam.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-xs font-bold"
                                  style={{
                                    backgroundColor:
                                      awayTeam?.primary_color || "#1a1a1a",
                                    color:
                                      awayTeam?.secondary_color || "#2a2a2a",
                                  }}
                                >
                                  {awayTeam?.short_name?.slice(0, 2) || "?"}
                                </div>
                              )}
                            </div>
                            <span className="text-white">
                              {awayTeam?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {match.status === "finished" ? (
                            <span className="text-white font-medium">
                              {match.home_score} - {match.away_score}
                            </span>
                          ) : (
                            <span className="text-white/40">vs</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              match.status === "live"
                                ? "bg-green-900/30 text-green-400"
                                : match.status === "finished"
                                  ? "bg-white/10 text-white/60"
                                  : "bg-blue-900/30 text-blue-400"
                            }`}
                          >
                            {match.status}
                          </span>
                        </td>
                        <td className="p-4 text-white/60 text-sm">
                          {new Date(match.scheduled_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(match, "matches")}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-white/40" />
                            </button>
                            <button
                              onClick={() => handleDelete(match.id, "matches")}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {matches.length === 0 && (
                <div className="p-8 text-center text-white/40">
                  No matches added yet. Click "Add Match" to get started.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "news" && (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">
                      Title
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Author
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Category
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Status
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Date
                    </th>
                    <th className="text-right p-4 text-white/60 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((newsItem) => (
                    <tr
                      key={newsItem.id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {newsItem.image_url && (
                            <div className="w-10 h-10 rounded overflow-hidden bg-white/10">
                              <img
                                src={newsItem.image_url}
                                alt={newsItem.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-white font-medium truncate max-w-xs">
                            {newsItem.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-white/60">{newsItem.author}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
                          {newsItem.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${newsItem.is_published ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"}`}
                        >
                          {newsItem.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(newsItem.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(newsItem, "news")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white/40" />
                          </button>
                          <button
                            onClick={() => handleDelete(newsItem.id, "news")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {news.length === 0 && (
                <div className="p-8 text-center text-white/40">
                  No news articles added yet. Click "Add News" to get started.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {editingItem ? "Edit" : "Add"}{" "}
                    {activeTab === "leagues"
                      ? "League"
                      : activeTab === "news"
                        ? "News Article"
                        : activeTab.slice(0, -1)}
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>

                <div className="space-y-4">
                  {activeTab === "teams" && (
                    <>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={(formData.name as string) || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Short Name
                        </label>
                        <input
                          type="text"
                          value={(formData.shortName as string) || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shortName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Logo URL
                        </label>
                        <input
                          type="text"
                          value={(formData.logo as string) || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, logo: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Primary Color
                          </label>
                          <input
                            type="color"
                            value={
                              (formData.primaryColor as string) || "#1a1a1a"
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                primaryColor: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Secondary Color
                          </label>
                          <input
                            type="color"
                            value={
                              (formData.secondaryColor as string) || "#2a2a2a"
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                secondaryColor: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "leagues" && (
                    <>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={(formData.name as string) || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Short Name
                        </label>
                        <input
                          type="text"
                          value={(formData.shortName as string) || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shortName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Logo URL
                        </label>
                        <input
                          type="text"
                          value={(formData.logo as string) || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, logo: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={(formData.country as string) || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Tier
                          </label>
                          <NumberInput
                            value={(formData.tier as number) ?? 1}
                            onChange={(val) =>
                              setFormData({ ...formData, tier: val })
                            }
                            min={1}
                            max={10}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Season
                          </label>
                          <input
                            type="text"
                            value={(formData.season as string) || "2024-2025"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                season: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "players" && (
                    <>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={(formData.name as string) || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Position
                          </label>
                          <Select
                            value={(formData.position as string) || ""}
                            onChange={(value) =>
                              setFormData({ ...formData, position: value })
                            }
                            options={[
                              { value: "", label: "Select Position" },
                              { value: "GK", label: "Goalkeeper" },
                              { value: "DEF", label: "Defender" },
                              { value: "MID", label: "Midfielder" },
                              { value: "FWD", label: "Forward" },
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Rating
                          </label>
                          <NumberInput
                            value={(formData.rating as number) ?? 75}
                            onChange={(val) =>
                              setFormData({ ...formData, rating: val })
                            }
                            min={1}
                            max={99}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Team
                        </label>
                        <Select
                          value={(formData.teamId as string) || ""}
                          onChange={(value) =>
                            setFormData({ ...formData, teamId: value })
                          }
                          options={[
                            { value: "", label: "Select Team" },
                            ...teams.map((team) => ({
                              value: team.id,
                              label: team.name,
                            })),
                          ]}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Picture URL
                          </label>
                          <input
                            type="text"
                            value={(formData.pictureUrl as string) || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pictureUrl: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Nationality
                          </label>
                          <input
                            type="text"
                            value={(formData.nationality as string) || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                nationality: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "matches" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Home Team
                          </label>
                          <Select
                            value={(formData.homeTeamId as string) || ""}
                            onChange={(value) =>
                              setFormData({ ...formData, homeTeamId: value })
                            }
                            options={[
                              { value: "", label: "Select Team" },
                              ...teams.map((team) => ({
                                value: team.id,
                                label: team.name,
                              })),
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Away Team
                          </label>
                          <Select
                            value={(formData.awayTeamId as string) || ""}
                            onChange={(value) =>
                              setFormData({ ...formData, awayTeamId: value })
                            }
                            options={[
                              { value: "", label: "Select Team" },
                              ...teams.map((team) => ({
                                value: team.id,
                                label: team.name,
                              })),
                            ]}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Home Score
                          </label>
                          <NumberInput
                            value={(formData.homeScore as number) ?? 0}
                            onChange={(val) =>
                              setFormData({ ...formData, homeScore: val })
                            }
                            min={0}
                            max={99}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Away Score
                          </label>
                          <NumberInput
                            value={(formData.awayScore as number) ?? 0}
                            onChange={(val) =>
                              setFormData({ ...formData, awayScore: val })
                            }
                            min={0}
                            max={99}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Status
                        </label>
                        <Select
                          value={(formData.status as string) || "scheduled"}
                          onChange={(value) =>
                            setFormData({ ...formData, status: value })
                          }
                          options={[
                            { value: "scheduled", label: "Scheduled" },
                            { value: "live", label: "Live" },
                            { value: "finished", label: "Finished" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Competition
                        </label>
                        <input
                          type="text"
                          value={(formData.competition as string) || "League"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              competition: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Round
                        </label>
                        <input
                          type="text"
                          value={(formData.round as string) || "1"}
                          onChange={(e) =>
                            setFormData({ ...formData, round: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Scheduled Date
                        </label>
                        <input
                          type="datetime-local"
                          value={
                            formData.scheduledAt
                              ? new Date(formData.scheduledAt as string)
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scheduledAt: new Date(
                                e.target.value,
                              ).toISOString(),
                            })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === "news" && (
                    <>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={(formData.title as string) || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Content
                        </label>
                        <textarea
                          value={(formData.content as string) || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              content: e.target.value,
                            })
                          }
                          rows={5}
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={(formData.imageUrl as string) || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                imageUrl: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={(formData.category as string) || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                category: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Author
                          </label>
                          <input
                            type="text"
                            value={(formData.author as string) || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                author: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Published Date
                          </label>
                          <input
                            type="datetime-local"
                            value={
                              formData.publishedAt
                                ? new Date(formData.publishedAt as string)
                                    .toISOString()
                                    .slice(0, 16)
                                : ""
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                publishedAt: e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : null,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.isPublished as boolean) || false}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isPublished: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded border-white/20 bg-[#0d0d0d]"
                          />
                          <span className="text-sm text-white/60">
                            Published
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit(activeTab)}
                    className="flex-1 px-4 py-2 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 transition-colors"
                  >
                    {editingItem ? "Update" : "Create"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
