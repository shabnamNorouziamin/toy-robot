export type Direction = "NORTH" | "EAST" | "SOUTH" | "WEST";

export interface RobotState {
  x: number | null;
  y: number | null;
  facing: Direction | null;
  placed: boolean;
}

export interface RobotSimulation {
  current: RobotState;
  history: RobotState[]; // for UNDO
  hasEverBeenPlaced: boolean;
}

export const BOARD_SIZE = 5;

const DIRECTIONS: Direction[] = ["NORTH", "EAST", "SOUTH", "WEST"];

export function createInitialState(): RobotState {
  return {
    x: null,
    y: null,
    facing: null,
    placed: false,
  };
}

export function createInitialSimulation(): RobotSimulation {
  return {
    current: createInitialState(),
    history: [],
    hasEverBeenPlaced: false,
  };
}

function isOnBoard(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

export function cloneState(state: RobotState): RobotState {
  return { ...state };
}

// ---- Basic operations on RobotState ----

export function place(
  state: RobotState,
  x: number,
  y: number,
  facing: Direction
): RobotState {
  if (!isOnBoard(x, y)) {
    return state;
  }
  return {
    x,
    y,
    facing,
    placed: true,
  };
}

export interface MoveResult {
  state: RobotState;
  moved: boolean;
}

export function move(state: RobotState): MoveResult {
  if (!state.placed || state.x === null || state.y === null || !state.facing) {
    return { state, moved: false };
  }

  let nextX = state.x;
  let nextY = state.y;
  switch (state.facing) {
    case "NORTH":
      nextY += 1;
      break;
    case "SOUTH":
      nextY -= 1;
      break;
    case "EAST":
      nextX += 1;
      break;
    case "WEST":
      nextX -= 1;
      break;
  }

  if (!isOnBoard(nextX, nextY)) {
    // ignore moves that cause a fall
    return { state, moved: false };
  }

  return { state: { ...state, x: nextX, y: nextY }, moved: true };
}

export function rotateLeft(state: RobotState): RobotState {
  if (!state.placed || !state.facing) return state;
  const idx = DIRECTIONS.indexOf(state.facing);
  const newIdx = (idx + DIRECTIONS.length - 1) % DIRECTIONS.length;
  return { ...state, facing: DIRECTIONS[newIdx] };
}

export function rotateRight(state: RobotState): RobotState {
  if (!state.placed || !state.facing) return state;
  const idx = DIRECTIONS.indexOf(state.facing);
  const newIdx = (idx + 1) % DIRECTIONS.length;
  return { ...state, facing: DIRECTIONS[newIdx] };
}

export function report(state: RobotState): string | null {
  if (
    !state.placed ||
    state.x === null ||
    state.y === null ||
    state.facing === null
  ) {
    return null;
  }
  return `${state.x},${state.y},${state.facing}`;
}

// ---- Command layer ----

export type CommandType =
  | "PLACE"
  | "MOVE"
  | "LEFT"
  | "RIGHT"
  | "REPORT"
  | "RESET"
  | "UNDO";

export type Command =
  | { type: "PLACE"; x: number; y: number; facing: Direction }
  | { type: "MOVE" }
  | { type: "LEFT" }
  | { type: "RIGHT" }
  | { type: "REPORT" }
  | { type: "RESET" }
  | { type: "UNDO" };

export function parseCommand(raw: string): Command | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.toUpperCase().startsWith("PLACE")) {
    const [, args] = trimmed.split(/\s+/, 2);
    if (!args) return null;
    const [xStr, yStr, fStr] = args.split(",");
    const x = Number(xStr);
    const y = Number(yStr);
    const facing = fStr?.toUpperCase() as Direction;

    if (
      Number.isNaN(x) ||
      Number.isNaN(y) ||
      !["NORTH", "EAST", "SOUTH", "WEST"].includes(facing)
    ) {
      return null;
    }
    return { type: "PLACE", x, y, facing };
  }

  const upper = trimmed.toUpperCase();
  switch (upper) {
    case "MOVE":
      return { type: "MOVE" };
    case "LEFT":
      return { type: "LEFT" };
    case "RIGHT":
      return { type: "RIGHT" };
    case "REPORT":
      return { type: "REPORT" };
    case "RESET":
      return { type: "RESET" };
    case "UNDO":
      return { type: "UNDO" };
    default:
      return null;
  }
}

export interface StepResult {
  sim: RobotSimulation;
  reportOutput: string | null;
  note?: string;
  ignored?: boolean;
}

/**
 * Applies a single parsed command to the simulation, handling history.
 */
export function step(sim: RobotSimulation, cmd: Command): StepResult {
  let { current, history, hasEverBeenPlaced } = sim;
  let reportOutput: string | null = null;
  let note: string | undefined;

  const pushHistory = () => {
    history = [...history, cloneState(current)];
  };

  const canUndoBeforePlace = cmd.type === "UNDO" && history.length > 0;

  if (!hasEverBeenPlaced && cmd.type !== "PLACE" && !canUndoBeforePlace) {
    return {
      sim,
      reportOutput: null,
      ignored: true,
    };
  }

  switch (cmd.type) {
    case "PLACE": {
      const placed = place(current, cmd.x, cmd.y, cmd.facing);
      if (placed !== current) {
        pushHistory();
        current = placed;
        hasEverBeenPlaced = true;
      } else {
        note = "PLACE ignored: coordinates off the board";
      }
      break;
    }
    case "MOVE": {
      const moveResult = move(current);
      if (moveResult.moved) {
        pushHistory();
        current = moveResult.state;
      } else {
        note = current.placed
          ? "MOVE ignored: would fall off table"
          : "MOVE ignored: robot not placed";
      }
      break;
    }
    case "LEFT":
      if (!current.placed) {
        note = "LEFT ignored: robot not placed";
        break;
      }
      pushHistory();
      current = rotateLeft(current);
      break;
    case "RIGHT":
      if (!current.placed) {
        note = "RIGHT ignored: robot not placed";
        break;
      }
      pushHistory();
      current = rotateRight(current);
      break;
    case "REPORT":
      if (!current.placed) {
        note = "REPORT ignored: robot not placed";
      }
      reportOutput = report(current);
      break;
    case "RESET":
      pushHistory();
      current = createInitialState();
      hasEverBeenPlaced = false;
      break;
    case "UNDO":
      if (history.length > 0) {
        const prev = history[history.length - 1];
        history = history.slice(0, history.length - 1);
        current = prev;
        if (current.placed) {
          hasEverBeenPlaced = true;
        } else if (history.length === 0) {
          hasEverBeenPlaced = false;
        }
      } else {
        note = "UNDO ignored: no history";
      }
      break;
  }

  return {
    sim: { current, history, hasEverBeenPlaced },
    reportOutput,
    note,
  };
}

/**
 * Executes a list of raw command strings, for example in tests.
 */
export function executeProgram(lines: string[]): {
  finalSimulation: RobotSimulation;
  reports: string[];
} {
  let sim = createInitialSimulation();
  const reports: string[] = [];

  for (const raw of lines) {
    const cmd = parseCommand(raw);
    if (!cmd) continue;
    const { sim: nextSim, reportOutput } = step(sim, cmd);
    sim = nextSim;
    if (reportOutput) {
      reports.push(reportOutput);
    }
  }

  return { finalSimulation: sim, reports };
}
