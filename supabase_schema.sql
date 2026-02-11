-- Supabase Database Schema for RFL90 Football League Management
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types
CREATE TYPE player_position AS ENUM ('GK', 'DEF', 'MID', 'FWD');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished');
CREATE TYPE transfer_status AS ENUM ('active', 'completed', 'cancelled');

-- Create Tables

-- Leagues Table
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo TEXT,
    country VARCHAR(50) NOT NULL,
    tier INTEGER DEFAULT 1,
    season VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo TEXT,
    primary_color VARCHAR(20) DEFAULT '#1a1a1a',
    secondary_color VARCHAR(20) DEFAULT '#2a2a2a',
    stadium VARCHAR(100),
    founded_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players Table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    image TEXT,
    position player_position NOT NULL,
    rating INTEGER DEFAULT 75,
    age INTEGER DEFAULT 25,
    nationality VARCHAR(50) DEFAULT 'Unknown',
    height INTEGER,
    weight INTEGER,
    jersey_number INTEGER,
    contract_until DATE,
    market_value DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches Table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
    home_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    away_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    home_score INTEGER,
    away_score INTEGER,
    status match_status DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ NOT NULL,
    competition VARCHAR(50) DEFAULT 'League',
    round VARCHAR(20) DEFAULT '1',
    venue VARCHAR(100),
    referee VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match Events Table
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    event_type VARCHAR(20) NOT NULL,
    minute INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transfers Table
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    from_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    to_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    transfer_fee DECIMAL(15, 2) DEFAULT 0,
    status transfer_status DEFAULT 'active',
    transfer_date DATE NOT NULL,
    season VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transfer Market Table
CREATE TABLE transfer_market (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    current_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    asking_price DECIMAL(15, 2) DEFAULT 0,
    market_value DECIMAL(15, 2) DEFAULT 0,
    is_listed BOOLEAN DEFAULT false,
    listed_date DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standings Table
CREATE TABLE standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    season VARCHAR(20) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for better query performance
CREATE INDEX idx_teams_league_id ON teams(league_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_matches_league_id ON matches(league_id);
CREATE INDEX idx_matches_home_team_id ON matches(home_team_id);
CREATE INDEX idx_matches_away_team_id ON matches(away_team_id);
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_transfers_player_id ON transfers(player_id);
CREATE INDEX idx_transfer_market_player_id ON transfer_market(player_id);
CREATE INDEX idx_standings_league_season ON standings(league_id, season);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);

-- Create Trigger Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_standings_updated_at
    BEFORE UPDATE ON standings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create View for Player Market Values with Teams
CREATE VIEW player_market_values AS
SELECT 
    p.id,
    p.name,
    p.short_name,
    p.image,
    p.position,
    p.rating,
    p.age,
    p.nationality,
    p.team_id,
    t.name as team_name,
    t.short_name as team_short_name,
    t.logo as team_logo,
    tm.asking_price,
    tm.market_value,
    tm.is_listed
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN transfer_market tm ON p.id = tm.player_id;

-- Create View for League Standings
CREATE VIEW league_standings AS
SELECT 
    s.id,
    s.league_id,
    l.name as league_name,
    s.team_id,
    t.name as team_name,
    t.short_name as team_short_name,
    t.logo as team_logo,
    t.primary_color,
    s.position,
    s.played,
    s.won,
    s.drawn,
    s.lost,
    s.goals_for,
    s.goals_against,
    s.goal_difference,
    s.points,
    s.season
FROM standings s
JOIN leagues l ON s.league_id = l.id
JOIN teams t ON s.team_id = t.id
ORDER BY s.position;

-- Create View for Upcoming Matches
CREATE VIEW upcoming_matches AS
SELECT 
    m.id,
    m.league_id,
    l.name as league_name,
    l.logo as league_logo,
    m.home_team_id,
    ht.name as home_team_name,
    ht.short_name as home_team_short_name,
    ht.logo as home_team_logo,
    ht.primary_color as home_team_color,
    m.away_team_id,
    at.name as away_team_name,
    at.short_name as away_team_short_name,
    at.logo as away_team_logo,
    at.primary_color as away_team_color,
    m.scheduled_at,
    m.competition,
    m.round,
    m.venue,
    m.status
FROM matches m
JOIN leagues l ON m.league_id = l.id
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
WHERE m.status IN ('scheduled', 'live')
ORDER BY m.scheduled_at ASC;

-- Enable Row Level Security (RLS)
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (adjust as needed for your app)
-- Allow public read access to all tables
CREATE POLICY "Enable read access for all users" ON leagues FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON teams FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON players FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON matches FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON match_events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON transfers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON transfer_market FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON standings FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (adjust based on your auth requirements)
CREATE POLICY "Enable insert for authenticated users" ON leagues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON leagues FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON leagues FOR DELETE TO authenticated USING (true);

-- Repeat insert/update/delete policies for other tables as needed
