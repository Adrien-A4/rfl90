import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isListed = searchParams.get("isListed");

    const supabase = getServerSupabase();
    let query = supabase
      .from("transfer_market")
      .select(
        `
        *,
        player:players!transfer_market_player_id_fkey (
          id, name, short_name, image, position, rating, age, nationality,
          team:teams!players_team_id_fkey (id, name, short_name, logo)
        )
      `,
      )
      .order("market_value", { ascending: false });

    if (isListed !== null) {
      query = query.eq("is_listed", isListed === "true");
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ transferMarket: data });
  } catch (err) {
    console.error("Error fetching transfer market:", err);
    return NextResponse.json(
      { error: "Failed to fetch transfer market" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const listing = {
      player_id: body.playerId,
      current_team_id: body.currentTeamId,
      asking_price: body.askingPrice,
      market_value: body.marketValue || 0,
      is_listed: true,
      listed_date: new Date().toISOString().split("T")[0],
      expiry_date: body.expiryDate || null,
    };

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("transfer_market")
      .upsert(listing)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, listing: data });
  } catch (err) {
    console.error("Error listing player:", err);
    return NextResponse.json(
      { error: "Failed to list player" },
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
        { error: "Transfer market listing ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("transfer_market")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, listing: data });
  } catch (err) {
    console.error("Error updating transfer market listing:", err);
    return NextResponse.json(
      { error: "Failed to update listing" },
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
        { error: "Transfer market listing ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase
      .from("transfer_market")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting transfer market listing:", err);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 },
    );
  }
}
