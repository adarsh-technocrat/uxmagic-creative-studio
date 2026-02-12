"use client";

import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { addCreative, triggerZoomToFit } from "@/store/studioSlice";
import { updateProject } from "@/store/workspacesSlice";
import type { RootState } from "@/store";
import { STANDARD_AD_SIZES } from "@/types/jsonCanvas";

function parseSizeInput(
  input: string,
): { w: number; h: number; label: string } | null {
  const cleaned = input.replace(/\s/g, "");
  const match = cleaned.match(/^(\d+)[×xX*](\d+)$/);
  if (!match) return null;
  const w = parseInt(match[1], 10);
  const h = parseInt(match[2], 10);
  if (w < 1 || h < 1 || w > 10000 || h > 10000) return null;
  return { w, h, label: `${w}×${h}` };
}

interface TopBarProps {
  zoomPercent?: number;
}

import {
  exportCanvasAsJson,
  exportCreativesAsPng,
  exportCreativesAsPdf,
  exportCreativesAsPsd,
} from "@/lib/exportCanvas";

export default function TopBar({ zoomPercent = 100 }: TopBarProps) {
  const dispatch = useDispatch();
  const projectName = useSelector((s: RootState) => s.studio.projectName);
  const currentProjectId = useSelector(
    (s: RootState) => s.studio.currentProjectId,
  );
  const doc = useSelector((s: RootState) => s.studio.document);
  const variants = useSelector((s: RootState) => s.studio.variants);

  const handleSave = useCallback(() => {
    if (currentProjectId) {
      dispatch(
        updateProject({
          id: currentProjectId,
          name: projectName,
          document: doc,
          variants,
        }),
      );
    }
  }, [currentProjectId, projectName, doc, variants, dispatch]);

  const handleZoomToFit = useCallback(() => {
    dispatch(triggerZoomToFit());
  }, [dispatch]);

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

  const [askAIOpen, setAskAIOpen] = useState(false);
  const [aiSizeInput, setAiSizeInput] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleGenerateSize = useCallback(() => {
    const parsed = parseSizeInput(aiSizeInput.trim());
    if (!parsed) return;
    setAiGenerating(true);
    setAskAIOpen(false);
    setAiSizeInput("");
    setTimeout(() => {
      addSize(parsed.w, parsed.h, parsed.label);
      setAiGenerating(false);
    }, 600);
  }, [aiSizeInput, addSize]);

  const handleExport = useCallback(
    async (format: "json" | "png" | "pdf" | "psd") => {
      setExporting(true);
      setExportOpen(false);
      try {
        if (format === "json") {
          exportCanvasAsJson(doc, projectName);
        } else if (format === "png") {
          await exportCreativesAsPng(doc, variants, projectName);
        } else if (format === "pdf") {
          await exportCreativesAsPdf(doc, variants, projectName);
        } else if (format === "psd") {
          await exportCreativesAsPsd(doc, variants, projectName);
        }
      } finally {
        setExporting(false);
      }
    },
    [doc, variants, projectName],
  );

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#d1d5db] bg-white px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-gray-800">{projectName}</h1>
        <div className="flex items-center gap-1 text-gray-500">
          <Link
            href="/"
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Back to home"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <button
            type="button"
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Forward"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <select className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600">
          <option>Variants</option>
        </select>
        <div className="h-4 w-px bg-gray-200" />
        <button
          type="button"
          className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          onClick={handleZoomToFit}
          title="Zoom to fit all creatives"
          aria-label="Zoom to fit"
        >
          Fit
        </button>
        <span
          className="text-xs text-gray-500"
          title="Scroll to zoom. Shift + scroll (or click-drag) to pan canvas."
        >
          {zoomPercent}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setAskAIOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
          >
            <svg
              className="h-4 w-4 text-violet-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            {aiGenerating ? "Generating…" : "Ask AI"}
          </button>
          {askAIOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
              <p className="mb-2 text-xs text-gray-600">
                Generate a specific creative size (e.g. 300×250)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiSizeInput}
                  onChange={(e) => setAiSizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateSize()}
                  placeholder="300×250"
                  className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs"
                />
                <button
                  type="button"
                  onClick={handleGenerateSize}
                  disabled={!parseSizeInput(aiSizeInput.trim())}
                  className="rounded bg-violet-600 px-2 py-1 text-xs text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  Generate
                </button>
              </div>
            </div>
          )}
        </div>
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
        {currentProjectId && (
          <button
            type="button"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            onClick={handleSave}
          >
            Save
          </button>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((o) => !o)}
            disabled={exporting}
            className="rounded bg-violet-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Export"}
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => handleExport("json")}
              >
                JSON
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => handleExport("png")}
              >
                PNG (each size)
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => handleExport("pdf")}
              >
                PDF
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => handleExport("psd")}
              >
                PSD (each size)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
