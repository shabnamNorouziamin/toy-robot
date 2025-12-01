import React from "react";
import { BOARD_SIZE } from "../logic/robot";
import type { RobotSimulation, Direction } from "../logic/robot";

const directionArrow: Record<Direction, string> = {
  NORTH: "↑",
  SOUTH: "↓",
  EAST: "→",
  WEST: "←",
};

interface ToyRobotTablePanelProps {
  sim: RobotSimulation;
}

export const ToyRobotTablePanel: React.FC<ToyRobotTablePanelProps> = ({
  sim,
}) => {
  const renderCell = (x: number, y: number) => {
    const { current } = sim;
    const isRobot =
      current.placed &&
      current.x !== null &&
      current.y !== null &&
      current.x === x &&
      current.y === y;

    return (
      <div
        key={`${x}-${y}`}
        className="border border-slate-200 flex items-center justify-center w-full aspect-square"
      >
        {isRobot ? (
          <div className="flex flex-col items-center">
            {current.facing && (
              <span className="text-sm mt-1">
                {directionArrow[current.facing]} {current.facing[0]}
              </span>
            )}
            <span className="text-3xl">🤖</span>
          </div>
        ) : (
          <span className="text-[0.65rem] text-slate-400">
            {x},{y}
          </span>
        )}
      </div>
    );
  };

  const gridCells = [];
  for (let y = BOARD_SIZE - 1; y >= 0; y--) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      gridCells.push(renderCell(x, y));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-col items-center">
        <h2 className="font-semibold mb-2 text-xs">
          Tabletop ({BOARD_SIZE}×{BOARD_SIZE})
        </h2>
        <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200">
          <div
            className="grid w-full gap-2"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {gridCells}
          </div>
        </div>
      </div>
      <div className="w-full text-xs text-slate-600 space-y-1">
        <p>
          <span className="font-semibold">Coordinate system:</span> SW corner is
          (0,0). NORTH points towards the top.
        </p>
        <p>
          <span className="w-full font-semibold">Current state:</span>{" "}
          {sim.current.placed &&
          sim.current.x !== null &&
          sim.current.y !== null &&
          sim.current.facing ? (
            <span>
              {sim.current.x},{sim.current.y},{sim.current.facing}
            </span>
          ) : (
            <span className="italic">Robot not placed</span>
          )}
        </p>
        <p>
          <span className="font-semibold">Undo levels:</span>{" "}
          {sim.history.length}
        </p>
      </div>
    </div>
  );
};
