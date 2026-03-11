import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameweekNumber = searchParams.get("gameweekNumber");
    const season = searchParams.get("season");
    const status = searchParams.get("status");

    const supabase = getServerSupabase();
    let query = supabase
      .from("gameweeks")
      .select("*")
      .order("gameweek_number", { ascending: true });

    if (gameweekNumber) {
      query = query.eq("gameweek_number", parseInt(gameweekNumber));
    }
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
    const { gameweekNumber, season, startDate, endDate, deadline, status } =
      body;

    if (!gameweekNumber || !season || !startDate || !endDate || !deadline) {
      return NextResponse.json(
        {
          error:
            "Gameweek number, season, start date, end date, and deadline are required",
        },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    const existingGw = await supabase
      .from("gameweeks")
      .select("id")
      .eq("gameweek_number", gameweekNumber)
      .eq("season", season)
      .single();

    if (existingGw.data) {
      return NextResponse.json(
        { error: "Gameweek already exists" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("gameweeks")
      .insert({
        gameweek_number: gameweekNumber,
        season: season,
        start_date: startDate,
        end_date: endDate,
        deadline: deadline,
        status: status || "upcoming",
      })
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

    const updates: Record<string, unknown> = {};
    if (data.startDate !== undefined) updates.start_date = data.startDate;
    if (data.endDate !== undefined) updates.end_date = data.endDate;
    if (data.deadline !== undefined) updates.deadline = data.deadline;
    if (data.status !== undefined) updates.status = data.status;

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
    const gameweekNumber = searchParams.get("gameweekNumber");
    const season = searchParams.get("season");

    const supabase = getServerSupabase();

    if (id) {
      const { error } = await supabase.from("gameweeks").delete().eq("id", id);

      if (error) throw error;
    } else if (gameweekNumber && season) {
      const { error } = await supabase
        .from("gameweeks")
        .delete()
        .eq("gameweek_number", parseInt(gameweekNumber))
        .eq("season", season);

      if (error) throw error;
    } else {
      return NextResponse.json(
        { error: "Either ID or gameweekNumber and season are required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting gameweek:", err);
    return NextResponse.json(
      { error: "Failed to delete gameweek" },
      { status: 500 },
    );
  }
}
