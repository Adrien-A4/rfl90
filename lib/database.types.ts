export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

export type MatchStatus = "scheduled" | "live" | "finished";

export type TransferStatus = "active" | "completed" | "cancelled";

export interface League {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  tier: number;
  season: string;
  created_at: string;
}

export interface Team {
  id: string;
  league_id: string;
  name: string;
  short_name: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
  stadium: string;
  founded_year: number;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  short_name: string;
  image: string;
  position: PlayerPosition;
  rating: number;
  age: number;
  nationality: string;
  height: number;
  weight: number;
  jersey_number: number;
  contract_until: string;
  market_value: number;
  created_at: string;
}

export interface Match {
  id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  scheduled_at: string;
  competition: string;
  round: string;
  venue: string;
  referee: string;
  created_at: string;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  event_type:
    | "goal"
    | "assist"
    | "yellow_card"
    | "red_card"
    | "substitution"
    | "penalty"
    | "own_goal";
  minute: number;
  created_at: string;
}

export interface Transfer {
  id: string;
  player_id: string;
  from_team_id: string;
  to_team_id: string;
  transfer_fee: number;
  status: TransferStatus;
  transfer_date: string;
  season: string;
  created_at: string;
}

export interface TransferMarket {
  id: string;
  player_id: string;
  current_team_id: string;
  asking_price: number;
  market_value: number;
  is_listed: boolean;
  listed_date: string;
  expiry_date: string | null;
  created_at: string;
}

export interface Standing {
  id: string;
  league_id: string;
  team_id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  season: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      leagues: {
        Row: League;
        Insert: Omit<League, "created_at">;
        Update: Partial<Omit<League, "id">>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, "created_at">;
        Update: Partial<Omit<Team, "id">>;
      };
      players: {
        Row: Player;
        Insert: Omit<Player, "created_at">;
        Update: Partial<Omit<Player, "id">>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "created_at">;
        Update: Partial<Omit<Match, "id">>;
      };
      match_events: {
        Row: MatchEvent;
        Insert: Omit<MatchEvent, "created_at">;
        Update: Partial<Omit<MatchEvent, "id">>;
      };
      transfers: {
        Row: Transfer;
        Insert: Omit<Transfer, "created_at">;
        Update: Partial<Omit<Transfer, "id">>;
      };
      transfer_market: {
        Row: TransferMarket;
        Insert: Omit<TransferMarket, "created_at">;
        Update: Partial<Omit<TransferMarket, "id">>;
      };
      standings: {
        Row: Standing;
        Insert: Omit<Standing, "updated_at">;
        Update: Partial<Omit<Standing, "id">>;
      };
    };
  };
}

export interface PlayerWithTeam extends Player {
  team?: Team;
}

export interface MatchWithTeams extends Match {
  home_team?: Team;
  away_team?: Team;
  league?: League;
}

export interface TransferWithDetails extends Transfer {
  player?: Player;
  from_team?: Team;
  to_team?: Team;
}
