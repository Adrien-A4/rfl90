import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userTeamId, chip, gameweekNumber } = body;

    if (!userTeamId || !chip || !gameweekNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const validChips = ["wildcard", "freehit", "bench_boost", "triple_captain"];
    if (!validChips.includes(chip)) {
      return NextResponse.json({ error: "Invalid chip" }, { status: 400 });
    }

    const supabase = getServerSupabase();

    const { data: userTeam, error: fetchError } = await supabase
      .from("user_teams")
      .select("*")
      .eq("id", userTeamId)
      .single();

    if (fetchError || !userTeam) {
      return NextResponse.json(
        { error: "User team not found" },
        { status: 404 },
      );
    }

    const chipField = `${chip}_used`;
    const chipGwkField = `${chip}_used_gw`;

    if (userTeam[chipField]) {
      return NextResponse.json({ error: "Chip already used" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_teams")
      .update({
        [chipField]: true,
        [chipGwkField]: gameweekNumber,
      })
      .eq("id", userTeamId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, userTeam: data });
  } catch (err) {
    console.error("Error using chip:", err);
    return NextResponse.json({ error: "Failed to use chip" }, { status: 500 });
  }
}
