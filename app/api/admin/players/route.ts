import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    const supabase = getServerSupabase();
    let query = supabase
      .from("players")
      .select(
        `
        *,
        team:teams!players_team_id_fkey (id, name, short_name, logo, primary_color, secondary_color)
      `,
      )
      .order("rating", { ascending: false });

    if (teamId) {
      query = query.eq("team_id", teamId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ players: data });
  } catch (err) {
    console.error("Error fetching players:", err);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const player = {
      team_id: body.teamId,
      name: body.name,
      short_name: body.shortName || body.name.substring(0, 2).toUpperCase(),
      image: body.image ?? "/noFilter.png",
      position: body.position,
      rating: body.rating || 75,
      age: body.age || 25,
      nationality: body.nationality || "Unknown",
      height: body.height || null,
      weight: body.weight || null,
      jersey_number: body.jerseyNumber || null,
      contract_until: body.contractUntil || null,
      market_value: body.marketValue || 0,
    };

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("players")
      .insert(player)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, player: data });
  } catch (err) {
    console.error("Error creating player:", err);
    return NextResponse.json(
      { error: "Failed to create player" },
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
        { error: "Player ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("players")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, player: data });
  } catch (err) {
    console.error("Error updating player:", err);
    return NextResponse.json(
      { error: "Failed to update player" },
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
        { error: "Player ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting player:", err);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 },
    );
  }
}
