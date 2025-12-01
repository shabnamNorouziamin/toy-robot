import React, { useState } from "react";
import { createInitialSimulation, parseCommand, step } from "../logic/robot";
import type { RobotSimulation } from "../logic/robot";
import { ToyRobotTablePanel } from "./ToyRobotTablePanel";
import { ToyRobotCommandPanel } from "./ToyRobotCommandPanel";
import type { LogEntry } from "./types";

export const ToyRobotApp: React.FC = () => {
  const [sim, setSim] = useState<RobotSimulation>(createInitialSimulation());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [nextId, setNextId] = useState<number>(1);

  const addLog = (entry: Omit<LogEntry, "id">) => {
    setLogs((prev) => [
      {
        id: nextId,
        ...entry,
      },
      ...prev,
    ]);
    setNextId((id) => id + 1);
  };

  const runCommand = (raw: string) => {
    const input = raw.trim();
    if (!input) {
      return;
    }

    const parsedCmd = parseCommand(input);
    if (!parsedCmd) {
      addLog({
        raw: input,
        parsed: false,
        error: "Invalid command",
      });
      return;
    }

    const { sim: newSim, reportOutput, note, ignored } = step(sim, parsedCmd);
    setSim(newSim);
    if (ignored) {
      return;
    }

    addLog({
      raw: input,
      parsed: true,
      reportOutput,
      note,
    });
  };

  return (
    <div className="bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full p-6">
        <h1 className="text-center text-2xl font-bold">Toy Robot Challenge</h1>
        <div className="flex flex-col gap-8 m-8">
            <ToyRobotTablePanel sim={sim} />
          <div className="bg-slate-50 border border-slate-100 rounded-2xl w-full p-6">
            <ToyRobotCommandPanel logs={logs} onRunCommand={runCommand} />
          </div>
        </div>
      </div>
    </div>
  );
};
