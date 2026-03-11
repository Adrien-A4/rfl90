import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-helpers";
import { INITIAL_BUDGET } from "@/lib/formations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const season = searchParams.get("season");

    const supabase = getServerSupabase();

    let query = supabase
      .from("user_teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (season) {
      query = query.eq("season", season);
    }

    const { data: userTeams, error } = await query;
    if (error) throw error;

    if (userTeams && userTeams.length > 0) {
      const teamIds = userTeams.map((t) => t.id);
      const { data: userPlayers } = await supabase
        .from("user_players")
        .select("*")
        .in("user_team_id", teamIds);

      if (userPlayers && userPlayers.length > 0) {
        const playerIds = userPlayers.map((up) => up.player_id);
        const { data: players } = await supabase
          .from("players")
          .select("*, team:teams(id, name, short_name, logo)")
          .in("id", playerIds);

        const playersMap = new Map(players?.map((p) => [p.id, p]) || []);
        const userPlayersWithDetails = userPlayers.map((up) => ({
          ...up,
          player: playersMap.get(up.player_id),
        }));

        const userTeamsMap = new Map(userTeams.map((t) => [t.id, t]));
        const finalData = userTeams.map((ut) => ({
          ...ut,
          players: userPlayersWithDetails.filter(
            (up) => up.user_team_id === ut.id,
          ),
        }));

        return NextResponse.json({ userTeams: finalData });
      }

      return NextResponse.json({
        userTeams: userTeams.map((ut) => ({ ...ut, players: [] })),
      });
    }

    return NextResponse.json({ userTeams: [] });
  } catch (err) {
    console.error("Error fetching user teams:", err);
    return NextResponse.json(
      { error: "Failed to fetch user teams" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId;
    const teamName = body.teamName || "My Team";
    const season = body.season || "2025";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    const existingTeam = await supabase
      .from("user_teams")
      .select("id")
      .eq("user_id", userId)
      .eq("season", season)
      .single();

    if (existingTeam.data) {
      return NextResponse.json(
        { error: "User already has a team for this season" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("user_teams")
      .insert({
        user_id: userId,
        team_name: teamName,
        budget: INITIAL_BUDGET,
        formation: "4-4-2",
        gameweek: 1,
        total_points: 0,
        transfers_this_gw: 0,
        transfer_penalty_points: 0,
        season: season,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, userTeam: data });
  } catch (err) {
    console.error("Error creating user team:", err);
    return NextResponse.json(
      { error: "Failed to create user team" },
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
        { error: "User team ID is required" },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    if (data.teamName !== undefined) updates.team_name = data.teamName;
    if (data.formation !== undefined) updates.formation = data.formation;
    if (data.budget !== undefined) updates.budget = data.budget;
    if (data.gameweek !== undefined) updates.gameweek = data.gameweek;
    if (data.totalPoints !== undefined) updates.total_points = data.totalPoints;
    if (data.rank !== undefined) updates.rank = data.rank;
    if (data.transfersThisGw !== undefined)
      updates.transfers_this_gw = data.transfersThisGw;
    if (data.transferPenaltyPoints !== undefined)
      updates.transfer_penalty_points = data.transferPenaltyPoints;
    if (data.captainId !== undefined) updates.captain_id = data.captainId;
    if (data.viceCaptainId !== undefined)
      updates.vice_captain_id = data.viceCaptainId;

    const supabase = getServerSupabase();
    const { data: updatedData, error } = await supabase
      .from("user_teams")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, userTeam: updatedData });
  } catch (err) {
    console.error("Error updating user team:", err);
    return NextResponse.json(
      { error: "Failed to update user team" },
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
        { error: "User team ID is required" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("user_teams").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting user team:", err);
    return NextResponse.json(
      { error: "Failed to delete user team" },
      { status: 500 },
    );
  }
}
