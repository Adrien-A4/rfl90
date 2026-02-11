import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = searchParams.get("season");
    const playerId = searchParams.get("playerId");

    const supabase = getServerSupabase();
    let query = supabase
      .from("transfers")
      .select(
        `
        *,
        player:players!transfers_player_id_fkey (
          id, name, short_name, image, position, rating
        ),
        from_team:teams!transfers_from_team_id_fkey (
          id, name, short_name, logo
        ),
        to_team:teams!transfers_to_team_id_fkey (
          id, name, short_name, logo
        )
      `,
      )
      .order("transfer_date", { ascending: false });

    if (season) {
      query = query.eq("season", season);
    }

    if (playerId) {
      query = query.eq("player_id", playerId);
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

    const transfer = {
      player_id: body.playerId,
      from_team_id: body.fromTeamId,
      to_team_id: body.toTeamId,
      transfer_fee: body.transferFee || 0,
      status: body.status || "completed",
      transfer_date:
        body.transferDate || new Date().toISOString().split("T")[0],
      season: body.season || new Date().getFullYear().toString(),
    };

    const supabase = getServerSupabase();

    const { data, error } = await supabase
      .from("transfers")
      .insert(transfer)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("players")
      .update({ team_id: body.toTeamId })
      .eq("id", body.playerId);

    if (body.transferMarketId) {
      await supabase
        .from("transfer_market")
        .update({ is_listed: false })
        .eq("id", body.transferMarketId);
    }

    return NextResponse.json({ success: true, transfer: data });
  } catch (err) {
    console.error("Error creating transfer:", err);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 },
    );
  }
}
