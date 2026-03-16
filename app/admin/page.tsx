"use client";
import Loader from "@/components/ui/spinner";
import Image from "next/image";
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
  Cloud,
} from "lucide-react";
import { useToast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "./components/Select";
import { NumberInput } from "./components/NumberInput";
import { DateTimePicker } from "@/components/ui/DateTimePicker";

type Tab =
  | "teams"
  | "players"
  | "matches"
  | "leagues"
  | "news"
  | "gameweeks"
  | "images";

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
  tier: string;
  nationality: string;
  roblox_username?: string;
  market_value?: number;
  transfer_value?: number;
}

interface Match {
  id: string;
  league_id: string | null;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  home_difficulty: number;
  away_difficulty: number;
  away_score: number;
  status: string;
  competition: string;
  round: string;
  scheduled_at: string;
}

interface Gameweek {
  id: string;
  gameweek_number: number;
  season: string;
  start_date: string;
  end_date: string;
  deadline: string;
  status: string;
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
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    id: string;
    type: Tab;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<
    Team | Player | Match | League | News | Gameweek | null
  >(null);
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean | null>
  >({});
  const [currentGameweek, setCurrentGameweek] = useState<number>(1);
  const [gameweekPoints, setGameweekPoints] = useState<Record<string, number>>(
    {},
  );
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [fetchingAvatar, setFetchingAvatar] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cloudinaryImages, setCloudinaryImages] = useState<
    {
      publicId: string;
      url: string;
      width?: number;
      height?: number;
      description?: string;
    }[]
  >([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const fetchCloudinaryImages = async () => {
    setLoadingImages(true);
    try {
      const res = await fetch("/api/cloudinary?max_results=100");
      if (res.ok) {
        const data = await res.json();
        setCloudinaryImages(data.images || []);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setLoadingImages(false);
    }
  };

  const deleteCloudinaryImage = async (publicId: string) => {
    try {
      const res = await fetch("/api/cloudinary", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      if (res.ok) {
        setCloudinaryImages((prev) =>
          prev.filter((img) => img.publicId !== publicId),
        );
        toast({
          title: "Success",
          description: "Image deleted successfully!",
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "news");

      const res = await fetch("/api/cloudinary", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      if (data.image?.url) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.image.url,
        }));
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFromPreview = async () => {
    if (selectedImageFile) {
      await handleImageUpload(selectedImageFile);
      setImagePreview(null);
      setSelectedImageFile(null);
      setImageUploadOpen(false);
      fetchCloudinaryImages();
    }
  };

  const closeImageUploadDialog = () => {
    setImageUploadOpen(false);
    setImagePreview(null);
    setSelectedImageFile(null);
  };

  const fetchRobloxAvatar = async (username: string) => {
    if (!username || username.length < 3) return;

    setFetchingAvatar(true);
    try {
      const res = await fetch(
        `/api/roblox/avatar?username=${encodeURIComponent(username)}`,
      );

      if (!res.ok) {
        if (res.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Retrying in 5 seconds...",
            variant: "default",
          });
          setTimeout(() => fetchRobloxAvatar(username), 5000);
          return;
        }
        throw new Error("Failed to fetch Roblox data");
      }

      const data = await res.json();
      if (data.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          image: data.imageUrl,
          robloxUsername: username,
        }));
        toast({
          title: "Success",
          description: "Roblox headshot updated!",
          variant: "success",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingAvatar(false);
    }
  };

  useEffect(() => {
    const username = formData.robloxUsername as string;
    if (
      activeTab === "players" &&
      modalOpen &&
      username &&
      username.length >= 3
    ) {
      const timer = setTimeout(() => {
        fetchRobloxAvatar(username);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.robloxUsername, modalOpen, activeTab]);

  const parseTransferValue = (value: string): number => {
    if (!value) return 0;
    const upper = value.toUpperCase().trim();
    let multiplier = 1;

    if (upper.endsWith("M")) {
      multiplier = 1000000;
    } else if (upper.endsWith("K")) {
      multiplier = 1000;
    }

    const num = parseFloat(upper.replace(/[MK]/g, ""));
    if (isNaN(num)) return 0;

    return Math.round(num * multiplier);
  };

  const formatTransferValue = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "k";
    }
    return value.toString();
  };

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
      const [
        teamsRes,
        playersRes,
        matchesRes,
        leaguesRes,
        newsRes,
        gameweeksRes,
      ] = await Promise.all([
        fetch("/api/admin/teams"),
        fetch("/api/admin/players"),
        fetch("/api/admin/matches"),
        fetch("/api/admin/leagues"),
        fetch("/api/admin/news"),
        fetch("/api/admin/gameweeks"),
      ]);

      if (
        !teamsRes.ok ||
        !playersRes.ok ||
        !matchesRes.ok ||
        !leaguesRes.ok ||
        !newsRes.ok ||
        !gameweeksRes.ok
      ) {
        throw new Error("One or more API calls failed");
      }

      const teamsData = await teamsRes.json();
      const playersData = await playersRes.json();
      const matchesData = await matchesRes.json();
      const leaguesData = await leaguesRes.json();
      const newsData = await newsRes.json();
      const gameweeksData = await gameweeksRes.json();
      setTeams(teamsData.teams || []);
      setPlayers(playersData.players || []);
      setMatches(matchesData.matches || []);
      setLeagues(leaguesData.leagues || []);
      setNews(newsData.news || []);
      setGameweeks(gameweeksData.gameweeks || []);
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

  useEffect(() => {
    if (activeTab === "players" && isAuthenticated && isAdmin) {
      fetchGameweekPoints();
    }
  }, [currentGameweek, activeTab, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (activeTab === "images" && isAuthenticated && isAdmin) {
      fetchCloudinaryImages();
    }
  }, [activeTab, isAuthenticated, isAdmin]);

  const fetchGameweekPoints = async () => {
    setLoadingPoints(true);
    try {
      const pointsData: Record<string, number> = {};

      for (const player of players) {
        const res = await fetch(
          `/api/admin/player-points?playerId=${player.id}&gameweek=${currentGameweek}`,
        );
        const data = await res.json();
        if (data.points && data.points.length > 0) {
          pointsData[player.id] = data.points[0].gw_points;
        } else {
          pointsData[player.id] = 0;
        }
      }

      setGameweekPoints(pointsData);
    } catch (err) {
      console.error("Failed to fetch gameweek points:", err);
    } finally {
      setLoadingPoints(false);
    }
  };

  const handleAdd = (type: Tab) => {
    setEditingItem(null);
    setFormData({});
    setModalOpen(true);
  };

  const handleEdit = (
    item: Team | Player | Match | League | News | Gameweek,
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
        tier: player.tier,
        nationality: player.nationality,
        marketValue: player.market_value ?? 0,
        transferValue: formatTransferValue(player.transfer_value ?? 0),
        transferValueRaw: player.transfer_value ?? 0,
        gameweekPoints: gameweekPoints[player.id] ?? 0,
        robloxUsername: player.roblox_username || "",
      });
    } else if (type === "matches") {
      const match = item as Match;
      setFormData({
        id: match.id,
        leagueId: match.league_id,
        homeTeamId: match.home_team_id,
        awayTeamId: match.away_team_id,
        homeScore: match.home_score ?? 0,
        awayScore: match.away_score ?? 0,
        status: match.status,
        homeDifficulty: match.home_difficulty ?? 3,
        awayDifficulty: match.away_difficulty ?? 3,
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
    } else if (type === "gameweeks") {
      const gw = item as Gameweek;
      setFormData({
        id: gw.id,
        gameweekNumber: gw.gameweek_number,
        season: gw.season,
        startDate: gw.start_date,
        endDate: gw.end_date,
        deadline: gw.deadline,
        status: gw.status,
      });
    }

    setModalOpen(true);
  };

  const handleDelete = async (id: string, type: Tab) => {
    setShowDeleteConfirm({ id, type });
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    const { id, type } = showDeleteConfirm;

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
    } finally {
      setShowDeleteConfirm(null);
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
          tier: formData.tier,
          nationality: formData.nationality,
          robloxUsername: formData.robloxUsername,
          marketValue: formData.marketValue,
          transferValue: formData.transferValueRaw
            ? parseFloat(formData.transferValueRaw as string)
            : parseTransferValue(String(formData.transferValue)),
        };
      } else if (type === "matches") {
        body = {
          id: formData.id,
          leagueId: formData.leagueId,
          homeTeamId: formData.homeTeamId,
          awayTeamId: formData.awayTeamId,
          homeScore: formData.homeScore,
          awayScore: formData.awayScore,
          status: formData.status,
          homeDifficulty: formData.homeDifficulty,
          awayDifficulty: formData.awayDifficulty,
          competition: formData.competition,
          round: formData.round,
          scheduledAt: formData.scheduledAt,
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
      } else if (type === "gameweeks") {
        body = {
          id: formData.id,
          gameweekNumber: formData.gameweekNumber,
          season: formData.season,
          startDate: formData.startDate,
          endDate: formData.endDate,
          deadline: formData.deadline,
          status: formData.status,
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

      let savedPlayerId = formData.id;

      if (res.ok) {
        const resData = await res.json();
        if (!isEditing && type === "players" && resData.player?.id) {
          savedPlayerId = resData.player.id;
        }

        if (
          type === "players" &&
          formData.gameweekPoints !== undefined &&
          savedPlayerId
        ) {
          try {
            await fetch("/api/admin/player-points", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                playerId: savedPlayerId,
                gameweek: currentGameweek,
                points: formData.gameweekPoints,
              }),
            });
          } catch (err) {
            console.error("Failed to save gameweek points:", err);
          }
        }

        fetchData();
        setModalOpen(false);

        let itemName = "";
        if (type === "teams") itemName = formData.name as string;
        else if (type === "leagues") itemName = formData.name as string;
        else if (type === "players") itemName = formData.name as string;
        else if (type === "matches")
          itemName = `${formData.homeTeamId} vs ${formData.awayTeamId}`;
        else if (type === "news") itemName = formData.title as string;
        else if (type === "gameweeks")
          itemName = `GW ${formData.gameweekNumber}`;

        toast({
          title: "Success",
          description: isEditing
            ? itemName
              ? `${itemName} updated successfully`
              : `${type.slice(0, -1)} updated successfully`
            : itemName
              ? `${itemName} created successfully`
              : `${type === "news" ? "News article" : type.slice(0, -1)} created successfully`,
          variant: "success",
        });
      } else {
        const errorData = await res.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to save",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <Loader size="sm" />
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
            href="https://rff.giize.com/"
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
            <Image
              src="/rffshort.png"
              draggable={false}
              alt="Real Futbol Fantasy"
              width={80}
              height={80}
            />
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
                    : activeTab === "gameweeks"
                      ? "Gameweek"
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
            { id: "gameweeks", label: "Gameweeks", icon: Calendar },
            { id: "images", label: "Images", icon: Cloud },
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
              <div className="p-4 border-b border-white/10 flex items-center gap-4">
                <label className="text-sm text-white/60">
                  Select Gameweek:
                </label>
                <div className="w-40">
                  <Select
                    value={currentGameweek.toString()}
                    onChange={(value) => setCurrentGameweek(parseInt(value))}
                    options={
                      gameweeks.length > 0
                        ? gameweeks.map((gw) => ({
                            value: gw.gameweek_number.toString(),
                            label: `GW ${gw.gameweek_number}`,
                          }))
                        : Array.from({ length: 11 }, (_, i) => ({
                            value: (i + 1).toString(),
                            label: `Gameweek ${i + 1}`,
                          }))
                    }
                  />
                </div>
              </div>
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
                      Tier
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Transfer Value
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      GW {currentGameweek} Points
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
                        <td className="p-4 text-white/60">
                          {player.tier ? `${player.tier} Class` : "No Tier"}
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-400 font-medium">
                            {player.transfer_value
                              ? `${(player.transfer_value / 1000000).toFixed(1)}M`
                              : player.market_value
                                ? `${(player.market_value / 1000000).toFixed(1)}M`
                                : "Free"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-lg bg-blue-900/30 text-blue-400 font-medium">
                            {gameweekPoints[player.id] ?? 0}
                          </span>
                        </td>
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

          {activeTab === "gameweeks" && (
            <motion.div
              key="gameweeks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">
                      GW #
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Season
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Start Date
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      End Date
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Deadline
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">
                      Status
                    </th>
                    <th className="text-right p-4 text-white/60 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gameweeks.map((gw) => (
                    <tr
                      key={gw.id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4 text-white font-medium">
                        GW {gw.gameweek_number}
                      </td>
                      <td className="p-4 text-white/60">{gw.season}</td>
                      <td className="p-4 text-white/60">
                        {new Date(gw.start_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-white/60">
                        {new Date(gw.end_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-white/60">
                        {new Date(gw.deadline).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            gw.status === "active"
                              ? "bg-green-600/20 text-green-400"
                              : gw.status === "completed"
                                ? "bg-gray-600/20 text-gray-400"
                                : "bg-yellow-600/20 text-yellow-400"
                          }`}
                        >
                          {gw.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(gw, "gameweeks")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white/40" />
                          </button>
                          <button
                            onClick={() => handleDelete(gw.id, "gameweeks")}
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
              {gameweeks.length === 0 && (
                <div className="p-8 text-center text-white/40">
                  No gameweeks added yet. Click "Add Gameweek" to get started.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "images" && (
            <motion.div
              key="images"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">
                    Cloudinary Images
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImageUploadOpen(true)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Image
                    </button>
                    <button
                      onClick={fetchCloudinaryImages}
                      disabled={loadingImages}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loadingImages ? "Loading..." : "Refresh"}
                    </button>
                  </div>
                </div>
              </div>
              {loadingImages ? (
                <div className="p-8 text-center text-white/40">
                  Loading images...
                </div>
              ) : cloudinaryImages.length === 0 ? (
                <div className="p-8 text-center text-white/40">
                  No images found. Upload images from the News tab.
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cloudinaryImages.map((img) => (
                    <div
                      key={img.publicId}
                      className="relative group bg-white/5 rounded-lg overflow-hidden aspect-square"
                    >
                      <img
                        src={img.url}
                        alt={img.description || "Cloudinary image"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(img.url);
                            toast({
                              title: "Copied",
                              description: "Image URL copied to clipboard",
                              variant: "success",
                            });
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          title="Copy URL"
                        >
                          <FileText className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => setDeletingImage(img.publicId)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                      {img.description && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate">
                          {img.description}
                        </div>
                      )}
                    </div>
                  ))}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(activeTab);
                  }
                }}
                tabIndex={-1}
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
                              { value: "CB", label: "Centre-Back" },
                              { value: "LB", label: "Left-Back" },
                              { value: "RB", label: "Right-Back" },
                              { value: "CDM", label: "Defensive Midfielder" },
                              { value: "CM", label: "Centre Midfielder" },
                              { value: "CAM", label: "Attacking Midfielder" },
                              { value: "LM", label: "Left Midfielder" },
                              { value: "RM", label: "Right Midfielder" },
                              { value: "LW", label: "Left Wing" },
                              { value: "RW", label: "Right Wing" },
                              { value: "ST", label: "Striker" },
                              { value: "CF", label: "Centre Forward" },
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Tier
                          </label>
                          <Select
                            value={(formData.tier as string) || ""}
                            onChange={(value) =>
                              setFormData({ ...formData, tier: value })
                            }
                            options={[
                              { value: "", label: "Select Tier" },
                              { value: "X", label: "X Class" },
                              { value: "S", label: "S Class" },
                              { value: "A+", label: "A+ Class" },
                              { value: "A", label: "A Class" },
                              { value: "A-", label: "A- Class" },
                              { value: "B+", label: "B+ Class" },
                              { value: "B", label: "B Class" },
                              { value: "B-", label: "B- Class" },
                              { value: "C+", label: "C+ Class" },
                              { value: "C", label: "C Class" },
                              { value: "C-", label: "C- Class" },
                              { value: "D+", label: "D+ Class" },
                              { value: "D", label: "D Class" },
                              { value: "D-", label: "D- Class" },
                            ]}
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
                            value={(formData.image as string) || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                image: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-white/60 mb-1 flex justify-between">
                            Roblox Username
                            {fetchingAvatar && (
                              <span className="text-blue-400 text-xs animate-pulse">
                                Fetching...
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={(formData.robloxUsername as string) || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                robloxUsername: e.target.value,
                              })
                            }
                            placeholder="Username"
                            className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                          />
                        </div>
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

                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Gameweek {currentGameweek} Points
                        </label>
                        <NumberInput
                          value={(formData.gameweekPoints as number) ?? 0}
                          onChange={(val) =>
                            setFormData({ ...formData, gameweekPoints: val })
                          }
                          min={0}
                          max={999}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Transfer Value (e.g., 100k, 1m, 10m)
                        </label>
                        <input
                          type="text"
                          value={(formData.transferValue as string) || ""}
                          onChange={(e) => {
                            const val = parseTransferValue(e.target.value);
                            setFormData({
                              ...formData,
                              transferValue: formatTransferValue(val),
                              transferValueRaw: val,
                            });
                          }}
                          placeholder="100k, 500k, 1m, 10m..."
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white text-lg"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === "gameweeks" && (
                    <>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Gameweek Number (1-15)
                        </label>
                        <NumberInput
                          value={(formData.gameweekNumber as number) ?? 1}
                          onChange={(val) =>
                            setFormData({ ...formData, gameweekNumber: val })
                          }
                          min={1}
                          max={15}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Season
                        </label>
                        <input
                          type="text"
                          value={(formData.season as string) || "2025/2026"}
                          onChange={(e) =>
                            setFormData({ ...formData, season: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Start Date
                        </label>
                        <DateTimePicker
                          date={
                            formData.startDate
                              ? new Date(formData.startDate as string)
                              : null
                          }
                          setDate={(date) =>
                            setFormData({
                              ...formData,
                              startDate: date ? date.toISOString() : null,
                            })
                          }
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          End Date
                        </label>
                        <DateTimePicker
                          date={
                            formData.endDate
                              ? new Date(formData.endDate as string)
                              : null
                          }
                          setDate={(date) =>
                            setFormData({
                              ...formData,
                              endDate: date ? date.toISOString() : null,
                            })
                          }
                          placeholder="Select end date"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Deadline (Friday)
                        </label>
                        <DateTimePicker
                          date={
                            formData.deadline
                              ? new Date(formData.deadline as string)
                              : null
                          }
                          setDate={(date) =>
                            setFormData({
                              ...formData,
                              deadline: date ? date.toISOString() : null,
                            })
                          }
                          placeholder="Select deadline"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Status
                        </label>
                        <Select
                          value={(formData.status as string) || "upcoming"}
                          onChange={(value) =>
                            setFormData({ ...formData, status: value })
                          }
                          options={[
                            { value: "upcoming", label: "Upcoming" },
                            { value: "active", label: "Active" },
                            { value: "closed", label: "Closed" },
                            { value: "completed", label: "Completed" },
                          ]}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === "matches" && (
                    <>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          League
                        </label>
                        <Select
                          value={(formData.leagueId as string) || ""}
                          onChange={(value) =>
                            setFormData({ ...formData, leagueId: value })
                          }
                          options={[
                            { value: "", label: "Select League" },
                            ...leagues.map((league) => ({
                              value: league.id,
                              label: league.name,
                            })),
                          ]}
                        />
                      </div>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Home Difficulty (1-5)
                          </label>
                          <NumberInput
                            value={(formData.homeDifficulty as number) ?? 3}
                            onChange={(val) =>
                              setFormData({ ...formData, homeDifficulty: val })
                            }
                            min={1}
                            max={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">
                            Away Difficulty (1-5)
                          </label>
                          <NumberInput
                            value={(formData.awayDifficulty as number) ?? 3}
                            onChange={(val) =>
                              setFormData({ ...formData, awayDifficulty: val })
                            }
                            min={1}
                            max={5}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">
                          Scheduled Date
                        </label>
                        <DateTimePicker
                          date={
                            formData.scheduledAt
                              ? new Date(formData.scheduledAt as string)
                              : null
                          }
                          setDate={(date) =>
                            setFormData({
                              ...formData,
                              scheduledAt: date ? date.toISOString() : null,
                            })
                          }
                          placeholder="Select scheduled date"
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
                            Image
                          </label>
                          <div className="space-y-2">
                            {formData.imageUrl && (
                              <div className="relative w-full h-32 bg-white/5 rounded-lg overflow-hidden">
                                <img
                                  src={formData.imageUrl as string}
                                  alt="Preview"
                                  className="w-full h-full object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({ ...formData, imageUrl: null })
                                  }
                                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            )}
                            <label className="flex items-center justify-center w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file);
                                  }
                                }}
                                disabled={uploadingImage}
                              />
                              {uploadingImage ? (
                                <span className="text-white/60">
                                  Uploading...
                                </span>
                              ) : (
                                <span className="text-white/60">
                                  {formData.imageUrl
                                    ? "Replace Image"
                                    : "Upload Image"}
                                </span>
                              )}
                            </label>
                          </div>
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

        <Dialog
          open={!!showDeleteConfirm}
          onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        >
          <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p className="text-white/70 py-4">
              Are you sure you want to delete this{" "}
              {showDeleteConfirm?.type.slice(0, -1)}? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!deletingImage}
          onOpenChange={(open) => !open && setDeletingImage(null)}
        >
          <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p className="text-white/70 py-4">
              Are you sure you want to delete this image? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setDeletingImage(null)}
                className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletingImage) {
                    deleteCloudinaryImage(deletingImage);
                    setDeletingImage(null);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={imageUploadOpen}
          onOpenChange={(open) => !open && closeImageUploadDialog()}
        >
          <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {imagePreview ? (
                <div className="relative w-full aspect-video bg-white/5 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 transition-colors cursor-pointer bg-white/5">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileSelect}
                  />
                  <Cloud className="w-12 h-12 text-white/40 mb-2" />
                  <span className="text-white/60">
                    Click to select an image
                  </span>
                </label>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={closeImageUploadDialog}
                  className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadFromPreview}
                  disabled={!selectedImageFile || uploadingImage}
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
