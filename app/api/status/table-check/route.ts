import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = createServerClient();

    const tables = [
      "players",
      "teams",
      "matches",
      "leagues",
      "user_players",
      "user_team",
      "transfers",
      "news",
      "gameweeks",
      "transfer_windows",
    ];

    const results: Record<
      string,
      { rowCount: number | null; error: string | null }
    > = {};

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          results[table] = { rowCount: null, error: error.message };
        } else {
          results[table] = { rowCount: count, error: null };
        }
      } catch (tableError) {
        results[table] = { rowCount: null, error: "Failed to fetch" };
      }
    }

    return NextResponse.json({
      success: true,
      tables: results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check tables", tables: null },
      { status: 500 },
    );
  }
}
