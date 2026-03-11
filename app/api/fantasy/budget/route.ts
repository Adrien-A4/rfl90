import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userTeamId = searchParams.get("userTeamId");

    if (!userTeamId) {
      return NextResponse.json(
        { error: "User team ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("user_teams")
      .select(
        "id, budget, total_points, transfers_this_gw, transfer_penalty_points, formation, gameweek",
      )
      .eq("id", userTeamId)
      .single();

    if (error) throw error;

    const { data: players, error: playersError } = await supabase
      .from("user_players")
      .select("player_id, purchase_price, squad_position, is_starting")
      .eq("user_team_id", userTeamId);

    if (playersError) throw playersError;

    const squadValue =
      players?.reduce(
        (sum: number, p: { purchase_price: number }) =>
          sum + (p.purchase_price || 0),
        0,
      ) || 0;

    const benchValue =
      players
        ?.filter((p: { is_starting: boolean }) => !p.is_starting)
        .reduce(
          (sum: number, p: { purchase_price: number }) =>
            sum + (p.purchase_price || 0),
          0,
        ) || 0;

    const startingValue =
      players
        ?.filter((p: { is_starting: boolean }) => p.is_starting)
        .reduce(
          (sum: number, p: { purchase_price: number }) =>
            sum + (p.purchase_price || 0),
          0,
        ) || 0;

    return NextResponse.json({
      budget: data.budget,
      totalPoints: data.total_points,
      transfersThisGw: data.transfers_this_gw,
      transferPenaltyPoints: data.transfer_penalty_points,
      squadValue,
      benchValue,
      startingValue,
      formation: data.formation,
      gameweek: data.gameweek,
    });
  } catch (err) {
    console.error("Error fetching budget:", err);
    return NextResponse.json(
      { error: "Failed to fetch budget" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userTeamId, budget, transferPenaltyPoints, transfersThisGw } = body;

    if (!userTeamId) {
      return NextResponse.json(
        { error: "User team ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const updates: Record<string, unknown> = {};

    if (budget !== undefined) updates.budget = budget;
    if (transferPenaltyPoints !== undefined)
      updates.transfer_penalty_points = transferPenaltyPoints;
    if (transfersThisGw !== undefined)
      updates.transfers_this_gw = transfersThisGw;

    const { data, error } = await supabase
      .from("user_teams")
      .update(updates)
      .eq("id", userTeamId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, userTeam: data });
  } catch (err) {
    console.error("Error updating budget:", err);
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 },
    );
  }
}
