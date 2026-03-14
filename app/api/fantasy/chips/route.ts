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

    let updates: Record<string, any> = {
      [chipField]: true,
      [chipGwkField]: gameweekNumber,
    };
    if (chip === "freehit") {
      const { data: userPlayers } = await supabase
        .from("user_players")
        .select("player_id, squad_position, is_starting, slot_id")
        .eq("user_team_id", userTeamId);

      if (userPlayers && userPlayers.length > 0) {
        updates.freehit_player_ids = userPlayers.map((p) => p.player_id);
        updates.freehit_squad_positions = userPlayers.map(
          (p) => p.squad_position,
        );
        updates.freehit_is_starting = userPlayers.map((p) => p.is_starting);
        updates.freehit_slot_ids = userPlayers.map((p) => p.slot_id);
      }
    }

    const { data, error } = await supabase
      .from("user_teams")
      .update(updates)
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userTeamId, action } = body;

    if (!userTeamId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    if (action === "revert_freehit") {
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
      if (
        !userTeam.freehit_player_ids ||
        userTeam.freehit_player_ids.length === 0
      ) {
        return NextResponse.json(
          { error: "No Free Hit state to revert" },
          { status: 400 },
        );
      }
      await supabase
        .from("user_players")
        .delete()
        .eq("user_team_id", userTeamId);

      const originalPlayers = userTeam.freehit_player_ids.map(
        (playerId: string, index: number) => ({
          user_team_id: userTeamId,
          player_id: playerId,
          squad_position: userTeam.freehit_squad_positions?.[index] || "MID",
          is_starting: userTeam.freehit_is_starting?.[index] || true,
          slot_id: userTeam.freehit_slot_ids?.[index] || null,
          position_in_squad: index,
          purchase_price: 0,
          purchase_gameweek: 1,
        }),
      );

      const { error: insertError } = await supabase
        .from("user_players")
        .insert(originalPlayers);

      if (insertError) throw insertError;
      const { error: updateError } = await supabase
        .from("user_teams")
        .update({
          freehit_player_ids: [],
          freehit_squad_positions: [],
          freehit_is_starting: [],
          freehit_slot_ids: [],
        })
        .eq("id", userTeamId);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Error performing chip action:", err);
    return NextResponse.json(
      { error: "Failed to perform chip action" },
      { status: 500 },
    );
  }
}
