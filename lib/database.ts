export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt: number;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  image: string;
  teamId: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  rating: number;
  age: number;
  nationality: string;
  createdAt: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: "scheduled" | "live" | "finished";
  scheduledAt: number;
  competition: string;
  round: string;
  createdAt: number;
}

export interface Database {
  teams: Record<string, Team>;
  players: Record<string, Player>;
  matches: Record<string, Match>;
}

export const initialDatabase: Database = {
  teams: {},
  players: {},
  matches: {},
};
