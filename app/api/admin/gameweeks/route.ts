import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = searchParams.get("season");
    const status = searchParams.get("status");

    const supabase = getServerSupabase();
    let query = supabase.from("gameweeks").select("*").order("gameweek_number");

    if (season) {
      query = query.eq("season", season);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ gameweeks: data });
  } catch (err) {
    console.error("Error fetching gameweeks:", err);
    return NextResponse.json(
      { error: "Failed to fetch gameweeks" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const gameweek = {
      gameweek_number: body.gameweekNumber,
      season: body.season,
      start_date: body.startDate,
      end_date: body.endDate,
      deadline: body.deadline,
      status: body.status || "upcoming",
    };

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("gameweeks")
      .insert(gameweek)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, gameweek: data });
  } catch (err) {
    console.error("Error creating gameweek:", err);
    return NextResponse.json(
      { error: "Failed to create gameweek" },
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
        { error: "Gameweek ID is required" },
        { status: 400 },
      );
    }

    const updates = {
      gameweek_number: data.gameweekNumber,
      season: data.season,
      start_date: data.startDate,
      end_date: data.endDate,
      deadline: data.deadline,
      status: data.status,
    };

    const supabase = getServerSupabase();
    const { data: updatedData, error } = await supabase
      .from("gameweeks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, gameweek: updatedData });
  } catch (err) {
    console.error("Error updating gameweek:", err);
    return NextResponse.json(
      { error: "Failed to update gameweek" },
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
        { error: "Gameweek ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("gameweeks").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting gameweek:", err);
    return NextResponse.json(
      { error: "Failed to delete gameweek" },
      { status: 500 },
    );
  }
}
