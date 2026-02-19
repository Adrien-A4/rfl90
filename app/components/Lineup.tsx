"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Plus,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  Save,
  Trash2,
  FolderOpen,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/sonner";

const formations = [
  {
    id: "2-3-1",
    name: "2-3-1",
    positions: [[0], [1, 2], [3, 4, 5], [6]],
  },
  {
    id: "2-2-2",
    name: "2-2-2",
    positions: [[0], [1, 2], [3, 4], [5, 6]],
  },
  {
    id: "3-2-1",
    name: "3-2-1",
    positions: [[0], [1, 2, 3], [4, 5], [6]],
  },
];

type Player = {
  id: string;
  name: string;
  short_name?: string;
  image: string;
  team: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  rating?: number;
};

const positionGroups: Record<number, "GK" | "DEF" | "MID" | "FWD"> = {
  0: "GK",
  1: "DEF",
  2: "DEF",
  3: "MID",
  4: "MID",
  5: "MID",
  6: "FWD",
};

type Team = {
  id: string;
  name: string;
  short_name: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
};

type LineupProps = {
  compact?: boolean;
};

type SavedLineup = {
  id: string;
  name: string;
  formation: string;
  players: Record<number, Player>;
  createdAt: number;
};

const Lineup = ({ compact = false }: LineupProps) => {
  const { toast } = useToast();
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [formationDropdownOpen, setFormationDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("club");
  const [lineupName, setLineupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [playerPickerOpen, setPlayerPickerOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [dbPlayers, setDbPlayers] = useState<Player[]>([]);
  const [dbTeams, setDbTeams] = useState<Team[]>([]);
  const [lineup, setLineup] = useState<Record<number, Player>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, teamsRes] = await Promise.all([
          fetch("/api/admin/players"),
          fetch("/api/admin/teams"),
        ]);

        if (!playersRes.ok || !teamsRes.ok) {
          throw new Error("One or more API calls failed");
        }

        const playersData = await playersRes.json();
        const teamsData = await teamsRes.json();

        if (playersData.players) {
          const mappedPlayers = playersData.players.map((p: any) => ({
            id: p.id,
            name: p.name,
            image: p.image ?? "/noFilter.png",
            team:
              typeof p.team === "string" ? p.team : p.team?.name || "Unknown",
            position: p.position,
            rating: p.rating,
          }));
          setDbPlayers(mappedPlayers);
        }

        if (teamsData.teams) {
          setDbTeams(teamsData.teams);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const players = dbPlayers;
  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const formationRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentFormation = formations.find((f) => f.id === selectedFormation);

  useEffect(() => {
    const saved = localStorage.getItem("rfl90-lineups");
    if (saved) {
      try {
        setSavedLineups(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved lineups", e);
      }
    }
  }, []);

  const saveLineupToStorage = (newLineups: SavedLineup[]) => {
    setSavedLineups(newLineups);
    localStorage.setItem("rfl90-lineups", JSON.stringify(newLineups));
  };

  const getRandomTeams = (count: number = 5): Team[] => {
    if (dbTeams.length === 0) return [];
    const shuffled = [...dbTeams].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const handlePrefillLineup = (team: Team) => {
    const teamPlayers = dbPlayers.filter(
      (p) => p.team === team.name || p.team === team.short_name,
    );

    if (teamPlayers.length === 0) {
      toast({
        title: "No Players",
        description: `No players found for ${team.name}`,
        variant: "warning",
      });
      return;
    }

    const formation = formations.find((f) => f.id === selectedFormation);
    if (!formation) return;

    const newLineup: Record<number, Player> = {};
    const usedPlayerIds = new Set<string>();

    formation.positions.forEach((row, rowIndex) => {
      row.forEach((positionIndex) => {
        const neededPosition = positionGroups[positionIndex];
        const availablePlayers = teamPlayers.filter(
          (p) => p.position === neededPosition && !usedPlayerIds.has(p.id),
        );

        if (availablePlayers.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * availablePlayers.length,
          );
          const selectedPlayer = availablePlayers[randomIndex];
          newLineup[positionIndex] = selectedPlayer;
          usedPlayerIds.add(selectedPlayer.id);
        }
      });
    });

    setLineup(newLineup);
    setLineupName(`${team.short_name} vs Random`);

    toast({
      title: "Lineup Pre-filled",
      description: `${team.name} lineup created with ${Object.keys(newLineup).length} players`,
      variant: "success",
    });
  };

  const handleSaveLineup = () => {
    if (Object.keys(lineup).length < 7) {
      toast({
        title: "Not Enough Players",
        description: "Add at least 7 players before saving.",
        variant: "warning",
      });
      return;
    }
    setSaveModalOpen(true);
  };

  const confirmSaveLineup = (name: string) => {
    const newLineup: SavedLineup = {
      id: Date.now().toString(),
      name: name || `Lineup ${savedLineups.length + 1}`,
      formation: selectedFormation,
      players: { ...lineup },
      createdAt: Date.now(),
    };
    const newLineups = [...savedLineups, newLineup];
    saveLineupToStorage(newLineups);
    setSaveModalOpen(false);
    setLineupName("");
    toast({
      title: "Lineup Saved",
      description: newLineup.name + " has been saved successfully.",
      variant: "success",
    });
  };

  const handleLoadLineup = (saved: SavedLineup) => {
    setLineup(saved.players);
    setSelectedFormation(saved.formation);
    setLineupName(saved.name);
    toast({
      title: "Lineup Loaded",
      description: saved.name + " has been loaded.",
      variant: "success",
    });
  };

  const handleDeleteLineup = (id: string) => {
    const newLineups = savedLineups.filter((l) => l.id !== id);
    saveLineupToStorage(newLineups);
    toast({
      title: "Lineup Deleted",
      description: "The lineup has been removed.",
      variant: "default",
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        formationRef.current &&
        !formationRef.current.contains(e.target as Node)
      ) {
        setFormationDropdownOpen(false);
      }
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPlayerPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePositionClick = (pos: number) => {
    setSelectedPosition(pos);
    setPlayerPickerOpen(true);
  };

  const handlePlayerSelect = (player: Player) => {
    if (selectedPosition !== null) {
      const requiredPosition = positionGroups[selectedPosition];

      if (player.position !== requiredPosition) {
        toast({
          title: "Wrong Position",
          description: `${player.name} is a ${player.position}, but this position requires a ${requiredPosition}.`,
          variant: "warning",
        });
        return;
      }

      const existingPosition = Object.entries(lineup).find(
        ([, p]) => p.id === player.id,
      )?.[0];
      if (existingPosition) {
        toast({
          title: "Player Already Selected",
          description: `${player.name} is already in your squad at position ${parseInt(existingPosition) + 1}.`,
          variant: "destructive",
        });
        return;
      }

      setLineup((prev) => ({ ...prev, [selectedPosition]: player }));
      setPlayerPickerOpen(false);
      setSelectedPosition(null);
    }
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.team.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (compact) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xs">Build your own XI</h3>
        </div>

        <div className="rounded-md p-2 relative overflow-hidden border border-white/5 bg-[#161616] h-36">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-white"></div>
            <div className="absolute top-2/4 left-0 right-0 h-px bg-white"></div>
            <div className="absolute top-3/4 left-0 right-0 h-px bg-white"></div>
          </div>

          <div className="relative grid grid-cols-7 gap-2 h-full items-center">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                  <User className="w-3 h-3 text-white/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <AnimatePresence>
        {playerPickerOpen && selectedPosition !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setPlayerPickerOpen(false)}
          >
            <motion.div
              ref={pickerRef}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-[#1a1a1a] rounded-xl w-96 max-h-[70vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Select Player</h3>
                    <p className="text-xs text-white/40">
                      Position:{" "}
                      <span className="text-blue-400">
                        {positionGroups[selectedPosition]}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setPlayerPickerOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {filteredPlayers.map((player) => {
                  const isCorrectPosition =
                    player.position === positionGroups[selectedPosition!];
                  const isAlreadySelected = Object.values(lineup).some(
                    (p) => p.id === player.id,
                  );
                  const isAvailable = isCorrectPosition && !isAlreadySelected;
                  const selectedPositionNum = Object.entries(lineup).find(
                    ([, p]) => p.id === player.id,
                  )?.[0];

                  return (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isAvailable
                          ? "hover:bg-white/5"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                      disabled={!isAvailable}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden relative">
                        {player.image ? (
                          <Image
                            src={player.image}
                            alt={player.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white/40" />
                        )}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">
                            {player.position}
                          </span>
                        </div>
                        {isAlreadySelected && (
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{player.name}</div>
                        <div className="text-xs text-white/40">
                          {player.team}
                        </div>
                      </div>
                      {!isCorrectPosition ? (
                        <span className="text-xs text-red-400">
                          Wrong position
                        </span>
                      ) : isAlreadySelected ? (
                        <span className="text-xs text-yellow-400">
                          Position {parseInt(selectedPositionNum!) + 1}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setSaveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-[#1a1a1a] rounded-xl w-80 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold text-lg mb-4">Save Lineup</h3>
              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">
                  Lineup Name
                </label>
                <input
                  type="text"
                  placeholder="My Lineup"
                  value={lineupName}
                  onChange={(e) => setLineupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      confirmSaveLineup(lineupName);
                    }
                  }}
                  className="w-full px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSaveModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmSaveLineup(lineupName)}
                  className="flex-1 px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="col-span-3">
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-1">Pre-fill lineup</h3>
          <p className="text-xs text-white/40 mb-4">Choose a team to edit</p>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm"
            />
          </div>

          <div className="mb-4">
            <p className="text-xs text-white/40 mb-3">
              Pre-fill with popular teams
            </p>
            <div className="space-y-1">
              {getRandomTeams(5).map((team) => (
                <button
                  key={team.id}
                  onClick={() => handlePrefillLineup(team)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-5 h-5 relative shrink-0 overflow-hidden rounded">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: team.primary_color }}
                      />
                    )}
                  </div>
                  <span className="text-sm">{team.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 mt-4">
          <h3 className="font-semibold text-sm mb-1">Saved lineups</h3>
          <p className="text-xs text-white/40 mb-3">
            Lineups stored on this device
          </p>
          {savedLineups.length === 0 ? (
            <p className="text-xs text-white/60">
              You have not saved any lineups yet. Create a squad and save it to
              keep it here.
            </p>
          ) : (
            <div className="space-y-2">
              {savedLineups.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0d0d0d] hover:bg-white/5 transition-colors"
                >
                  <button
                    onClick={() => handleLoadLineup(saved)}
                    className="flex items-center gap-2 flex-1"
                  >
                    <FolderOpen className="w-4 h-4 text-white/40" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{saved.name}</div>
                      <div className="text-xs text-white/40">
                        {saved.formation} • {Object.keys(saved.players).length}{" "}
                        players
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteLineup(saved.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-6">
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">RFL 90' Lineup Builder</h2>
            <div className="w-10 h-10 bg-black-500 rounded-full flex items-center justify-center">
              <Image
                src="/logo.png"
                draggable={false}
                alt="RFL 90"
                width={24}
                height={24}
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <div className="relative" ref={formationRef}>
              <button
                onClick={() => setFormationDropdownOpen(!formationDropdownOpen)}
                className="px-4 py-2 bg-white/5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <span>{currentFormation?.name}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${formationDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {formationDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-40 bg-[#1a1a1a] rounded-lg shadow-xl border border-white/10 z-10 py-1"
                  >
                    {formations.map((formation) => (
                      <button
                        key={formation.id}
                        onClick={() => {
                          setSelectedFormation(formation.id);
                          setFormationDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          selectedFormation === formation.id
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {formation.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setSelectedTab("club")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === "club"
                  ? "bg-white/10"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              Club
            </button>
            <button
              onClick={() => setSelectedTab("country")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === "country"
                  ? "bg-white/10"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              Country
            </button>
            <button
              onClick={handleSaveLineup}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 ml-auto"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>

          <div className="relative bg-linear-to-b from-green-900/20 via-green-900/10 to-green-900/20 rounded-xl p-8 overflow-hidden border border-white/5">
            <div className="absolute inset-0">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10"></div>
              <div className="absolute left-1/2 top-1/2 w-24 h-24 border border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

              <div className="absolute left-0 top-0 w-16 h-20 border-l border-t border-white/10"></div>
              <div className="absolute right-0 top-0 w-16 h-20 border-r border-t border-white/10"></div>
              <div className="absolute left-0 bottom-0 w-16 h-20 border-l border-b border-white/10"></div>
              <div className="absolute right-0 bottom-0 w-16 h-20 border-r border-b border-white/10"></div>

              <div className="absolute left-0 top-1/2 w-12 h-16 border-l border-t border-b border-white/10 -translate-y-1/2"></div>
              <div className="absolute right-0 top-1/2 w-12 h-16 border-r border-t border-b border-white/10 -translate-y-1/2"></div>

              <div className="absolute left-1/2 bottom-4 w-2 h-2 bg-white/20 rounded-full -translate-x-1/2"></div>
            </div>

            <div className="relative h-150 flex flex-col justify-between">
              {currentFormation?.positions.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className="flex justify-around items-center"
                >
                  {line.map((pos) => (
                    <motion.div
                      key={pos}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: pos * 0.05 }}
                      className="relative"
                    >
                      {lineup[pos] && (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLineup((prev) => {
                              const newLineup = { ...prev };
                              delete newLineup[pos];
                              return newLineup;
                            });
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors z-10 border border-white/10"
                        >
                          <X className="w-3 h-3 text-black" />
                        </motion.button>
                      )}
                      <button
                        onClick={() => handlePositionClick(pos)}
                        className="relative w-12 h-12 rounded-full bg-[#2a2a2a] border-2 border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer group"
                      >
                        {lineup[pos] ? (
                          <>
                            <div className="w-full h-full rounded-full overflow-hidden">
                              <Image
                                src={lineup[pos].image}
                                alt={lineup[pos].name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                              {lineup[pos].name}
                            </div>
                          </>
                        ) : (
                          <Plus className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <input
              type="text"
              placeholder="Enter lineup name"
              value={lineupName}
              onChange={(e) => setLineupName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="col-span-3">
        <div className="bg-[#1a1a1a] rounded-xl p-6 sticky top-24">
          <h3 className="font-semibold text-sm mb-4">Build your XI</h3>

          <div className="space-y-4 text-sm text-white/60 leading-relaxed">
            <p>
              Build your dream XI, pick your team's next lineup, or plan your
              transfer window.
            </p>
            <p>
              Start by clicking on an empty player and searching for the player
              you want to add, or by selecting a team to pre-fill and modify.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lineup;
