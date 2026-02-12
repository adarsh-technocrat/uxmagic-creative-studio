"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import type { RootState } from "@/store";

export default function WorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const workspaces = useSelector((s: RootState) => s.workspaces.workspaces);
  const campaigns = useSelector((s: RootState) => s.workspaces.campaigns);
  const projects = useSelector((s: RootState) => s.workspaces.projects);

  const workspace = workspaces.find((w) => w.id === id);
  const workspaceCampaigns = workspace
    ? campaigns.filter((c) => c.workspaceId === workspace.id)
    : [];

  if (!workspace) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f3f4f8]">
        <p className="text-gray-600">Workspace not found.</p>
        <Link href="/" className="text-violet-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8]">
      <header className="border-b border-[#d1d5db] bg-white px-6 py-4">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Workspaces
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-gray-800">
          {workspace.name}
        </h1>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Campaigns
        </h2>
        <div className="space-y-3">
          {workspaceCampaigns.map((camp) => {
            const proj = camp.projectId
              ? projects.find((p) => p.id === camp.projectId)
              : null;
            return (
              <div
                key={camp.id}
                className="flex items-center justify-between rounded-lg border border-[#d1d5db] bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800">{camp.name}</p>
                  <p className="text-xs text-gray-500">{camp.status}</p>
                </div>
                {proj ? (
                  <Link
                    href={`/project/${proj.id}`}
                    className="rounded bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                  >
                    Open project
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400">No project</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Create campaigns and projects from the editor or action center.
        </p>
      </main>
    </div>
  );
}
