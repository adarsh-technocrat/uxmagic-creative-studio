"use client";

import { useSelector } from "react-redux";
import Link from "next/link";
import type { RootState } from "@/store";

export default function Home() {
  const workspaces = useSelector((s: RootState) => s.workspaces.workspaces);
  const campaigns = useSelector((s: RootState) => s.workspaces.campaigns);
  const projects = useSelector((s: RootState) => s.workspaces.projects);

  const activeCampaigns = campaigns
    .filter((c) => c.status === "active" || c.status === "draft")
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f3f4f8]">
      <header className="border-b border-[#d1d5db] bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Rocketem AI Studio
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Workspaces for brands, campaigns, and teams
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Your workspaces
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => {
              const wsCampaigns = campaigns.filter(
                (c) => c.workspaceId === ws.id,
              );
              return (
                <Link
                  key={ws.id}
                  href={`/workspace/${ws.id}`}
                  className="rounded-xl border border-[#d1d5db] bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                >
                  <h3 className="font-medium text-gray-800">{ws.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {wsCampaigns.length} campaign
                    {wsCampaigns.length !== 1 ? "s" : ""}
                  </p>
                </Link>
              );
            })}
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50">
              <span className="text-sm text-gray-500">+ New workspace</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Action center — active campaigns
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Oversee active campaigns at a glance. Open a project to edit or use
            AI agents for insights.
          </p>
          <div className="rounded-xl border border-[#d1d5db] bg-white shadow-sm">
            {activeCampaigns.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No active campaigns. Create a campaign from a workspace or start
                a new project.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {activeCampaigns.map((camp) => {
                  const ws = workspaces.find((w) => w.id === camp.workspaceId);
                  const proj = camp.projectId
                    ? projects.find((p) => p.id === camp.projectId)
                    : null;
                  return (
                    <li
                      key={camp.id}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{camp.name}</p>
                        <p className="text-xs text-gray-500">
                          {ws?.name ?? "Workspace"} · {camp.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {proj ? (
                          <Link
                            href={`/project/${proj.id}`}
                            className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                          >
                            Open project
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No project yet
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/project/new"
            className="rounded-lg border border-violet-300 bg-violet-50 px-5 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-100"
          >
            Start new project
          </Link>
          <span className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-600">
            Use AI agents (insights)
          </span>
        </section>
      </main>
    </div>
  );
}
