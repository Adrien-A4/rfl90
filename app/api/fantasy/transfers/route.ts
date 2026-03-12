import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";
import {
  FREE_TRANSFERS_PER_GW,
  TRANSFER_PENALTY_PER_EXTRA,
} from "@/lib/formations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userTeamId = searchParams.get("userTeamId");
    const gameweek = searchParams.get("gameweek");

    const supabase = getServerSupabase();
    let query = supabase
      .from("user_transfers")
      .select(
        `
        *,
        playerIn:player_in_id(
          id, name, short_name, image, position, transfer_value,
          team:teams!players_team_id_fkey(id, name, short_name, logo)
        ),
        playerOut:player_out_id(
          id, name, short_name, image, position, transfer_value,
          team:teams!players_team_id_fkey(id, name, short_name, logo)
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (userTeamId) {
      query = query.eq("user_team_id", userTeamId);
    }
    if (gameweek) {
      query = query.eq("gameweek", parseInt(gameweek));
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ transfers: data });
  } catch (err) {
    console.error("Error fetching transfers:", err);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userTeamId, playerInId, playerOutId, gameweek } = body;

    if (!userTeamId || !playerInId || !playerOutId || !gameweek) {
      return NextResponse.json(
        {
          error:
            "User team ID, player in ID, player out ID, and gameweek are required",
        },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    const { data: userPlayerOut, error: userPlayerOutError } = await supabase
      .from("user_players")
      .select("player_id")
      .eq("id", playerOutId)
      .single();

    if (userPlayerOutError || !userPlayerOut) {
      return NextResponse.json(
        { error: "Player out not found in squad" },
        { status: 400 },
      );
    }

    const actualPlayerOutId = userPlayerOut.player_id;

    const { data: currentGw, error: gwError } = await supabase
      .from("gameweeks")
      .select("*")
      .eq("gameweek_number", gameweek)
      .single();

    if (gwError || !currentGw) {
      return NextResponse.json(
        { error: "Gameweek not found or not active" },
        { status: 400 },
      );
    }

    if (currentGw.status !== "active") {
      return NextResponse.json(
        { error: "Transfer window is closed for this gameweek" },
        { status: 400 },
      );
    }

    const now = new Date();
    if (new Date(currentGw.deadline) < now) {
      return NextResponse.json(
        { error: "Transfer deadline has passed for this gameweek" },
        { status: 400 },
      );
    }

    const { data: userTeam, error: teamError } = await supabase
      .from("user_teams")
      .select("*")
      .eq("id", userTeamId)
      .single();

    if (teamError || !userTeam) {
      return NextResponse.json(
        { error: "User team not found" },
        { status: 400 },
      );
    }

    const { data: playerIn, error: playerInError } = await supabase
      .from("players")
      .select("*, team:teams!players_team_id_fkey(id, name, short_name, logo)")
      .eq("id", playerInId)
      .single();

    if (playerInError || !playerIn) {
      return NextResponse.json(
        { error: "Player in not found" },
        { status: 400 },
      );
    }

    const { data: playerOut, error: playerOutError } = await supabase
      .from("players")
      .select("*")
      .eq("id", actualPlayerOutId)
      .single();

    if (playerOutError || !playerOut) {
      return NextResponse.json(
        { error: "Player out not found" },
        { status: 400 },
      );
    }

    const transferValue = playerIn.transfer_value || 0;
    const saleValue = playerOut.transfer_value || playerOut.purchase_price || 0;
    const netCost = transferValue - saleValue;

    if (userTeam.budget < netCost) {
      return NextResponse.json(
        { error: "Insufficient budget for this transfer" },
        { status: 400 },
      );
    }

    const transfersThisGw = userTeam.transfers_this_gw || 0;
    let isFreeTransfer = false;
    let pointsDeducted = 0;
    let transferCost = 0;

    if (transfersThisGw >= FREE_TRANSFERS_PER_GW) {
      pointsDeducted = TRANSFER_PENALTY_PER_EXTRA;
      transferCost = 0;
    } else {
      isFreeTransfer = true;
    }

    const { data: removedPlayer, error: removeError } = await supabase
      .from("user_players")
      .delete()
      .eq("user_team_id", userTeamId)
      .eq("player_id", playerOutId)
      .select()
      .single();

    if (removeError) {
      return NextResponse.json(
        { error: "Failed to remove player from squad" },
        { status: 400 },
      );
    }

    const { data: addedPlayer, error: addError } = await supabase
      .from("user_players")
      .insert({
        user_team_id: userTeamId,
        player_id: playerInId,
        squad_position: removedPlayer?.squad_position || "MID",
        is_starting: removedPlayer?.is_starting || true,
        position_in_squad: removedPlayer?.position_in_squad || 0,
        purchase_price: transferValue,
        purchase_gameweek: gameweek,
      })
      .select()
      .single();

    if (addError) {
      await supabase.from("user_players").insert({
        user_team_id: userTeamId,
        player_id: playerOutId,
        squad_position: removedPlayer?.squad_position || "MID",
        is_starting: removedPlayer?.is_starting || true,
        position_in_squad: removedPlayer?.position_in_squad || 0,
        purchase_price: saleValue,
        purchase_gameweek: removedPlayer?.purchase_gameweek || 1,
      });

      return NextResponse.json(
        { error: "Failed to add player to squad" },
        { status: 400 },
      );
    }

    const { data: transfer, error: transferError } = await supabase
      .from("user_transfers")
      .insert({
        user_team_id: userTeamId,
        player_in_id: playerInId,
        player_out_id: playerOutId,
        gameweek: gameweek,
        transfer_cost: transferCost,
        points_deducted: pointsDeducted,
        is_free_transfer: isFreeTransfer,
      })
      .select()
      .single();

    if (transferError) {
      return NextResponse.json(
        { error: "Failed to record transfer" },
        { status: 400 },
      );
    }

    const { error: updateTeamError } = await supabase
      .from("user_teams")
      .update({
        budget: userTeam.budget - netCost,
        transfers_this_gw: transfersThisGw + 1,
        transfer_penalty_points:
          (userTeam.transfer_penalty_points || 0) + pointsDeducted,
      })
      .eq("id", userTeamId);

    if (updateTeamError) {
      return NextResponse.json(
        { error: "Failed to update team budget" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      transfer: transfer,
      playerIn: playerIn,
      playerOut: playerOut,
      netCost: netCost,
      pointsDeducted: pointsDeducted,
      isFreeTransfer: isFreeTransfer,
    });
  } catch (err) {
    console.error("Error making transfer:", err);
    return NextResponse.json(
      { error: "Failed to make transfer" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, gameweek } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Transfer ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    const { error: updateError } = await supabase
      .from("user_teams")
      .update({ transfers_this_gw: 0 })
      .eq("id", body.userTeamId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to reset transfer count" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error resetting transfers:", err);
    return NextResponse.json(
      { error: "Failed to reset transfers" },
      { status: 500 },
    );
  }
}
