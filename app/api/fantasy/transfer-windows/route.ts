import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameweek = searchParams.get("gameweek");
    const season = searchParams.get("season");
    const isActive = searchParams.get("isActive");

    const supabase = getServerSupabase();
    let query = supabase
      .from("transfer_windows")
      .select("*")
      .order("gameweek", { ascending: true });

    if (gameweek) {
      query = query.eq("gameweek", parseInt(gameweek));
    }
    if (season) {
      query = query.eq("season", season);
    }
    if (isActive === "true") {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ transferWindows: data });
  } catch (err) {
    console.error("Error fetching transfer windows:", err);
    return NextResponse.json(
      { error: "Failed to fetch transfer windows" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      gameweekId,
      gameweek,
      season,
      startDate,
      deadline,
      endDate,
      isActive,
      freeTransfers,
    } = body;

    if (!gameweek || !season || !startDate || !deadline || !endDate) {
      return NextResponse.json(
        {
          error:
            "Gameweek, season, startDate, deadline, and endDate are required",
        },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    if (isActive) {
      await supabase
        .from("transfer_windows")
        .update({ is_active: false })
        .eq("season", season);
    }

    const { data, error } = await supabase
      .from("transfer_windows")
      .insert({
        gameweek_id: gameweekId,
        gameweek,
        season,
        start_date: startDate,
        deadline,
        end_date: endDate,
        is_active: isActive ?? false,
        free_transfers: freeTransfers ?? 1,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, transferWindow: data });
  } catch (err) {
    console.error("Error creating transfer window:", err);
    return NextResponse.json(
      { error: "Failed to create transfer window" },
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
        { error: "Transfer window ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    if (data.isActive) {
      const { data: currentWindow } = await supabase
        .from("transfer_windows")
        .select("season")
        .eq("id", id)
        .single();

      if (currentWindow) {
        await supabase
          .from("transfer_windows")
          .update({ is_active: false })
          .eq("season", currentWindow.season)
          .neq("id", id);
      }
    }

    const updates: Record<string, unknown> = {};
    if (data.gameweekId !== undefined) updates.gameweek_id = data.gameweekId;
    if (data.gameweek !== undefined) updates.gameweek = data.gameweek;
    if (data.season !== undefined) updates.season = data.season;
    if (data.startDate !== undefined) updates.start_date = data.startDate;
    if (data.deadline !== undefined) updates.deadline = data.deadline;
    if (data.endDate !== undefined) updates.end_date = data.endDate;
    if (data.isActive !== undefined) updates.is_active = data.isActive;
    if (data.freeTransfers !== undefined)
      updates.free_transfers = data.freeTransfers;

    const { data: updatedData, error } = await supabase
      .from("transfer_windows")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, transferWindow: updatedData });
  } catch (err) {
    console.error("Error updating transfer window:", err);
    return NextResponse.json(
      { error: "Failed to update transfer window" },
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
        { error: "Transfer window ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase
      .from("transfer_windows")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting transfer window:", err);
    return NextResponse.json(
      { error: "Failed to delete transfer window" },
      { status: 500 },
    );
  }
}
