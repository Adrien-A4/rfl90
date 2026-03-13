-- Supabase Database Schema for Real Futbol Fantasy League Management
-- REWRITTEN TO OVERWRITE EXISTING SCHEMA

-- 1. CLEANUP: Drop existing tables and types to avoid conflicts
-- Drop Tables (Dependencies handled by CASCADE, order doesn't strictly matter but reverse-dependency is safer)
DROP TABLE IF EXISTS user_gameweek_points CASCADE;
DROP TABLE IF EXISTS user_transfers CASCADE;
DROP TABLE IF EXISTS user_players CASCADE;
DROP TABLE IF EXISTS user_teams CASCADE;
DROP TABLE IF EXISTS gameweeks CASCADE;
DROP TABLE IF EXISTS player_gameweek_points CASCADE;
DROP TABLE IF EXISTS standings CASCADE;
DROP TABLE IF EXISTS transfer_market CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS match_events CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Drop Types
DROP TYPE IF EXISTS gw_status CASCADE;
DROP TYPE IF EXISTS squad_position CASCADE;
DROP TYPE IF EXISTS transfer_status CASCADE;
DROP TYPE IF EXISTS match_status CASCADE;
DROP TYPE IF EXISTS player_position CASCADE;

-- 2. SETUP: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types
CREATE TYPE player_position AS ENUM ('GK', 'LWB', 'RWB', 'CB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF');
CREATE TYPE specific_position AS ENUM ('GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished');
CREATE TYPE transfer_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE squad_position AS ENUM ('GK', 'LWB', 'RWB', 'CB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF');
CREATE TYPE gw_status AS ENUM ('upcoming', 'active', 'closed', 'completed');

-- 4. CREATE TABLES

-- Leagues Table

-- Teams Table


-- Players Table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    image TEXT,
    position player_position NOT NULL,
    specific_position squad_position,
    tier VARCHAR(2) DEFAULT 'B',
    age INTEGER DEFAULT 25,
    nationality VARCHAR(50) DEFAULT 'Unknown',
    height INTEGER,
    weight INTEGER,
    jersey_number INTEGER,
    contract_until DATE,
    market_value DECIMAL(15, 2) DEFAULT 0,
    transfer_value DECIMAL(15, 2) DEFAULT 0,
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
    home_difficulty INTEGER DEFAULT 3,
    away_difficulty INTEGER DEFAULT 3,
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

-- Player Gameweek Points Table
CREATE TABLE player_gameweek_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    gameweek INTEGER NOT NULL,
    gw_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id, gameweek)
);

-- Gameweeks Table
CREATE TABLE gameweeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gameweek_number INTEGER NOT NULL UNIQUE,
    season VARCHAR(20) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status gw_status DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Teams Table
-- Note: Created initially without captain references to avoid circular dependency
CREATE TABLE profiles (
    id TEXT PRIMARY KEY, -- Discord ID
    username VARCHAR(100) NOT NULL,
    avatar TEXT,
    discriminator VARCHAR(10),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_name VARCHAR(100) DEFAULT 'My Team',
    budget DECIMAL(15, 2) DEFAULT 100000000,
    formation VARCHAR(20) DEFAULT '4-4-2',
    gameweek INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    rank INTEGER,
    transfers_this_gw INTEGER DEFAULT 0,
    transfer_penalty_points INTEGER DEFAULT 0,
    -- captain_id and vice_captain_id added later via ALTER
    season VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Players Table
CREATE TABLE user_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_team_id UUID REFERENCES user_teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    squad_position squad_position NOT NULL,
    slot_id VARCHAR(20),
    is_starting BOOLEAN DEFAULT true,
    position_in_squad INTEGER DEFAULT 0,
    purchase_price DECIMAL(15, 2) DEFAULT 0,
    purchase_gameweek INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_team_id, player_id)
);

-- User Transfers Table
CREATE TABLE user_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_team_id UUID REFERENCES user_teams(id) ON DELETE CASCADE,
    player_in_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_out_id UUID REFERENCES players(id) ON DELETE CASCADE,
    gameweek INTEGER NOT NULL,
    transfer_cost DECIMAL(15, 2) DEFAULT 0,
    points_deducted INTEGER DEFAULT 0,
    is_free_transfer BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Gameweek Points Table
