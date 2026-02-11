import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("leagues")
      .select("*")
      .order("name");

    if (error) throw error;

    return NextResponse.json({ leagues: data });
  } catch (err) {
    console.error("Error fetching leagues:", err);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const league = {
      name: body.name,
      short_name: body.shortName || body.name.substring(0, 3).toUpperCase(),
      logo: body.logo || "/logos/leagues/default.png",
      country: body.country,
      tier: body.tier || 1,
      season: body.season,
    };

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("leagues")
      .insert(league)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, league: data });
  } catch (err) {
    console.error("Error creating league:", err);
    return NextResponse.json(
      { error: "Failed to create league" },
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
        { error: "League ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("leagues")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, league: data });
  } catch (err) {
    console.error("Error updating league:", err);
    return NextResponse.json(
      { error: "Failed to update league" },
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
        { error: "League ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("leagues").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting league:", err);
    return NextResponse.json(
      { error: "Failed to delete league" },
      { status: 500 },
    );
  }
}
