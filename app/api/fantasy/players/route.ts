import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position");
    const teamId = searchParams.get("teamId");
    const minValue = searchParams.get("minValue");
    const maxValue = searchParams.get("maxValue");
    const tier = searchParams.get("tier");
    const userTeamId = searchParams.get("userTeamId");

    const supabase = getServerSupabase();
    let query = supabase
      .from("players")
      .select(
        `
        *,
        team:teams!players_team_id_fkey(id, name, short_name, logo, primary_color, secondary_color)
      `,
      )
      .order("transfer_value", { ascending: false });

    if (position) {
      query = query.eq("position", position);
    }
    if (teamId) {
      query = query.eq("team_id", teamId);
    }
    if (tier) {
      query = query.eq("tier", tier);
    }
    if (minValue) {
      query = query.gte("transfer_value", parseFloat(minValue));
    }
    if (maxValue) {
      query = query.lte("transfer_value", parseFloat(maxValue));
    }

    const { data: players, error } = await query;
    if (error) throw error;

    // Fetch total points for all players
    const { data: pointsData } = await supabase
      .from("player_gameweek_points")
      .select("player_id, gw_points");

    const pointsMap = new Map<string, number>();
    pointsData?.forEach((p) => {
      const current = pointsMap.get(p.player_id) || 0;
      pointsMap.set(p.player_id, current + (p.gw_points || 0));
    });

    let userPlayerIds: string[] = [];
    if (userTeamId) {
      const { data: userPlayers } = await supabase
        .from("user_players")
        .select("player_id")
        .eq("user_team_id", userTeamId);

      userPlayerIds = (userPlayers || []).map((p) => p.player_id);
    }

    const playersWithAvailability = (players || []).map((player) => ({
      ...player,
      total_points: pointsMap.get(player.id) || 0,
      isInSquad: userPlayerIds.includes(player.id),
    }));

    return NextResponse.json({ players: playersWithAvailability });
  } catch (err) {
    console.error("Error fetching players:", err);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 },
    );
  }
}