CREATE TABLE user_gameweek_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_team_id UUID REFERENCES user_teams(id) ON DELETE CASCADE,
    gameweek INTEGER NOT NULL,
    gw_points INTEGER DEFAULT 0,
    rank INTEGER,
    bench_points INTEGER DEFAULT 0,
    captain_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_team_id, gameweek)
);

-- Transfer Windows Table
CREATE TABLE transfer_windows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gameweek_id UUID REFERENCES gameweeks(id) ON DELETE CASCADE,
    gameweek INTEGER NOT NULL,
    season VARCHAR(20) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT false,
    free_transfers INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. POST-CREATION SCHEMA UPDATES
-- Add Captain/Vice-Captain references now that user_players exists
ALTER TABLE user_teams ADD COLUMN captain_id UUID REFERENCES user_players(id) ON DELETE SET NULL;
ALTER TABLE user_teams ADD COLUMN vice_captain_id UUID REFERENCES user_players(id) ON DELETE SET NULL;

-- 6. CREATE INDEXES
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
CREATE INDEX idx_player_gameweek_points_player ON player_gameweek_points(player_id);
CREATE INDEX idx_player_gameweek_points_gameweek ON player_gameweek_points(gameweek);
CREATE INDEX idx_gameweeks_number ON gameweeks(gameweek_number);
CREATE INDEX idx_gameweeks_status ON gameweeks(status);
CREATE INDEX idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX idx_user_teams_season ON user_teams(season);
CREATE INDEX idx_user_players_user_team_id ON user_players(user_team_id);
CREATE INDEX idx_user_players_player_id ON user_players(player_id);
CREATE INDEX idx_user_transfers_user_team_id ON user_transfers(user_team_id);
CREATE INDEX idx_user_transfers_gameweek ON user_transfers(gameweek);
CREATE INDEX idx_user_gameweek_points_user_team ON user_gameweek_points(user_team_id);
CREATE INDEX idx_user_gameweek_points_gameweek ON user_gameweek_points(gameweek);
CREATE INDEX idx_transfer_windows_gameweek ON transfer_windows(gameweek);
CREATE INDEX idx_transfer_windows_season ON transfer_windows(season);

-- 7. CREATE TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 $$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_standings_updated_at
    BEFORE UPDATE ON standings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_gameweek_points_updated_at
    BEFORE UPDATE ON player_gameweek_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gameweeks_updated_at
    BEFORE UPDATE ON gameweeks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_teams_updated_at
    BEFORE UPDATE ON user_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. CREATE VIEWS
CREATE VIEW player_market_values AS
SELECT 
    p.id,
    p.name,
    p.short_name,
    p.image,
    p.position,
    p.tier,
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

CREATE VIEW user_squad_details AS
SELECT 
    ut.id as user_team_id,
    ut.user_id,
    ut.team_name,
    ut.budget,
    ut.formation,
    ut.gameweek as current_gameweek,
    ut.total_points,
    ut.rank,
    ut.transfers_this_gw,
    ut.transfer_penalty_points,
    ut.season,
    up.id as user_player_id,
    up.squad_position,
    up.is_starting,
    up.position_in_squad,
    up.purchase_price,
    up.purchase_gameweek,
    p.id as player_id,
    p.name as player_name,
    p.short_name as player_short_name,
    p.image as player_image,
    p.position as player_position,
    p.tier as player_tier,
    p.age as player_age,
    p.nationality,
    p.transfer_value,
    t.name as player_team_name,
    t.short_name as team_short_name,
    t.logo as team_logo
FROM user_teams ut
JOIN user_players up ON ut.id = up.user_team_id
JOIN players p ON up.player_id = p.id
LEFT JOIN teams t ON p.team_id = t.id;

CREATE VIEW user_transfer_history AS
SELECT 
    ut.id as user_team_id,
    ut.user_id,
    ut.team_name,
    utr.id as transfer_id,
    utr.gameweek,
    utr.transfer_cost,
    utr.points_deducted,
    utr.is_free_transfer,
    utr.created_at,
    pi.name as player_in_name,
    pi.short_name as player_in_short_name,
    pi.position as player_in_position,
    po.name as player_out_name,
    po.short_name as player_out_short_name,
    po.position as player_out_position
