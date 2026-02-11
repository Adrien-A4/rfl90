"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Clock, Trophy } from "lucide-react";
import Image from "next/image";

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: string;
  scheduled_at: string;
  competition: string;
  round: string;
  venue: string;
  home_team?: {
    id: string;
    name: string;
    short_name: string;
    logo: string;
    primary_color: string;
    secondary_color: string;
  };
  away_team?: {
    id: string;
    name: string;
    short_name: string;
    logo: string;
    primary_color: string;
    secondary_color: string;
  };
}

interface MatchEvent {
  id: string;
  player_id: string;
  event_type: string;
  minute: number;
  player?: {
    name: string;
    short_name: string;
  };
}

export default function MatchPage({
  params,
}: {
  params: Promise<{ matchid: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(
          `/api/admin/matches?matchId=${resolvedParams.matchid}`,
        );
        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          setMatch(data.matches[0]);
        }
      } catch (err) {
        console.error("Failed to fetch match:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [resolvedParams.matchid]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "bg-green-900/30 text-green-400";
      case "live":
        return "bg-red-900/30 text-red-400";
      default:
        return "bg-yellow-900/30 text-yellow-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-32"></div>
            <div className="h-64 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Match not found</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white/60">{match.competition}</span>
              </div>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(match.status)}`}
              >
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(match.scheduled_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span>{formatTime(match.scheduled_at)}</span>
              </div>
            </div>

            {match.venue && (
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                <span>{match.venue}</span>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-4 flex-1">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor:
                      match.home_team?.primary_color || "#1a1a1a",
                  }}
                >
                  {match.home_team?.logo ? (
                    <Image
                      src={match.home_team.logo}
                      alt={match.home_team.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color: match.home_team?.secondary_color || "#ffffff",
                      }}
                    >
                      {match.home_team?.short_name || "??"}
                    </span>
                  )}
                </div>
                <span className="text-lg font-medium text-center">
                  {match.home_team?.name || "Home Team"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-4xl font-bold">
                  {match.status === "scheduled" ? (
                    <span className="text-white/40">vs</span>
                  ) : (
                    <span>
                      {match.home_score} - {match.away_score}
                    </span>
                  )}
                </div>
                <span className="text-sm text-white/40">{match.round}</span>
              </div>

              <div className="flex flex-col items-center gap-4 flex-1">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor:
                      match.away_team?.primary_color || "#1a1a1a",
                  }}
                >
                  {match.away_team?.logo ? (
                    <Image
                      src={match.away_team.logo}
                      alt={match.away_team.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color: match.away_team?.secondary_color || "#ffffff",
                      }}
                    >
                      {match.away_team?.short_name || "??"}
                    </span>
                  )}
                </div>
                <span className="text-lg font-medium text-center">
                  {match.away_team?.name || "Away Team"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
