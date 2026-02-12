import InfiniteCanvas from "@/components/InfiniteCanvas";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import TopBar from "@/components/TopBar";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f3f4f8]">
      <TopBar zoomPercent={100} />
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
