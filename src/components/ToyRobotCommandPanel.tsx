import React, { useState } from "react";
import type { LogEntry } from "./types";

interface ToyRobotCommandPanelProps {
  logs: LogEntry[];
  onRunCommand: (raw: string) => void;
}

export const ToyRobotCommandPanel: React.FC<ToyRobotCommandPanelProps> = ({
  logs,
  onRunCommand,
}) => {
  const [command, setCommand] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = command.trim();
    if (!raw) return;
    onRunCommand(raw);
    setCommand("");
  };

  const handleUndoClick = () => onRunCommand("UNDO");
  const handleResetClick = () => onRunCommand("RESET");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-slate-600 mt-1">
          Supported commands:{" "}
          <code className="bg-slate-200 px-1 rounded">PLACE X,Y,F</code>,{" "}
          <code className="bg-slate-200 px-1 rounded">MOVE</code>,{" "}
          <code className="bg-slate-200 px-1 rounded">LEFT</code>,{" "}
          <code className="bg-slate-200 px-1 rounded">RIGHT</code>,{" "}
          <code className="bg-slate-200 px-1 rounded">REPORT</code>,{" "}
          <code className="bg-slate-200 px-1 rounded">RESET</code>,{" "}
          <code className="bg-slate-200 px-1 rounded">UNDO</code>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g. PLACE 0,0,NORTH"
            className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="command-btn bg-sky-600 hover:bg-sky-500"
          >
            Run
          </button>
          <button
            type="button"
            onClick={handleUndoClick}
            className="command-btn bg-gray-600 hover:bg-gray-500"
          >
            UNDO
          </button>
          <button
            type="button"
            onClick={handleResetClick}
            className="command-btn bg-red-600 hover:bg-red-500"
          >
            RESET
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onRunCommand("LEFT")}
            className="command-btn bg-gray-700 text-xl hover:bg-slate-600"
            aria-label="Turn left"
          >
            ↺
          </button>
          <button
            type="button"
            onClick={() => onRunCommand("MOVE")}
            className="command-btn bg-gray-700 hover:bg-slate-600"
          >
            MOVE
          </button>
          <button
            type="button"
            onClick={() => onRunCommand("RIGHT")}
            className="command-btn bg-gray-700 text-xl hover:bg-slate-600"
            aria-label="Turn right"
          >
            ↻
          </button>
        </div>

      </form>

      <div className="mt-2">
        <h2 className="font-semibold text-sm mb-2">Command history / log</h2>
        <div className="border rounded-xl max-h-72 overflow-auto bg-slate-50">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 p-3">
              No commands yet. Try{" "}
              <code className="bg-slate-100 px-1 rounded">PLACE 0,0,NORTH</code>.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 text-xs">
              {logs.map((log) => (
                <li key={log.id} className="px-3 py-2">
                  <div className="flex justify-between gap-2">
                    <span>{log.raw}</span>
                    {!log.parsed && (
                      <span className="text-rose-600">({log.error})</span>
                    )}
                  </div>
                  {log.note && (
                    <div className="mt-1 text-amber-700">{log.note}</div>
                  )}
                  {log.reportOutput && (
                    <div className="mt-1 text-emerald-700">
                      → {log.reportOutput}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
