"use client";

import InfiniteCanvas from "@/components/InfiniteCanvas";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import TopBar from "@/components/TopBar";

interface EditorLayoutProps {
  zoomPercent?: number;
}

export default function EditorLayout({ zoomPercent = 100 }: EditorLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f3f4f8]">
      <TopBar zoomPercent={zoomPercent} />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar />
        <main className="relative flex-1 min-w-0">
          <InfiniteCanvas />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
