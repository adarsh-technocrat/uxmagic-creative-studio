"use client";

import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addUploadedFiles,
  addAIAssistantMessage,
  sendAIMessage,
  startNewProject,
} from "@/store/studioSlice";
import type { RootState } from "@/store";

export default function LeftSidebar() {
  const dispatch = useDispatch();
  const uploadedFiles = useSelector((s: RootState) => s.studio.uploadedFiles);
  const aiMessages = useSelector((s: RootState) => s.studio.aiMessages);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length) dispatch(addUploadedFiles(files));
    },
    [dispatch],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length) dispatch(addUploadedFiles(files));
      e.target.value = "";
    },
    [dispatch],
  );

  const handleAskAI = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = inputRef.current;
      const value = input?.value?.trim();
      if (value) {
        dispatch(sendAIMessage(value));
        if (input) input.value = "";
        setTimeout(() => {
          dispatch(
            addAIAssistantMessage(
              "I have analyzed your input and I will raise a new brief. #1 Creating project brief.",
            ),
          );
        }, 800);
      }
    },
    [dispatch],
  );

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-[#d1d5db] bg-white">
      <div className="border-b border-[#d1d5db] p-3">
        <button
          type="button"
          className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-3 text-sm font-medium text-gray-600 hover:border-violet-400 hover:bg-violet-50/50 hover:text-violet-700"
          onClick={() => dispatch(startNewProject())}
        >
          Start a new project
        </button>
      </div>
      <div
        className="flex flex-1 flex-col gap-3 overflow-auto p-3"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <p className="text-sm text-gray-500">
          Please attach your files to initiate new projects. Alternatively, feel
          free to prompt me with the brief, and I would be happy to create a new
          project based on that!
        </p>
        {uploadedFiles.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-medium text-gray-600">
              Import these files and create a project
            </p>
            <div className="space-y-1.5 text-xs text-gray-500">
              {uploadedFiles.map((f) => (
                <div key={f.id} className="flex items-center gap-2">
                  <span
                    className={
                      f.type.includes("pdf")
                        ? "text-red-500"
                        : f.type.includes("sheet") || f.name.endsWith("xlsx")
                          ? "text-green-600"
                          : "text-gray-500"
                    }
                  >
                    {f.type.includes("pdf")
                      ? "PDF"
                      : f.name.endsWith("xlsx")
                        ? "XLSX"
                        : "FILE"}
                  </span>
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
            <label htmlFor="left-sidebar-files" className="mt-2 block cursor-pointer text-xs text-violet-600 hover:underline">
              Add more files
            </label>
            <input
              id="left-sidebar-files"
              type="file"
              multiple
              className="hidden"
              onChange={onFileSelect}
            />
          </div>
        )}
        {aiMessages.length > 0 && (
          <div className="space-y-2">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "ml-4 bg-violet-100 text-gray-800"
                    : "mr-4 bg-gray-100 text-gray-700"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-[#d1d5db] p-3">
        <form onSubmit={handleAskAI} className="flex gap-2 rounded-lg border border-gray-200 bg-white p-2">
          <label htmlFor="left-sidebar-attach" className="cursor-pointer rounded p-1 text-gray-400 hover:text-gray-600" aria-label="Attach">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>
          <input
            id="left-sidebar-attach"
            type="file"
            multiple
            className="hidden"
            onChange={onFileSelect}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask AI..."
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </form>
      </div>
    </aside>
  );
}
