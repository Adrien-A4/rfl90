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
        allowedPositions: ["LB", "LWB", "LM"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB", "RM"],
      },
      { x: 15, y: 55, position: "LM", id: "lm", allowedPositions: ["LM"] },
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
      { x: 85, y: 55, position: "RM", id: "rm", allowedPositions: ["RM"] },
      {
        x: 35,
        y: 75,
        position: "ST",
        id: "ls",
        allowedPositions: ["ST", "CF", "LW"],
      },
      {
        x: 65,
        y: 75,
        position: "ST",
        id: "rs",
        allowedPositions: ["ST", "CF", "RW"],
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
        id: "bench-def1",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
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
        y: 35,
        position: "LB",
        id: "lb",
        allowedPositions: ["LB", "LWB", "LM"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB", "RM"],
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
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 75,
        y: 55,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      { x: 20, y: 75, position: "LW", id: "lw", allowedPositions: ["LW"] },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
      { x: 80, y: 75, position: "RW", id: "rw", allowedPositions: ["RW"] },
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
        id: "bench-def1",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
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
        allowedPositions: ["LB", "LWB", "LM"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RB",
        id: "rb",
        allowedPositions: ["RB", "RWB", "RM"],
      },
      { x: 35, y: 50, position: "CDM", id: "lcdm", allowedPositions: ["CDM"] },
      { x: 65, y: 50, position: "CDM", id: "rcdm", allowedPositions: ["CDM"] },
      {
        x: 15,
        y: 65,
        position: "CAM",
        id: "lam",
        allowedPositions: ["CAM", "LM"],
      },
      { x: 50, y: 60, position: "CAM", id: "cam", allowedPositions: ["CAM"] },
      {
        x: 85,
        y: 65,
        position: "CAM",
        id: "ram",
        allowedPositions: ["CAM", "RM"],
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
        id: "bench-def1",
        allowedPositions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
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
        x: 10,
        y: 50,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LM"],
      },
      {
        x: 30,
        y: 55,
        position: "CM",
        id: "lm",
        allowedPositions: ["CM", "LM"],
      },
      {
        x: 50,
        y: 50,
        position: "CM",
        id: "cm",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 70,
        y: 55,
        position: "CM",
        id: "rm",
        allowedPositions: ["CM", "RM"],
      },
      {
        x: 90,
        y: 50,
        position: "RWB",
        id: "rwb",
        allowedPositions: ["RWB", "RM"],
      },
      {
        x: 35,
        y: 75,
        position: "ST",
        id: "ls",
        allowedPositions: ["ST", "CF", "LW"],
      },
      {
        x: 65,
        y: 75,
        position: "ST",
        id: "rs",
        allowedPositions: ["ST", "CF", "RW"],
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
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
        position: "LWB",
        id: "lb",
        allowedPositions: ["LWB", "LM"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RWB",
        id: "rb",
        allowedPositions: ["RWB", "RM"],
      },
      { x: 50, y: 50, position: "CDM", id: "cdm", allowedPositions: ["CDM"] },
      {
        x: 15,
        y: 65,
        position: "CM",
        id: "lcm",
        allowedPositions: ["CM", "LM"],
      },
      {
        x: 38,
        y: 60,
        position: "CM",
        id: "cm1",
        allowedPositions: ["CM", "CAM"],
      },
      {
        x: 62,
        y: 60,
        position: "CM",
        id: "cm2",
        allowedPositions: ["CM", "CAM"],
      },
      {
        x: 85,
        y: 65,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "RM"],
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
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
        position: "LWB",
        id: "lb",
        allowedPositions: ["LWB", "LM"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RWB",
        id: "rb",
        allowedPositions: ["RWB", "RM"],
      },
      { x: 15, y: 55, position: "LM", id: "lm", allowedPositions: ["LM"] },
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
      { x: 85, y: 55, position: "RM", id: "rm", allowedPositions: ["RM"] },
      { x: 50, y: 65, position: "CAM", id: "cam", allowedPositions: ["CAM"] },
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "3-4-3",
    shortName: "343",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 25,
        y: 30,
        position: "CB",
        id: "lcb",
        allowedPositions: ["CB", "LWB"],
      },
      { x: 50, y: 25, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      {
        x: 75,
        y: 30,
        position: "CB",
        id: "rcb",
        allowedPositions: ["CB", "RWB"],
      },
      {
        x: 10,
        y: 50,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LM"],
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
        allowedPositions: ["RWB", "RM"],
      },
      { x: 20, y: 75, position: "LW", id: "lw", allowedPositions: ["LW"] },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
      { x: 80, y: 75, position: "RW", id: "rw", allowedPositions: ["RW"] },
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "5-3-2",
    shortName: "532",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      { x: 10, y: 30, position: "LWB", id: "lwb", allowedPositions: ["LWB"] },
      { x: 30, y: 25, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 30, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 70, y: 25, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      { x: 90, y: 30, position: "RWB", id: "rwb", allowedPositions: ["RWB"] },
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "5-4-1",
    shortName: "541",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      { x: 10, y: 30, position: "LWB", id: "lwb", allowedPositions: ["LWB"] },
      { x: 30, y: 25, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 30, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 70, y: 25, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      { x: 90, y: 30, position: "RWB", id: "rwb", allowedPositions: ["RWB"] },
      { x: 15, y: 55, position: "LM", id: "lm", allowedPositions: ["LM"] },
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
      { x: 85, y: 55, position: "RM", id: "rm", allowedPositions: ["RM"] },
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
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
        y: 35,
        position: "LWB",
        id: "lb",
        allowedPositions: ["LWB", "LM"],
      },
      { x: 38, y: 30, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 62, y: 30, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      {
        x: 85,
        y: 35,
        position: "RWB",
        id: "rb",
        allowedPositions: ["RWB", "RM"],
      },
      { x: 10, y: 55, position: "LM", id: "lm", allowedPositions: ["LM"] },
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
        allowedPositions: ["CM", "CAM"],
      },
      {
        x: 70,
        y: 50,
        position: "CM",
        id: "rcm",
        allowedPositions: ["CM", "CDM"],
      },
      { x: 90, y: 55, position: "RM", id: "rm", allowedPositions: ["RM"] },
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "3-6-1",
    shortName: "361",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      {
        x: 25,
        y: 30,
        position: "CB",
        id: "lcb",
        allowedPositions: ["CB", "LWB"],
      },
      { x: 50, y: 25, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      {
        x: 75,
        y: 30,
        position: "CB",
        id: "rcb",
        allowedPositions: ["CB", "RWB"],
      },
      {
        x: 10,
        y: 50,
        position: "LWB",
        id: "lwb",
        allowedPositions: ["LWB", "LM"],
      },
      {
        x: 30,
        y: 45,
        position: "CM",
        id: "cm1",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 50,
        y: 40,
        position: "CM",
        id: "cm2",
        allowedPositions: ["CM", "CAM"],
      },
      {
        x: 70,
        y: 45,
        position: "CM",
        id: "cm3",
        allowedPositions: ["CM", "CDM"],
      },
      {
        x: 90,
        y: 50,
        position: "RWB",
        id: "rwb",
        allowedPositions: ["RWB", "RM"],
      },
      {
        x: 35,
        y: 65,
        position: "CAM",
        id: "cam",
        allowedPositions: ["CAM", "LW", "RW"],
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
        allowedPositions: ["ST", "CF", "LW", "RW"],
      },
    ],
  },
  {
    name: "5-2-3",
    shortName: "523",
    positions: [
      { x: 50, y: 10, position: "GK", id: "gk", allowedPositions: ["GK"] },
      { x: 10, y: 30, position: "LWB", id: "lwb", allowedPositions: ["LWB"] },
      { x: 30, y: 25, position: "CB", id: "lcb", allowedPositions: ["CB"] },
      { x: 50, y: 30, position: "CB", id: "ccb", allowedPositions: ["CB"] },
      { x: 70, y: 25, position: "CB", id: "rcb", allowedPositions: ["CB"] },
      { x: 90, y: 30, position: "RWB", id: "rwb", allowedPositions: ["RWB"] },
      { x: 30, y: 55, position: "CDM", id: "lcdm", allowedPositions: ["CDM"] },
      { x: 70, y: 55, position: "CDM", id: "rcdm", allowedPositions: ["CDM"] },
      { x: 20, y: 75, position: "LW", id: "lw", allowedPositions: ["LW"] },
      {
        x: 50,
        y: 80,
        position: "ST",
        id: "st",
        allowedPositions: ["ST", "CF"],
      },
      { x: 80, y: 75, position: "RW", id: "rw", allowedPositions: ["RW"] },
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
        id: "bench-def1",
        allowedPositions: ["CB", "LWB", "RWB"],
      },
      {
        x: 60,
        y: 50,
        position: "CM",
        id: "bench-mid1",
        allowedPositions: ["CM", "CDM", "CAM", "LM", "RM"],
      },
      {
        x: 80,
        y: 50,
        position: "ST",
        id: "bench-fwd1",
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

export const INITIAL_BUDGET = 100000000;

export const FREE_TRANSFERS_PER_GW = 1;

export const TRANSFER_PENALTY_PER_EXTRA = 4;
