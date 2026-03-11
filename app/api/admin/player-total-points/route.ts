import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json(
        { error: "playerId is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    const { data, error } = await supabase
      .from("player_gameweek_points")
      .select("points")
      .eq("player_id", playerId);

    if (error) throw error;

    const totalPoints = data.reduce(
      (sum, record) => sum + (record.points || 0),
      0,
    );

    return NextResponse.json({ totalPoints });
  } catch (err) {
    console.error("Error fetching total points:", err);
    return NextResponse.json(
      { error: "Failed to fetch total points" },
      { status: 500 },
    );
  }
}
