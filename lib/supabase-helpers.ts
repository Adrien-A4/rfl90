import { supabase, createServerClient } from "./supabase";

export function getServerSupabase() {
  return createServerClient();
}

export async function getLeagues() {
  const { data, error } = await supabase
    .from("leagues")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createLeague(league: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("leagues")
    .insert(league)
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function getTeams(leagueId?: string) {
  let query = supabase.from("teams").select("*").order("name");

  if (leagueId) {
    query = query.eq("league_id", leagueId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createTeam(team: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("teams")
    .insert(team)
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function getPlayers(teamId?: string) {
  let query = supabase.from("players").select("*").order("name");

  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createPlayer(player: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("players")
    .insert(player)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlayer(
  id: string,
  updates: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMatches(leagueId?: string, status?: string) {
  let query = supabase
    .from("matches")
    .select("*")
    .order("scheduled_at", { ascending: false });

  if (leagueId) {
    query = query.eq("league_id", leagueId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createMatch(match: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("matches")
    .insert(match)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMatch(
  id: string,
  updates: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTransferMarket(isListed?: boolean) {
  let query = supabase
    .from("transfer_market")
    .select("*")
    .order("market_value", { ascending: false });

  if (isListed !== undefined) {
    query = query.eq("is_listed", isListed);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listPlayerOnTransferMarket(
  playerId: string,
  askingPrice: number,
  expiryDate?: string,
) {
  const listing = {
    player_id: playerId,
    asking_price: askingPrice,
    is_listed: true,
    listed_date: new Date().toISOString().split("T")[0],
    expiry_date: expiryDate || null,
  };

  const { data, error } = await supabase
    .from("transfer_market")
    .upsert(listing)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeTransfer(
  marketId: string,
  toTeamId: string,
  transferFee: number,
) {
  const supabase = getServerSupabase();

  const { data: listing } = await supabase
    .from("transfer_market")
    .select("*")
    .eq("id", marketId)
    .single();

  if (!listing) throw new Error("Transfer listing not found");

  await supabase
    .from("players")
    .update({ team_id: toTeamId })
    .eq("id", listing.player_id);

  const transfer = {
    player_id: listing.player_id,
    from_team_id: listing.current_team_id,
    to_team_id: toTeamId,
    transfer_fee: transferFee,
    status: "completed",
    transfer_date: new Date().toISOString().split("T")[0],
    season: new Date().getFullYear().toString(),
  };

  await supabase.from("transfers").insert(transfer);

  if (listing.is_listed) {
    await supabase
      .from("transfer_market")
      .update({ is_listed: false })
      .eq("id", marketId);
  }

  return { success: true };
}

export async function getTransfers(season?: string) {
  let query = supabase
    .from("transfers")
    .select("*")
    .order("transfer_date", { ascending: false });

  if (season) {
    query = query.eq("season", season);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createTransfer(transfer: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("transfers")
    .insert(transfer)
    .select()
    .single();

  if (error) throw error;
  return data;
}
