import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = searchParams.get("season");

    const supabase = getServerSupabase();
    let query = supabase
      .from("user_teams")
      .select(
        `
        id,
        team_name,
        total_points,
        user_id
      `,
      )
      .order("total_points", { ascending: false });

    if (season) {
      query = query.eq("season", season);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;

    if (!leaderboard || leaderboard.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }
    const userIds = leaderboard.map((entry) => entry.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    const botToken = process.env.BOT_TOKEN;

    const updatedLeaderboard = await Promise.all(
      leaderboard.map(async (entry, index) => {
        let profile = profileMap.get(entry.user_id);
        const isDummy = profile?.username?.startsWith("User ");

        if ((!profile || isDummy) && botToken && index < 50) {
          try {
            const res = await fetch(
              `https://discord.com/api/users/${entry.user_id}`,
              {
                headers: { Authorization: `Bot ${botToken}` },
              },
            );

            if (res.ok) {
              const discordUser = await res.json();
              profile = {
                id: entry.user_id,
                username: discordUser.username,
                avatar: discordUser.avatar,
                discriminator: discordUser.discriminator,
                updated_at: new Date().toISOString(),
              };
              await supabase.from("profiles").upsert(profile);
            } else if (res.status === 401) {
              console.error(
                "Leaderboard API: BOT_TOKEN is invalid (Unauthorized)",
              );
            } else if (res.status === 404) {
              console.error(
                `Leaderboard API: Discord ID ${entry.user_id} not found.`,
              );
            }
          } catch (err) {
            console.error(
              `Leaderboard API: Failed to fetch for ${entry.user_id}:`,
              err,
            );
          }
        }

        return {
          ...entry,
          profiles: profile || {
            username: `Manager ${entry.user_id.substring(0, 5)}`,
            avatar: null,
            discriminator: "0000",
          },
        };
      }),
    );

    return NextResponse.json({ leaderboard: updatedLeaderboard });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
