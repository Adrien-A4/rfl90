export type Position =
  | "GK"
  | "LB"
  | "RB"
  | "LWB"
  | "RWB"
  | "CB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "ST"
  | "CF";

export interface FormationPosition {
  x: number;
  y: number;
  position: Position;
  id: string;
  allowedPositions?: Position[];
}

export interface Formation {
  name: string;
  shortName: string;
  positions: FormationPosition[];
  benchPositions: FormationPosition[];
}

const getPositionCategory = (
  position: Position,
): "GK" | "DEF" | "MID" | "FWD" => {
  if (position === "GK") return "GK";
  if (["LB", "RB", "LWB", "RWB", "CB"].includes(position)) return "DEF";
  if (["CDM", "CM", "CAM", "LM", "RM"].includes(position)) return "MID";
  return "FWD";
};

export const formations: Formation[] = [
  {
    name: "4-4-2",
    shortName: "442",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 15,
        y: 35,
        position: "LB",
        id: "lb",
        allowedPositions: ["LB", "LWB"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB"],
      },
      {
        x: 15,
        y: 55,
        position: "LM",
        id: "lm",
        allowedPositions: ["LM", "LW"],
      },
      {
        x: 38,
        y: 50,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 62,
        y: 50,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 85,
        y: 55,
        position: "RM",
        id: "rm",
        allowedPositions: ["RM", "RW"],
      },
      {
        x: 35,
        y: 75,
        position: "ST",
        id: "ls",
        allowedPositions: ["ST", "CF"],
      },
      {
        x: 65,
        y: 75,
        position: "ST",
        id: "rs",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "4-3-3",
    shortName: "433",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 15,
        y: 30,
        position: "LB",
        id: "lb",
        allowedPositions: ["LB", "LWB"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 30,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB"],
      },
      {
        x: 25,
        y: 55,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 50,
        y: 50,
        position: "CM",
        id: "ccm",
        allowedPositions: ["CM", "CDM", "CAM"],
      },
      {
        x: 75,
        y: 55,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 20,
        y: 75,
        position: "LW",
        id: "lw",
        allowedPositions: ["LW", "LM"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
      {
        x: 80,
        y: 75,
        position: "RW",
        id: "rw",
        allowedPositions: ["RW", "RM"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "4-2-3-1",
    shortName: "4231",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 15,
        y: 35,
        position: "LB",
        id: "lb",
        allowedPositions: ["LB", "LWB"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB"],
      },
      {
        x: 35,
        y: 50,
        position: "CDM",
        id: "lcdm",
        allowedPositions: ["CDM", "CM"],
      },
      {
        x: 65,
        y: 50,
        position: "CDM",
        id: "rcdm",
        allowedPositions: ["CDM", "CM"],
      },
      {
        x: 15,
        y: 65,
        position: "LM",
        id: "lam",
        allowedPositions: ["LM", "LW", "CAM"],
      },
      {
        x: 50,
        y: 60,
        position: "CAM",
        id: "cam",
        allowedPositions: ["CAM", "CM"],
      },
      {
        x: 85,
        y: 65,
        position: "RM",
        id: "ram",
        allowedPositions: ["RM", "RW", "CAM"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "3-5-2",
    shortName: "352",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      { x: 25, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 25, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 75, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 5,
        y: 25,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LB", "LM"],
      },
      {
        x: 30,
        y: 55,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 50,
        y: 50,
        position: "CM",
        id: "cm",
        allowedPositions: ["CM", "CDM", "CAM"],
      },
      {
        x: 70,
        y: 55,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 95,
        y: 25,
        position: "RWB",
        id: "rwb",
        allowedPositions: ["RWB", "RB", "RM"],
      },
      {
        x: 35,
        y: 75,
        position: "ST",
        id: "ls",
        allowedPositions: ["ST", "CF"],
      },
      {
        x: 65,
        y: 75,
        position: "ST",
        id: "rs",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LWB", "RWB", "LB", "RB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "4-1-4-1",
    shortName: "4141",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 15,
        y: 35,
        position: "LB",
        id: "lb",
        allowedPositions: ["LB", "LWB"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB"],
      },
      {
        x: 50,
        y: 50,
        position: "CDM",
        id: "cdm",
        allowedPositions: ["CDM", "CM"],
      },
      {
        x: 15,
        y: 65,
        position: "LM",
        id: "lm",
        allowedPositions: ["LM", "LW"],
      },
      {
        x: 38,
        y: 60,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CAM"],
      },
      {
        x: 62,
        y: 60,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CAM"],
      },
      {
        x: 85,
        y: 65,
        position: "RM",
        id: "rm",
        allowedPositions: ["RM", "RW"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "4-4-1-1",
    shortName: "4411",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 15,
        y: 35,
        position: "LB",
        id: "lb",
        allowedPositions: ["LB", "LWB"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB"],
      },
      {
        x: 15,
        y: 55,
        position: "LM",
        id: "lm",
        allowedPositions: ["LM", "LW"],
      },
      {
        x: 38,
        y: 50,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 62,
        y: 50,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 85,
        y: 55,
        position: "RM",
        id: "rm",
        allowedPositions: ["RM", "RW"],
      },
      {
        x: 50,
        y: 65,
        position: "CAM",
        id: "cam",
        allowedPositions: ["CAM", "CM"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "3-4-3",
    shortName: "343",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      { x: 25, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 25, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 75, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 10,
        y: 50,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LB", "LM"],
      },
      {
        x: 35,
        y: 50,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 65,
        y: 50,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 90,
        y: 50,
        position: "RWB",
        id: "rwb",
        allowedPositions: ["RWB", "RB", "RM"],
      },
      {
        x: 20,
        y: 75,
        position: "LW",
        id: "lw",
        allowedPositions: ["LW", "LM"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
      {
        x: 80,
        y: 75,
        position: "RW",
        id: "rw",
        allowedPositions: ["RW", "RM"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LWB", "RWB", "LB", "RB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "5-3-2",
    shortName: "532",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 10,
        y: 30,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LB"],
      },
      { x: 30, y: 25, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 30, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 70, y: 25, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 90,
        y: 30,
        position: "RWB",
        id: "rwb",
        allowedPositions: ["RWB", "RB"],
      },
      {
        x: 25,
        y: 55,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 50,
        y: 50,
        position: "CM",
        id: "cm",
        allowedPositions: ["CM", "CDM", "CAM"],
      },
      {
        x: 75,
        y: 55,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 35,
        y: 80,
        position: "ST",
        id: "ls",
        allowedPositions: ["ST", "CF"],
      },
      {
        x: 65,
        y: 80,
        position: "ST",
        id: "rs",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LWB", "RWB", "LB", "RB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "5-4-1",
    shortName: "541",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 10,
        y: 30,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LB"],
      },
      { x: 30, y: 25, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 30, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 70, y: 25, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 90,
        y: 30,
        position: "RWB",
        id: "rwb",
        allowedPositions: ["RWB", "RB"],
      },
      {
        x: 15,
        y: 55,
        position: "LM",
        id: "lm",
        allowedPositions: ["LM", "LW"],
      },
      {
        x: 38,
        y: 50,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 62,
        y: 50,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 85,
        y: 55,
        position: "RM",
        id: "rm",
        allowedPositions: ["RM", "RW"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LWB", "RWB", "LB", "RB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "4-5-1",
    shortName: "451",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 15,
        y: 30,
        position: "LB",
        id: "lb",
        allowedPositions: ["LB", "LWB"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 30,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB"],
      },
      {
        x: 10,
        y: 55,
        position: "LM",
        id: "lm",
        allowedPositions: ["LM", "LW"],
      },
      {
        x: 30,
        y: 50,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 50,
        y: 45,
        position: "CM",
        id: "ccm",
        allowedPositions: ["CM", "CAM", "CDM"],
      },
      {
        x: 70,
        y: 50,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 90,
        y: 55,
        position: "RM",
        id: "rm",
        allowedPositions: ["RM", "RW"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "3-4-2-1",
    shortName: "3421",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      { x: 25, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 25, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 75, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 10,
        y: 50,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LB", "LM"],
      },
      {
        x: 35,
        y: 50,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 65,
        y: 50,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 90,
        y: 50,
        position: "RWB",
        id: "rwb",
        allowedPositions: ["RWB", "RB", "RM"],
      },
      {
        x: 35,
        y: 65,
        position: "CAM",
        id: "lcam",
        allowedPositions: ["CAM", "LW", "CM"],
      },
      {
        x: 65,
        y: 65,
        position: "CAM",
        id: "rcam",
        allowedPositions: ["CAM", "RW", "CM"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LWB", "RWB", "LB", "RB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "5-2-3",
    shortName: "523",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 10,
        y: 30,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LB"],
      },
      { x: 30, y: 25, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 30, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 70, y: 25, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 90,
        y: 30,
        position: "RWB",
        id: "rwb",
        allowedPositions: ["RWB", "RB"],
      },
      {
        x: 30,
        y: 55,
        position: "CDM",
        id: "lcdm",
        allowedPositions: ["CDM", "CM"],
      },
      {
        x: 70,
        y: 55,
        position: "CDM",
        id: "rcdm",
        allowedPositions: ["CDM", "CM"],
      },
      {
        x: 20,
        y: 75,
        position: "LW",
        id: "lw",
        allowedPositions: ["LW", "LM"],
      },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
      {
        x: 80,
        y: 75,
        position: "RW",
        id: "rw",
        allowedPositions: ["RW", "RM"],
      },
    ],
    benchPositions: [
      {
        x: 20,
        y: 50,
        position: "GK",
        id: "bench-gk",
        allowedPositions: ["GK"],
      },
      {
        x: 40,
        y: 50,
        position: "CB",
        id: "bench-def",
        allowedPositions: ["CB", "LWB", "RWB", "LB", "RB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
];

export function getFormationByName(name: string): Formation | undefined {
  return formations.find((f) => f.name === name);
}

export function getFormationNames(): { name: string; shortName: string }[] {
  return formations.map((f) => ({ name: f.name, shortName: f.shortName }));
}

export function getFormationPositionCount(
  formation: Formation,
): Record<Position, number> {
  const counts: Record<Position, number> = {} as Record<Position, number>;
  formation.positions.forEach((p) => {
    counts[p.position] = (counts[p.position] || 0) + 1;
  });
  return counts;
}

export function validateFormation(formation: Formation): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const categoryCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

  formation.positions.forEach((pos) => {
    const category = getPositionCategory(pos.position);
    categoryCounts[category]++;
  });

  if (categoryCounts.GK !== 1) {
    errors.push(`Formation must have exactly 1 GK (has ${categoryCounts.GK})`);
  }
  if (categoryCounts.DEF < 3) {
    errors.push(
      `Formation must have at least 3 defenders (has ${categoryCounts.DEF})`,
    );
  }
  if (categoryCounts.MID < 2) {
    errors.push(
      `Formation must have at least 2 midfielders (has ${categoryCounts.MID})`,
    );
  }
  if (categoryCounts.FWD < 1) {
    errors.push(
      `Formation must have at least 1 forward (has ${categoryCounts.FWD})`,
    );
  }
  if (formation.positions.length !== 11) {
    errors.push(
      `Formation must have exactly 11 players (has ${formation.positions.length})`,
    );
  }

  return { valid: errors.length === 0, errors };
}

export const INITIAL_BUDGET = 100000000;
export const FREE_TRANSFERS_PER_GW = 1;
export const TRANSFER_PENALTY_PER_EXTRA = 4;
