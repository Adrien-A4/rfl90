import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get("leagueId");

    const supabase = getServerSupabase();
    let query = supabase.from("teams").select("*").order("name");

    if (leagueId) {
      query = query.eq("league_id", leagueId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ teams: data });
  } catch (err) {
    console.error("Error fetching teams:", err);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const team = {
      league_id: body.leagueId || null,
      name: body.name,
      short_name: body.shortName || body.name.substring(0, 3).toUpperCase(),
      logo: body.logo || "/logos/teams/default.png",
      primary_color: body.primaryColor || "#1a1a1a",
      secondary_color: body.secondaryColor || "#2a2a2a",
      stadium: body.stadium || null,
      founded_year: body.foundedYear || null,
    };

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("teams")
      .insert(team)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, team: data });
  } catch (err) {
    console.error("Error creating team:", err);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    const updates = {
      name: data.name,
      short_name: data.shortName,
      logo: data.logo,
      primary_color: data.primaryColor,
      secondary_color: data.secondaryColor,
      stadium: data.stadium,
      founded_year: data.foundedYear,
    };

    const supabase = getServerSupabase();
    const { data: updatedData, error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, team: updatedData });
  } catch (err) {
    console.error("Error updating team:", err);
    return NextResponse.json(
      { error: "Failed to update team" },
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
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting team:", err);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 },
    );
  }
}
