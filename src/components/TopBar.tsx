"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCreative } from "@/store/studioSlice";
import type { RootState } from "@/store";
import { STANDARD_AD_SIZES } from "@/types/jsonCanvas";

interface TopBarProps {
  zoomPercent?: number;
}

function exportCanvasDocument(doc: { nodes: unknown[]; edges: unknown[] }, projectName: string) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, "_")}_canvas.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TopBar({ zoomPercent = 100 }: TopBarProps) {
  const dispatch = useDispatch();
  const projectName = useSelector((s: RootState) => s.studio.projectName);
  const doc = useSelector((s: RootState) => s.studio.document);

  const addSize = useCallback(
    (pixelWidth: number, pixelHeight: number, label?: string) => {
      const sizeConfig = STANDARD_AD_SIZES.find(
        (s) => s.width === pixelWidth && s.height === pixelHeight,
      );
      const labelToUse = label ?? sizeConfig?.label;
      dispatch(
        addCreative({
          worldWidth: pixelWidth / 50,
          worldHeight: pixelHeight / 50,
          sizeLabel: labelToUse,
        }),
      );
    },
    [dispatch],
  );

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#d1d5db] bg-white px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-gray-800">{projectName}</h1>
        <div className="flex items-center gap-1 text-gray-500">
          <button type="button" className="rounded p-1 hover:bg-gray-100" aria-label="Back">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button type="button" className="rounded p-1 hover:bg-gray-100" aria-label="Forward">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <select className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600">
          <option>Variants</option>
        </select>
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-xs text-gray-500">{zoomPercent}%</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
        >
          <svg className="h-4 w-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Ask AI
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Import spreadsheet
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          onClick={() => addSize(300, 250, "300×250")}
        >
          Add sizes
        </button>
        <div className="flex gap-1">
          {STANDARD_AD_SIZES.map(({ width, height, label }) => (
            <button
              key={label}
              type="button"
              className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              onClick={() => addSize(width, height, label)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="rounded bg-violet-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          onClick={() => exportCanvasDocument(doc, projectName)}
        >
          Export
        </button>
      </div>
    </header>
  );
}
