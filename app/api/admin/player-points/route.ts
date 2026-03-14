import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");
    const gameweek = searchParams.get("gameweek");

    const supabase = getServerSupabase();
    let query = supabase.from("player_gameweek_points").select("*");

    if (playerId) {
      query = query.eq("player_id", playerId);
    }

    if (gameweek) {
      query = query.eq("gameweek", parseInt(gameweek));
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ points: data });
  } catch (err) {
    console.error("Error fetching player points:", err);
    return NextResponse.json(
      { error: "Failed to fetch player points" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { playerId, gameweek, points } = body;

    if (!playerId || gameweek === undefined || points === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("player_gameweek_points")
      .upsert(
        {
          player_id: playerId,
          gameweek: parseInt(gameweek),
          gw_points: parseInt(points),
        },
        {
          onConflict: "player_id,gameweek",
        },
      )
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Error saving player points:", err);
    return NextResponse.json(
      { error: "Failed to save player points" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { playerId, gameweek, points } = body;

    if (!playerId || gameweek === undefined || points === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    const { data, error } = await supabase
      .from("player_gameweek_points")
      .update({ gw_points: parseInt(points) })
      .eq("player_id", playerId)
      .eq("gameweek", parseInt(gameweek))
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Error updating player points:", err);
    return NextResponse.json(
      { error: "Failed to update player points" },
      { status: 500 },
    );
  }
}
