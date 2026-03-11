import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userTeamId = searchParams.get("userTeamId");

    const supabase = getServerSupabase();
    let query = supabase
      .from("user_players")
      .select(
        `
        *,
        player:players(
          *,
          team:teams!players_team_id_fkey(id, name, short_name, logo, primary_color, secondary_color)
        )
      `,
      )
      .order("position_in_squad", { ascending: true });

    if (userTeamId) {
      query = query.eq("user_team_id", userTeamId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ userPlayers: data });
  } catch (err) {
    console.error("Error fetching user players:", err);
    return NextResponse.json(
      { error: "Failed to fetch user players" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userTeamId,
      playerId,
      squadPosition,
      slotId,
      isStarting,
      positionInSquad,
      purchasePrice,
      purchaseGameweek,
    } = body;

    if (!userTeamId || !playerId || !squadPosition) {
      return NextResponse.json(
        { error: "User team ID, player ID, and squad position are required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    const existingPlayer = await supabase
      .from("user_players")
      .select("id")
      .eq("user_team_id", userTeamId)
      .eq("player_id", playerId)
      .single();

    if (existingPlayer.data) {
      return NextResponse.json(
        { error: "Player already in squad" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("user_players")
      .insert({
        user_team_id: userTeamId,
        player_id: playerId,
        squad_position: squadPosition,
        slot_id: slotId,
        is_starting: isStarting ?? true,
        position_in_squad: positionInSquad ?? 0,
        purchase_price: purchasePrice ?? 0,
        purchase_gameweek: purchaseGameweek ?? 1,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, userPlayer: data });
  } catch (err) {
    console.error("Error adding player to squad:", err);
    return NextResponse.json(
      { error: "Failed to add player to squad" },
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
        { error: "User player ID is required" },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    if (data.squadPosition !== undefined)
      updates.squad_position = data.squadPosition;
    if (data.isStarting !== undefined) updates.is_starting = data.isStarting;
    if (data.positionInSquad !== undefined)
      updates.position_in_squad = data.positionInSquad;
    if (data.purchasePrice !== undefined)
      updates.purchase_price = data.purchasePrice;
    if (data.purchaseGameweek !== undefined)
      updates.purchase_gameweek = data.purchaseGameweek;

    const supabase = getServerSupabase();
    const { data: updatedData, error } = await supabase
      .from("user_players")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, userPlayer: updatedData });
  } catch (err) {
    console.error("Error updating user player:", err);
    return NextResponse.json(
      { error: "Failed to update user player" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userTeamId = searchParams.get("userTeamId");
    const playerId = searchParams.get("playerId");

    const supabase = getServerSupabase();

    if (id) {
      const { error } = await supabase
        .from("user_players")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } else if (userTeamId && playerId) {
      const { error } = await supabase
        .from("user_players")
        .delete()
        .eq("user_team_id", userTeamId)
        .eq("player_id", playerId);

      if (error) throw error;
    } else {
      return NextResponse.json(
        { error: "Either ID or userTeamId and playerId are required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error removing player from squad:", err);
    return NextResponse.json(
      { error: "Failed to remove player from squad" },
      { status: 500 },
    );
  }
}
