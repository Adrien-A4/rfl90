import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get("leagueId");
    const status = searchParams.get("status");
    const matchId = searchParams.get("matchId");

    const supabase = getServerSupabase();

    if (matchId) {
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          *,
          home_team:teams!matches_home_team_id_fkey (id, name, short_name, logo, primary_color, secondary_color),
          away_team:teams!matches_away_team_id_fkey (id, name, short_name, logo, primary_color, secondary_color),
          league:leagues!matches_league_id_fkey (id, name, short_name, logo)
        `,
        )
        .eq("id", matchId)
        .single();

      if (error) throw error;
      return NextResponse.json({ matches: [data] });
    }

    let query = supabase
      .from("matches")
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey (id, name, short_name, logo, primary_color, secondary_color),
        away_team:teams!matches_away_team_id_fkey (id, name, short_name, logo, primary_color, secondary_color),
        league:leagues!matches_league_id_fkey (id, name, short_name, logo)
      `,
      )
      .order("scheduled_at", { ascending: false });

    if (leagueId) {
      query = query.eq("league_id", leagueId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ matches: data });
  } catch (err) {
    console.error("Error fetching matches:", err);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const match = {
      league_id: body.leagueId || null,
      home_team_id: body.homeTeamId,
      away_team_id: body.awayTeamId,
      home_score: body.homeScore ?? null,
      away_score: body.awayScore ?? null,
      status: body.status || "scheduled",
      scheduled_at: body.scheduledAt || new Date().toISOString(),
      competition: body.competition || "League",
      round: body.round || "1",
      venue: body.venue || null,
      referee: body.referee || null,
    };

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("matches")
      .insert(match)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, match: data });
  } catch (err) {
    console.error("Error creating match:", err);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Match ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, match: data });
  } catch (err) {
    console.error("Error updating match:", err);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Match ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("matches").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting match:", err);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 },
    );
  }
}
