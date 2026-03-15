"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  X,
  Search,
  XCircle,
  Shuffle,
  RefreshCcw,
  Rocket,
  Crown,
  Clock,
} from "lucide-react";
import {
  formations,
  getFormationByName,
  INITIAL_BUDGET,
  FREE_TRANSFERS_PER_GW,
  TRANSFER_PENALTY_PER_EXTRA,
  Formation,
} from "@/lib/formations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/ui/spinner";

interface Player {
  id: string;
  name: string;
  short_name: string;
  image: string;
  position: string;
  tier: string;
  team_id: string;
  transfer_value: number;
  total_points?: number;
  team?: {
    id: string;
    name: string;
    short_name: string;
    logo: string;
    primary_color: string;
    secondary_color: string;
  };
  isInSquad?: boolean;
}

interface UserPlayer {
  id: string;
  player_id: string;
  squad_position: string;
  slot_id?: string;
  is_starting: boolean;
  position_in_squad: number;
  purchase_price: number;
  player: Player;
}

interface UserTeam {
  id: string;
  user_id: string;
  team_name: string;
  budget: number;
  formation: string;
  gameweek: number;
  total_points: number;
  transfers_this_gw: number;
  transfer_penalty_points: number;
  captain_id?: string;
  vice_captain_id?: string;
  players?: UserPlayer[];
  wildcard_used?: boolean;
  freehit_used?: boolean;
  bench_boost_used?: boolean;
  triple_captain_used?: boolean;
  calculated_total_points?: number;
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

interface Fixture {
  id: string;
  scheduled_at: string;
  home_team: {
    name: string;
    short_name: string;
    logo: string;
  };
  away_team: {
    name: string;
    short_name: string;
    logo: string;
  };
  team: {
    id: string;
    name: string;
    short_name: string;
  };
  opponent: {
    id: string;
    name: string;
    short_name: string;
    logo: string;
    primary_color: string;
  };
  difficulty: number;
  opponentDifficulty: number;
  isHome: boolean;
}

const SQUAD_MINIMUMS = {
  GK: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
};

const POSITION_LABELS: Record<string, string> = {
  GK: "GK",
  DEF: "CB",
  MID: "MID",
  FWD: "FWD",
};

export default function FantasyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userTeam, setUserTeam] = useState<UserTeam | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState<Formation>(
    formations[0],
  );
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<string>("");
  const [pickerPositionAllowed, setPickerPositionAllowed] = useState<string[]>(
    [],
  );
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<"add" | "replace">("add");
  const [pickerIsStarting, setPickerIsStarting] = useState(true);
  const [playerToReplace, setPlayerToReplace] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCaptainModal, setShowCaptainModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChipModal, setShowChipModal] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const isDeadlinePassed = currentGameweek?.deadline
    ? new Date(currentGameweek.deadline) < new Date()
    : false;

  const canMakeTransfers = !isDeadlinePassed;

  const anyChipUsedThisGW = !!(
    userTeam &&
    currentGameweek &&
    ((userTeam.wildcard_used &&
      (userTeam as any).wildcard_used_gw === currentGameweek.gameweek_number) ||
      (userTeam.freehit_used &&
        (userTeam as any).freehit_used_gw ===
          currentGameweek.gameweek_number) ||
      (userTeam.bench_boost_used &&
        (userTeam as any).bench_boost_used_gw ===
          currentGameweek.gameweek_number) ||
      (userTeam.triple_captain_used &&
        (userTeam as any).triple_captain_used_gw ===
          currentGameweek.gameweek_number))
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserTeam();
      fetchCurrentGameweek();
      fetchTeams();
    }
  }, [userId]);

  useEffect(() => {
    if (userTeam) {
      fetchPlayers();
    }
  }, [userTeam]);

  useEffect(() => {
    if (teams.length > 0 || players.length > 0) {
      fetchFixtures();
    }
  }, [teams, players]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user?.id) {
          setUserId(data.user.id);
        } else {
          router.push("https://rff.giize.com/login");
        }
      } else {
        router.push("https://rff.giize.com/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("https://rff.giize.com/login");
    }
  };

  const fetchUserTeam = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/fantasy/user-team?userId=${userId}`);
      const data = await res.json();
      if (data.userTeams && data.userTeams.length > 0) {
        setUserTeam(data.userTeams[0]);
        setSelectedFormation(
          getFormationByName(data.userTeams[0].formation) || formations[0],
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user team:", error);
      setLoading(false);
    }
  };

  const fetchCurrentGameweek = async () => {
    try {
      let res = await fetch("/api/fantasy/gameweeks?status=active");
      let data = await res.json();
      if (data.gameweeks && data.gameweeks.length > 0) {
        setCurrentGameweek(data.gameweeks[0]);
      } else {
        res = await fetch("/api/fantasy/gameweeks");
        data = await res.json();
        if (data.gameweeks && data.gameweeks.length > 0) {
          setCurrentGameweek(data.gameweeks[data.gameweeks.length - 1]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch gameweek:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/admin/teams");
      const data = await res.json();
      if (data.teams) {
        setTeams(data.teams);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const fetchPlayers = async () => {
    if (!userTeam) return;
    try {
      const res = await fetch(`/api/fantasy/players?userTeamId=${userTeam.id}`);
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    }
  };

  const fetchFixtures = async () => {
    let allTeamIds: string[] = [];

    if (teams.length > 0) {
      allTeamIds = teams.map((t) => t.id).filter(Boolean);
    } else if (userTeam?.players && userTeam.players.length > 0) {
      allTeamIds = [
        ...new Set(
          userTeam.players.map((p) => p.player.team_id).filter(Boolean),
        ),
      ];
    } else if (players.length > 0) {
      allTeamIds = [...new Set(players.map((p) => p.team_id).filter(Boolean))];
    }

    if (allTeamIds.length === 0) {
      return;
    }

    const allFixtures: Fixture[] = [];

    for (const teamId of allTeamIds) {
      try {
        const res = await fetch(`/api/fantasy/fixtures?teamId=${teamId}`);
        const data = await res.json();
        if (data.fixtures) {
          allFixtures.push(...data.fixtures);
        }
      } catch (error) {
        console.error("Failed to fetch fixtures:", error);
      }
    }

    setFixtures(allFixtures);
  };

  const validateSquad = (): string[] => {
    if (!userTeam?.players) return [];

    const errors: string[] = [];
    const startingPlayers = userTeam.players.filter((p) => p.is_starting);

    const positionCounts = {
      GK: startingPlayers.filter((p) => p.player.position === "GK").length,
      DEF: startingPlayers.filter((p) => p.player.position === "DEF").length,
      MID: startingPlayers.filter((p) => p.player.position === "MID").length,
      FWD: startingPlayers.filter((p) => p.player.position === "FWD").length,
    };

    if (positionCounts.GK < SQUAD_MINIMUMS.GK) {
      errors.push(
        `Need at least ${SQUAD_MINIMUMS.GK} Goalkeepers (you have ${positionCounts.GK})`,
      );
    }
    if (positionCounts.DEF < SQUAD_MINIMUMS.DEF) {
      errors.push(
        `Need at least ${SQUAD_MINIMUMS.DEF} Defenders (you have ${positionCounts.DEF})`,
      );
    }
    if (positionCounts.MID < SQUAD_MINIMUMS.MID) {
      errors.push(
        `Need at least ${SQUAD_MINIMUMS.MID} Midfielders (you have ${positionCounts.MID})`,
      );
    }
    if (positionCounts.FWD < SQUAD_MINIMUMS.FWD) {
      errors.push(
        `Need at least ${SQUAD_MINIMUMS.FWD} Forwards (you have ${positionCounts.FWD})`,
      );
    }

    return errors;
  };

  const createTeam = async () => {
    if (!userId || !teamName) return;
    try {
      const res = await fetch("/api/fantasy/user-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, teamName, season: "2025" }),
      });
      const data = await res.json();
      if (data.success) {
        setUserTeam(data.userTeam);
        setShowCreateModal(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create team",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const addPlayer = async (
    playerId: string,
    position: string,
    allowedPositions?: string[],
    slotId?: string | null,
    isStarting: boolean = true,
  ) => {
    if (!userTeam) return;

    if (!canMakeTransfers) {
      toast({
        title: "Transfers Closed",
        description: "The transfer window has closed for this gameweek",
        variant: "destructive",
      });
      return;
    }

    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const existingPlayers = userTeam.players || [];
    const isAlreadyInSquad = existingPlayers.some(
      (p) => p.player_id === playerId,
    );
    if (isAlreadyInSquad) {
      toast({
        title: "Cannot Add Player",
        description: "This player is already in your squad!",
        variant: "destructive",
      });
      return;
    }
    const validPositions =
      allowedPositions && allowedPositions.length > 0
        ? allowedPositions
        : [position];

    const DEF_POSITIONS = ["CB", "LB", "RB", "LWB", "RWB"];
    const FWD_POSITIONS = ["ST", "CF", "LW", "RW"];
    const getPositionCategory = (pos: string): string => {
      if (pos === "GK") return "GK";
      if (pos === "DEF") return "DEF";
      if (pos === "FWD") return "FWD";
      if (DEF_POSITIONS.includes(pos)) return "DEF";
      if (FWD_POSITIONS.includes(pos)) return "FWD";
      return "MID";
    };

    const playerCategory = getPositionCategory(player.position);
    const allowedCategories = validPositions.map(getPositionCategory);
    const isPositionAllowed = allowedCategories.includes(playerCategory);

    if (!isPositionAllowed) {
      toast({
        title: "Invalid Position",
        description: `You can only add ${validPositions.join(", ")} players to the ${position} position!`,
        variant: "destructive",
      });
      return;
    }
    const currentSpending = existingPlayers.reduce(
      (sum, p) => sum + (p.purchase_price || 0),
      0,
    );
    const newTotal = currentSpending + (player.transfer_value || 0);
    if (newTotal > INITIAL_BUDGET) {
      const remainingBudget = INITIAL_BUDGET - currentSpending;
      toast({
        title: "Insufficient Budget",
        description: `This player costs ${formatBudget(player.transfer_value)} but you only have ${formatBudget(remainingBudget)} remaining!`,
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/fantasy/user-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTeamId: userTeam.id,
          playerId,
          squadPosition: isStarting ? position : player.position,
          slotId: slotId || null,
          isStarting,
          purchasePrice: player.transfer_value || 0,
          purchaseGameweek: currentGameweek?.gameweek_number || 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUserTeam();
        setShowPlayerPicker(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add player",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to add player:", error);
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
      });
    }
  };

  const removePlayer = async (userPlayerId: string) => {
    if (!userTeam) return;
    try {
      const res = await fetch(`/api/fantasy/user-players?id=${userPlayerId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchUserTeam();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove player",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to remove player:", error);
      toast({
        title: "Error",
        description: "Failed to remove player",
        variant: "destructive",
      });
    }
  };

  const makeTransfer = async (playerInId: string, playerOutId: string) => {
    if (!userTeam || !currentGameweek) return;

    if (!canMakeTransfers) {
      toast({
        title: "Transfers Closed",
        description: "The transfer window has closed for this gameweek",
        variant: "destructive",
      });
      return;
    }
    try {
      const playerToAdd = players.find((p) => p.id === playerInId);
      if (!playerToAdd) return;

      const userPlayerOut = userTeam.players?.find((p) => p.id === playerOutId);
      if (!userPlayerOut) return;

      await removePlayer(playerOutId);

      const res = await fetch("/api/fantasy/user-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTeamId: userTeam.id,
          playerId: playerInId,
          squadPosition: userPlayerOut.squad_position,
          slotId: userPlayerOut.slot_id || null,
          isStarting: userPlayerOut.is_starting,
          purchasePrice: playerToAdd.transfer_value || 0,
          purchaseGameweek: currentGameweek?.gameweek_number || 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchUserTeam();
        setShowPlayerPicker(false);
        setPlayerToReplace(null);
        toast({
          title: "Transfer Complete",
          description: "Player replaced successfully!",
          variant: "success",
        });
      } else {
        toast({
          title: "Transfer Failed",
          description: data.error || "Transfer failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Transfer failed:", error);
      toast({
        title: "Transfer Failed",
        description: "Failed to complete transfer",
        variant: "destructive",
      });
    }
  };

  const setCaptain = async (userPlayerId: string, isVice: boolean = false) => {
    if (!userTeam) return;
    try {
      const updates = isVice
        ? { viceCaptainId: userPlayerId }
        : { captainId: userPlayerId };

      const res = await fetch("/api/fantasy/user-team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userTeam.id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUserTeam();
        setShowCaptainModal(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to set captain",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to set captain:", error);
      toast({
        title: "Error",
        description: "Failed to set captain",
        variant: "destructive",
      });
    }
  };

  const resetLineup = async () => {
    if (!userTeam) return;

    setShowResetConfirm(true);
  };

  const confirmResetLineup = async () => {
    if (!userTeam) return;

    try {
      const playerIds = userTeam.players?.map((p) => p.id) || [];

      for (const playerId of playerIds) {
        await fetch(`/api/fantasy/user-players?id=${playerId}`, {
          method: "DELETE",
        });
      }

      toast({
        title: "Lineup Reset",
        description: "Your lineup has been reset successfully",
        variant: "success",
      });

      fetchUserTeam();
    } catch (error) {
      console.error("Failed to reset lineup:", error);
      toast({
        title: "Error",
        description: "Failed to reset lineup",
        variant: "destructive",
      });
    } finally {
      setShowResetConfirm(false);
    }
  };

  const openPlayerPicker = (
    position: string,
    mode: "add" | "replace" = "add",
    replaceId?: string,
    allowedPositions?: string[],
    slotId?: string,
    isStarting: boolean = true,
  ) => {
    setSearchQuery("");
    setPickerPosition(position);
    setPickerPositionAllowed(allowedPositions || [position]);
    setPickerSlotId(slotId || null);
    setPickerMode(mode);
    setPlayerToReplace(replaceId || null);
    setPickerIsStarting(isStarting);

    const allPlayerTeamIds = [
      ...new Set(players.map((p) => p.team_id).filter(Boolean)),
    ];
    const currentFixtureTeamIds = new Set(fixtures.map((f) => f.team.id));
    const missingTeamIds = allPlayerTeamIds.filter(
      (id) => !currentFixtureTeamIds.has(id),
    );

    const openPicker = () => {
      setShowPlayerPicker(true);
    };

    if (missingTeamIds.length > 0) {
      const loadMissingFixtures = async () => {
        const allFixtures = [...fixtures];
        for (const teamId of missingTeamIds) {
          try {
            const res = await fetch(`/api/fantasy/fixtures?teamId=${teamId}`);
            const data = await res.json();
            if (data.fixtures) {
              allFixtures.push(...data.fixtures);
            }
          } catch (error) {
            console.error("Failed to fetch fixtures:", error);
          }
        }
        setFixtures(allFixtures);
      };
      loadMissingFixtures().then(openPicker);
    } else {
      openPicker();
    }
  };

  const getSquadPlayers = () => {
    if (!userTeam?.players) return [];
    return userTeam.players.filter((p) => p.is_starting);
  };

  const getBenchPlayers = () => {
    if (!userTeam?.players) return [];
    return userTeam.players.filter((p) => !p.is_starting);
  };

  const getPositionPlayers = (pos: string, allowedPositions?: string[]) => {
    const squadPlayerIds = userTeam?.players
      ? new Set(userTeam.players.map((p) => p.player_id))
      : new Set<string>();

    const DEF_POSITIONS = ["CB", "LB", "RB", "LWB", "RWB"];
    const FWD_POSITIONS = ["ST", "CF", "LW", "RW"];

    const getPositionCategory = (position: string): string => {
      if (position === "GK") return "GK";
      if (position === "DEF") return "DEF";
      if (position === "FWD") return "FWD";
      if (DEF_POSITIONS.includes(position)) return "DEF";
      if (FWD_POSITIONS.includes(position)) return "FWD";
      return "MID";
    };

    if (allowedPositions && allowedPositions.length > 0) {
      const firstAllowed = allowedPositions[0];

      if (
        ["GK", "DEF", "MID", "FWD"].includes(firstAllowed) &&
        allowedPositions.length === 4
      ) {
        return players.filter((p) => !squadPlayerIds.has(p.id));
      }

      const targetCategory = getPositionCategory(allowedPositions[0]);

      if (targetCategory === "GK") {
        return players.filter(
          (p) => p.position === "GK" && !squadPlayerIds.has(p.id),
        );
      }

      return players.filter((p) => {
        const playerCategory = getPositionCategory(p.position);
        const isSameCategory = playerCategory === targetCategory;
        return isSameCategory && !squadPlayerIds.has(p.id);
      });
    }

    const targetCategory = getPositionCategory(pos);

    if (targetCategory === "GK") {
      return players.filter(
        (p) => p.position === "GK" && !squadPlayerIds.has(p.id),
      );
    }

    return players.filter((p) => {
      const playerCategory = getPositionCategory(p.position);
      const isSameCategory = playerCategory === targetCategory;
      return isSameCategory && !squadPlayerIds.has(p.id);
    });
  };

  const formatBudget = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const canAddMorePlayers = () => {
    const squadCount = getSquadPlayers().length;
    return squadCount < 11;
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-green-400";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-orange-500";
      case 5:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPlayerFixtures = (teamId: string) => {
    return fixtures.filter((f) => f.team.id === teamId).slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#222222] flex items-center justify-center">
        <Loader size="sm" />
      </div>
    );
  }

  if (!userTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-nowrap font-bold text-center">
              Welcome to
            </CardTitle>
            <Image
              src="/rff.png"
              alt="Real Futbol Fantasy Logo"
              width={540}
              draggable={false}
              height={540}
              className="mx-auto mt-4"
            />
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Build your dream team with a 100M budget!
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full"
              size="lg"
            >
              Create Your Team
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent
            onKeyDown={(e) => {
              if (e.key === "Enter" && teamName) {
                createTeam();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Create Your Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                type="text"
                placeholder="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createTeam}
                  disabled={!teamName}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const squadPlayers = getSquadPlayers();
  const benchPlayers = getBenchPlayers();
  const errors = validateSquad();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-start"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src="/rffshort.png"
                alt="Real Futbol Fantasy Logo"
                className="w-16 h-16 rounded-lg"
              />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {userTeam.team_name}
              </h1>
              <p className="text-muted-foreground">
                Gameweek {currentGameweek?.gameweek_number || 1}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="min-w-30">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatBudget(userTeam.budget)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="flex">
                <CardContent className="pt-6">
                  <p className="text-sm text-nowrap text-muted-foreground">
                    Transfers
                  </p>
                  <p className="text-2xl text-nowrap flex font-bold text-blue-500">
                    {userTeam.transfers_this_gw}/{FREE_TRANSFERS_PER_GW}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userTeam.transfers_this_gw >= FREE_TRANSFERS_PER_GW
                      ? `-${TRANSFER_PENALTY_PER_EXTRA}pts after free`
                      : ""}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="min-w-30">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {userTeam.calculated_total_points ?? userTeam.total_points}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <Button
              variant={!!userTeam.wildcard_used ? "outline" : "default"}
              size="lg"
              disabled={
                !!userTeam.wildcard_used ||
                !canMakeTransfers ||
                anyChipUsedThisGW
              }
              onClick={() => {
                if (
                  !userTeam.wildcard_used &&
                  canMakeTransfers &&
                  !anyChipUsedThisGW
                ) {
                  setActiveChip("wildcard");
                  setShowChipModal(true);
                }
              }}
              className={`flex flex-col h-auto py-3 gap-1 relative ${!!userTeam.wildcard_used || !canMakeTransfers || anyChipUsedThisGW ? "opacity-50" : ""}`}
            >
              {!userTeam.wildcard_used &&
                canMakeTransfers &&
                !anyChipUsedThisGW && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              <Shuffle className="w-5 h-5" />
              <span className="text-xs font-medium">
                {userTeam.wildcard_used ? "✓ Wildcard" : "Wildcard"}
              </span>
            </Button>
            <Button
              variant={!!userTeam.freehit_used ? "outline" : "default"}
              size="lg"
              disabled={
                !!userTeam.freehit_used ||
                !canMakeTransfers ||
                anyChipUsedThisGW
              }
              onClick={() => {
                if (
                  !userTeam.freehit_used &&
                  canMakeTransfers &&
                  !anyChipUsedThisGW
                ) {
                  setActiveChip("freehit");
                  setShowChipModal(true);
                }
              }}
              className={`flex flex-col h-auto py-3 gap-1 relative ${!!userTeam.freehit_used || !canMakeTransfers || anyChipUsedThisGW ? "opacity-50" : ""}`}
            >
              {!userTeam.freehit_used &&
                canMakeTransfers &&
                !anyChipUsedThisGW && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              <RefreshCcw className="w-5 h-5" />
              <span className="text-xs font-medium">
                {userTeam.freehit_used ? "✓ Free Hit" : "Free Hit"}
              </span>
            </Button>
            <Button
              variant={!!userTeam.bench_boost_used ? "outline" : "default"}
              size="lg"
              disabled={
                !!userTeam.bench_boost_used ||
                !canMakeTransfers ||
                anyChipUsedThisGW
              }
              onClick={() => {
                if (
                  !userTeam.bench_boost_used &&
                  canMakeTransfers &&
                  !anyChipUsedThisGW
                ) {
                  setActiveChip("bench_boost");
                  setShowChipModal(true);
                }
              }}
              className={`flex flex-col h-auto py-3 gap-1 relative ${!!userTeam.bench_boost_used || !canMakeTransfers || anyChipUsedThisGW ? "opacity-50" : ""}`}
            >
              {!userTeam.bench_boost_used &&
                canMakeTransfers &&
                !anyChipUsedThisGW && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              <Rocket className="w-5 h-5" />
              <span className="text-xs font-medium">
                {userTeam.bench_boost_used ? "✓ Bench Boost" : "Bench Boost"}
              </span>
            </Button>
            <Button
              variant={!!userTeam.triple_captain_used ? "outline" : "default"}
              size="lg"
              disabled={
                !!userTeam.triple_captain_used ||
                !canMakeTransfers ||
                anyChipUsedThisGW
              }
              onClick={() => {
                if (
                  !userTeam.triple_captain_used &&
                  canMakeTransfers &&
                  !anyChipUsedThisGW
                ) {
                  setActiveChip("triple_captain");
                  setShowChipModal(true);
                }
              }}
              className={`flex flex-col h-auto py-3 gap-1 relative ${userTeam.triple_captain_used || !canMakeTransfers || anyChipUsedThisGW ? "opacity-50" : ""}`}
            >
              {!userTeam.triple_captain_used &&
                canMakeTransfers &&
                !anyChipUsedThisGW && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              <Crown className="w-5 h-5" />
              <span className="text-xs font-medium">
                {userTeam.triple_captain_used ? "✓ Triple C" : "Triple C"}
              </span>
            </Button>
          </div>
        </motion.div>

        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="pt-4">
                <p className="font-semibold text-red-400 mb-2">
                  Squad Validation Issues
                </p>
                {errors.map((error, i) => (
                  <p key={i} className="text-sm text-red-300">
                    {error}
                  </p>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="flex items-center gap-4">
          <Select
            value={userTeam.formation}
            onValueChange={async (formation) => {
              setSelectedFormation(
                getFormationByName(formation) || formations[0],
              );
              await fetch(`/api/fantasy/user-team`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userTeam.id, formation }),
              });
              fetchUserTeam();
            }}
          >
            <SelectTrigger className="w-50">
              <SelectValue placeholder="Formation" />
            </SelectTrigger>
            <SelectContent>
              {formations.map((f) => (
                <SelectItem key={f.shortName} value={f.name}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setShowCaptainModal(true)}>
            Set Captain
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-950"
          >
            Reset Lineup
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-center">Starting XI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full aspect-3/4 max-w-md mx-auto">
                    {selectedFormation.positions.map((pos, index) => {
                      const squadPlayer = squadPlayers.find(
                        (sp) => sp.slot_id === pos.id,
                      );
                      const isCaptain = squadPlayer?.id === userTeam.captain_id;
                      const isViceCaptain =
                        squadPlayer?.id === userTeam.vice_captain_id;
                      const isTripleCaptainActive =
                        userTeam.triple_captain_used &&
                        currentGameweek &&
                        (userTeam as any).triple_captain_used_gw ===
                          currentGameweek.gameweek_number;

                      return (
                        <motion.div
                          key={pos.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        >
                          <div className="flex flex-col items-center relative">
                            {squadPlayer ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePlayer(squadPlayer.id);
                                  }}
                                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 border border-white flex items-center justify-center hover:bg-red-500 transition-colors z-30 shadow-lg"
                                >
                                  <X className="w-3 h-3 text-white font-bold" />
                                </button>
                                {(isCaptain || isViceCaptain) && (
                                  <div
                                    className="absolute -top-2 -left-2 w-6 h-5 rounded-full flex items-center justify-center text-[9px] font-bold z-20"
                                    style={{
                                      backgroundColor: isCaptain
                                        ? isTripleCaptainActive
                                          ? "#ef4444"
                                          : "#eab308"
                                        : "#60a5fa",
                                    }}
                                  >
                                    {isCaptain
                                      ? isTripleCaptainActive
                                        ? "x3"
                                        : "x2"
                                      : "VC"}
                                  </div>
                                )}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden border-2 cursor-pointer transition-colors ${
                                    isCaptain
                                      ? "border-yellow-500 bg-yellow-500/20"
                                      : isViceCaptain
                                        ? "border-blue-400 bg-blue-400/20"
                                        : "border-muted"
                                  }`}
                                  style={{
                                    borderColor:
                                      squadPlayer.player.team?.primary_color ||
                                      "#666",
                                  }}
                                  onClick={() =>
                                    openPlayerPicker(
                                      pos.position,
                                      "replace",
                                      squadPlayer.id,
                                      pos.allowedPositions,
                                      pos.id,
                                      true,
                                    )
                                  }
                                >
                                  {squadPlayer.player.image ? (
                                    <img
                                      src={squadPlayer.player.image}
                                      alt={squadPlayer.player.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs font-bold text-foreground">
                                      {squadPlayer.player.short_name}
                                    </span>
                                  )}
                                </motion.div>
                              </>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const existingInSlot = squadPlayers.find(
                                    (sp) => sp.slot_id === pos.id,
                                  );
                                  if (existingInSlot) {
                                    openPlayerPicker(
                                      pos.position,
                                      "replace",
                                      existingInSlot.id,
                                      pos.allowedPositions,
                                      pos.id,
                                      true,
                                    );
                                  } else if (canAddMorePlayers()) {
                                    openPlayerPicker(
                                      pos.position,
                                      "add",
                                      undefined,
                                      pos.allowedPositions,
                                      pos.id,
                                      true,
                                    );
                                  }
                                }}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary border-2 border-dashed border-muted-foreground/20 flex items-center justify-center hover:bg-accent transition-colors"
                              >
                                <span className="text-xs text-muted-foreground">
                                  {pos.position}
                                </span>
                              </motion.button>
                            )}
                            <span className="text-[10px] text-foreground mt-1 text-center max-w-16 truncate">
                              {squadPlayer?.player.name}
                            </span>
                            {squadPlayer && (
                              <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1 rounded-sm mt-0.5">
                                {squadPlayer.player.total_points || 0} pts
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-center">Bench</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap justify-center gap-4">
                    {benchPlayers.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex flex-col items-center relative"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlayer(player.id);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 border border-white flex items-center justify-center hover:bg-red-500 transition-colors z-30 shadow-lg"
                        >
                          <X className="w-3 h-3 text-white font-bold" />
                        </button>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 border-muted cursor-pointer bg-secondary"
                          onClick={() =>
                            openPlayerPicker(
                              player.player.position,
                              "replace",
                              player.id,
                              undefined,
                              undefined,
                              false,
                            )
                          }
                        >
                          {player.player.image ? (
                            <img
                              src={player.player.image}
                              alt={player.player.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-foreground">
                              {player.player.short_name}
                            </span>
                          )}
                        </motion.div>
                        <span className="text-[10px] text-foreground mt-1 text-center max-w-16 truncate">
                          {player.player.name}
                        </span>
                        <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1 rounded-sm mt-0.5">
                          {player.player.total_points || 0} pts
                        </span>
                      </motion.div>
                    ))}
                    {Array.from({
                      length: Math.max(0, 4 - benchPlayers.length),
                    }).map((_, i) => (
                      <button
                        key={`empty-${i}`}
                        type="button"
                        className="flex flex-col items-center bg-transparent border-none cursor-pointer p-0"
                        onClick={() =>
                          openPlayerPicker(
                            "BENCH",
                            "add",
                            undefined,
                            ["GK", "DEF", "MID", "FWD"],
                            undefined,
                            false,
                          )
                        }
                      >
                        <div className="w-12 h-12 rounded-full bg-secondary border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Squad Value</span>
                    <span className="font-medium text-foreground">
                      {formatBudget(
                        [...squadPlayers, ...benchPlayers].reduce(
                          (sum, p) => sum + p.purchase_price,
                          0,
                        ),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Players</span>
                    <span className="font-medium text-foreground">
                      {squadPlayers.length + benchPlayers.length}/15
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Transfer Penalty
                    </span>
                    <span className="font-medium text-red-500">
                      -{userTeam.transfer_penalty_points} pts
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {squadPlayers.length > 0 && (
              <Card className={isDeadlinePassed ? "border-red-500" : ""}>
                <CardHeader>
                  <CardTitle>Transfer window deadline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <span className="text-muted-foreground">
                    {currentGameweek?.deadline
                      ? new Date(currentGameweek.deadline).toLocaleString()
                      : "N/A"}
                  </span>
                  {isDeadlinePassed && (
                    <div className="flex items-center gap-1 text-red-500 font-bold">
                      <XCircle className="w-4 h-4" />
                      <span>CLOSED</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showPlayerPicker && (
            <Dialog open={showPlayerPicker} onOpenChange={setShowPlayerPicker}>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>
                    {pickerMode === "replace" ? "Replace Player" : "Add Player"}{" "}
                    - {pickerPosition} {!pickerIsStarting ? "(Bench)" : ""}
                  </DialogTitle>
                </DialogHeader>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm"
                  />
                </div>
                <div className="overflow-y-auto max-h-[60vh] space-y-2">
                  {getPositionPlayers(pickerPosition, pickerPositionAllowed)
                    .filter((player) => {
                      if (!searchQuery) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        player.name.toLowerCase().includes(query) ||
                        player.short_name.toLowerCase().includes(query) ||
                        player.team?.name.toLowerCase().includes(query)
                      );
                    })
                    .map((player) => {
                      const playerTeamFixtures = getPlayerFixtures(
                        player.team_id,
                      );

                      return (
                        <motion.button
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          whileHover={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (pickerMode === "add") {
                              addPlayer(
                                player.id,
                                pickerPosition,
                                pickerPositionAllowed,
                                pickerSlotId,
                                pickerIsStarting,
                              );
                            } else if (playerToReplace) {
                              makeTransfer(player.id, playerToReplace);
                            }
                          }}
                          className="w-full flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-accent transition-colors text-left"
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                            style={{
                              backgroundColor:
                                player.team?.primary_color || "#333",
                            }}
                          >
                            {player.image ? (
                              <img
                                src={player.image}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white">
                                {player.short_name}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {player.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {player.team?.name}
                            </p>
                            {playerTeamFixtures.length > 0 && (
                              <div className="flex gap-1 mt-1 items-center">
                                <span className="text-[8px] text-muted-foreground">
                                  Diff:
                                </span>
                                {playerTeamFixtures.map((f, i) => (
                                  <div
                                    key={i}
                                    className={`w-5 h-5 rounded-full ${getDifficultyColor(
                                      f.opponentDifficulty,
                                    )} text-[8px] text-white flex items-center justify-center font-bold`}
                                  >
                                    {f.opponentDifficulty}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-400">
                              {formatBudget(player.transfer_value)}
                            </p>
                            <p className="text-xs font-bold text-yellow-500">
                              {player.total_points || 0} pts
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {player.position}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  {getPositionPlayers(pickerPosition, pickerPositionAllowed)
                    .length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {searchQuery
                        ? "No players match your search"
                        : "No players available for this position"}
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showCaptainModal && (
            <Dialog open={showCaptainModal} onOpenChange={setShowCaptainModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Captain & Vice-Captain</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Captain</p>
                    <Select
                      value={userTeam.captain_id || ""}
                      onValueChange={(value) => setCaptain(value, false)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Captain" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...squadPlayers, ...benchPlayers].map((up) => (
                          <SelectItem key={up.id} value={up.id}>
                            {up.player.name} ({up.player.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Vice-Captain</p>
                    <Select
                      value={userTeam.vice_captain_id || ""}
                      onValueChange={(value) => setCaptain(value, true)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Vice-Captain" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...squadPlayers, ...benchPlayers].map((up) => (
                          <SelectItem key={up.id} value={up.id}>
                            {up.player.name} ({up.player.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showResetConfirm && (
            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Lineup</DialogTitle>
                </DialogHeader>
                <p className="text-white/60 py-4">
                  Are you sure you want to reset your lineup? This will remove
                  all players from your squad.
                </p>
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmResetLineup}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Reset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showChipModal && (
            <Dialog open={showChipModal} onOpenChange={setShowChipModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {activeChip === "wildcard" && "Use Wildcard"}
                    {activeChip === "freehit" && "Use Free Hit"}
                    {activeChip === "bench_boost" && "Use Bench Boost"}
                    {activeChip === "triple_captain" && "Use Triple Captain"}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-white/60 py-4">
                  {activeChip === "wildcard" &&
                    "Using a Wildcard allows you to make unlimited transfers for this gameweek without any point penalty. This chip can only be used once per season."}
                  {activeChip === "freehit" &&
                    "Using a Free Hit allows you to make unlimited transfers for this gameweek only. Your team will revert back to its original state after the gameweek ends."}
                  {activeChip === "bench_boost" &&
                    "Using Bench Boost will activate your bench players to score points for this gameweek. This can only be used once per season."}
                  {activeChip === "triple_captain" &&
                    "Using Triple Captain will triple your captain's points for this gameweek. This can only be used once per season."}
                </p>
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowChipModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!userTeam || !currentGameweek) return;

                      const chipApiMap: Record<string, string> = {
                        wildcard: "wildcard",
                        freehit: "freehit",
                        bench_boost: "bench_boost",
                        triple_captain: "triple_captain",
                      };

                      try {
                        const res = await fetch("/api/fantasy/chips", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userTeamId: userTeam.id,
                            chip: chipApiMap[activeChip || ""],
                            gameweekNumber: currentGameweek.gameweek_number,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setUserTeam(data.userTeam);
                          setShowChipModal(false);
                          toast({
                            title: "Chip Activated!",
                            description: `You used ${activeChip?.replace("_", " ")} for gameweek ${currentGameweek.gameweek_number}`,
                            variant: "success",
                          });
                        } else {
                          toast({
                            title: "Error",
                            description: data.error || "Failed to use chip",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        console.error("Failed to use chip:", error);
                        toast({
                          title: "Error",
                          description: "Failed to use chip",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="flex-1"
                  >
                    Use Chip
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
