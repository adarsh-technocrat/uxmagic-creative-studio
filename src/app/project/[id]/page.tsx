"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { loadProject, startNewProject } from "@/store/studioSlice";
import { createStandaloneProject } from "@/store/workspacesSlice";
import type { RootState } from "@/store";
import EditorLayout from "@/components/EditorLayout";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const id = params.id as string;
  const projects = useSelector((s: RootState) => s.workspaces.projects);
  const project = id === "new" ? null : projects.find((p) => p.id === id);

  useEffect(() => {
    if (id === "new") {
      dispatch(startNewProject());
      const newId = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      dispatch(
        createStandaloneProject({
          id: newId,
          name: "Untitled Project",
          document: { nodes: [], edges: [] },
        }),
      );
      router.replace(`/project/${newId}`);
      return;
    }
    if (project) {
      dispatch(
        loadProject({
          id: project.id,
          name: project.name,
          document: project.document,
          variants: project.variants,
        }),
      );
    }
  }, [id, project?.id, dispatch, router]);

  if (id === "new") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f3f4f8]">
        <p className="text-gray-600">Creating project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f3f4f8]">
        <p className="text-gray-600">Project not found.</p>
        <Link href="/" className="text-violet-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return <EditorLayout />;
}
