import { describe, it, expect } from "vitest";
import {
  executeProgram,
  createInitialSimulation,
  step,
  parseCommand,
} from "./robot";

describe("Toy Robot - spec examples", () => {
  it("Example A", () => {
    const { reports } = executeProgram([
      "PLACE 0,0,NORTH",
      "MOVE",
      "REPORT",
    ]);
    expect(reports).toEqual(["0,1,NORTH"]);
  });

  it("Example B", () => {
    const { reports } = executeProgram([
      "PLACE 0,0,NORTH",
      "LEFT",
      "REPORT",
    ]);
    expect(reports).toEqual(["0,0,WEST"]);
  });

  it("Example C", () => {
    const { reports } = executeProgram([
      "PLACE 1,2,EAST",
      "MOVE",
      "MOVE",
      "LEFT",
      "MOVE",
      "REPORT",
    ]);
    expect(reports).toEqual(["3,3,NORTH"]);
  });
});

describe("Toy Robot - boundaries", () => {
  it("ignores moves that would fall off table", () => {
    const { reports } = executeProgram([
      "PLACE 0,0,SOUTH",
      "MOVE",
      "REPORT",
    ]);
    expect(reports).toEqual(["0,0,SOUTH"]);
  });
});

describe("Toy Robot - RESET and UNDO", () => {
  it("RESET returns to initial unplaced state", () => {
    const { finalSimulation } = executeProgram([
      "PLACE 0,0,NORTH",
      "MOVE",
      "RESET",
    ]);
    expect(finalSimulation.current.placed).toBe(false);
  });

  it("UNDO restores previous state", () => {
    const { finalSimulation } = executeProgram([
      "PLACE 0,0,NORTH",
      "MOVE", // (0,1)
      "UNDO",
    ]);
    expect(finalSimulation.current.placed).toBe(true);
    expect(finalSimulation.current.x).toBe(0);
    expect(finalSimulation.current.y).toBe(0);
    expect(finalSimulation.current.facing).toBe("NORTH");
  });

  it("UNDO can revert RESET", () => {
    let sim = createInitialSimulation();

    const placeCmd = parseCommand("PLACE 2,2,EAST")!;
    ({ sim } = step(sim, placeCmd));

    const resetCmd = parseCommand("RESET")!;
    ({ sim } = step(sim, resetCmd));

    const undoCmd = parseCommand("UNDO")!;
    ({ sim } = step(sim, undoCmd));

    expect(sim.current.placed).toBe(true);
    expect(sim.current.x).toBe(2);
    expect(sim.current.y).toBe(2);
    expect(sim.current.facing).toBe("EAST");
  });
});