FROM user_teams ut
JOIN user_transfers utr ON ut.id = utr.user_team_id
LEFT JOIN players pi ON utr.player_in_id = pi.id
LEFT JOIN players po ON utr.player_out_id = po.id
ORDER BY utr.created_at DESC;

-- 9. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_gameweek_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gameweek_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_windows ENABLE ROW LEVEL SECURITY;

-- 10. CREATE RLS POLICIES
-- Public Read Access
CREATE POLICY "Enable read access for all users" ON leagues FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON players FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON matches FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON match_events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON transfers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON transfer_market FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON standings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON player_gameweek_points FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON gameweeks FOR SELECT USING (true);

-- User Team Policies
CREATE POLICY "Users can read all user_teams" ON user_teams FOR SELECT USING (true);
CREATE POLICY "Users can insert their own user_teams" ON user_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own user_teams" ON user_teams FOR UPDATE USING (true);

-- User Players Policies
CREATE POLICY "Users can read all user_players" ON user_players FOR SELECT USING (true);
CREATE POLICY "Users can insert their own user_players" ON user_players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own user_players" ON user_players FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete their own user_players" ON user_players FOR DELETE TO authenticated USING (true);

-- User Transfers Policies
CREATE POLICY "Users can read all user_transfers" ON user_transfers FOR SELECT USING (true);
CREATE POLICY "Users can insert their own user_transfers" ON user_transfers FOR INSERT TO authenticated WITH CHECK (true);

-- User Gameweek Points Policies
CREATE POLICY "Users can read all user_gameweek_points" ON user_gameweek_points FOR SELECT USING (true);
CREATE POLICY "Users can insert their own user_gameweek_points" ON user_gameweek_points FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own user_gameweek_points" ON user_gameweek_points FOR UPDATE TO authenticated USING (true);

-- Admin Policies (For authenticated users acting as admins)
CREATE POLICY "Admin full access" ON user_teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON user_players FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON user_transfers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON user_gameweek_points FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON gameweeks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Transfer Windows Policies
CREATE POLICY "Enable read access for all users" ON transfer_windows FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON transfer_windows FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. AUTOMATIC POINT CALCULATION TRIGGERS

-- Function to recalculate total points for a user team
CREATE OR REPLACE FUNCTION recalculate_user_team_points(team_id UUID)
RETURNS VOID AS $$
DECLARE
    new_total_points INTEGER;
BEGIN
    SELECT COALESCE(SUM(pgp.gw_points), 0)
    INTO new_total_points
    FROM user_players up
    JOIN user_teams ut ON up.user_team_id = ut.id
    JOIN player_gameweek_points pgp ON up.player_id = pgp.player_id
    JOIN gameweeks gw ON pgp.gameweek = gw.gameweek_number AND ut.season = gw.season
    WHERE up.user_team_id = team_id;

    UPDATE user_teams
    SET total_points = new_total_points
    WHERE id = team_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to call recalculate when player points change
CREATE OR REPLACE FUNCTION trigger_recalculate_from_player_points()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM recalculate_user_team_points(user_team_id)
    FROM user_players
    WHERE player_id = NEW.player_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to call recalculate when team roster changes
CREATE OR REPLACE FUNCTION trigger_recalculate_from_roster_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM recalculate_user_team_points(OLD.user_team_id);
        RETURN OLD;
    ELSE
        PERFORM recalculate_user_team_points(NEW.user_team_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply the triggers
DROP TRIGGER IF EXISTS on_player_points_change ON player_gameweek_points;
CREATE TRIGGER on_player_points_change
    AFTER INSERT OR UPDATE ON player_gameweek_points
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_from_player_points();

DROP TRIGGER IF EXISTS on_roster_change ON user_players;
CREATE TRIGGER on_roster_change
    AFTER INSERT OR UPDATE OR DELETE ON user_players
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_from_roster_change();
