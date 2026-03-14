import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userTeamId = searchParams.get("userTeamId");
    const gameweek = searchParams.get("gameweek");
    const teamId = searchParams.get("teamId");

    const supabase = getServerSupabase();

    let query = supabase
      .from("matches")
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo, primary_color),
        away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo, primary_color)
      `,
      )
      .eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });

    if (teamId) {
      query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
    }

    const { data: matches, error } = await query;
    if (error) throw error;

    const fixturesWithDifficulty = (matches || []).map((match) => {
      const userTeamIdNum =
        match.home_team_id === teamId ? match.home_team_id : match.away_team_id;
      const isHome = match.home_team_id === teamId;

      return {
        ...match,
        team: isHome ? match.home_team : match.away_team,
        opponent: isHome ? match.away_team : match.home_team,
        difficulty: isHome ? match.home_difficulty : match.away_difficulty,
        opponentDifficulty: isHome
          ? match.away_difficulty
          : match.home_difficulty,
        isHome,
      };
    });

    return NextResponse.json({ fixtures: fixturesWithDifficulty });
  } catch (err) {
    console.error("Error fetching fixtures:", err);
    return NextResponse.json(
      { error: "Failed to fetch fixtures" },
      { status: 500 },
    );
  }
}
