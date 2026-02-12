"use client";

import { useSelector, useDispatch } from "react-redux";
import { updateNode } from "@/store/studioSlice";
import type { RootState } from "@/store";
import type { CreativeNode } from "@/types/jsonCanvas";

function isCreativeNode(node: { type: string }): node is CreativeNode {
  return node.type === "creative";
}

export default function RightSidebar() {
  const dispatch = useDispatch();
  const doc = useSelector((s: RootState) => s.studio.document);
  const selectedNodeId = useSelector((s: RootState) => s.studio.selectedNodeId);
  const selectedNode = selectedNodeId
    ? doc.nodes.find((n) => n.id === selectedNodeId)
    : null;
  const creative =
    selectedNode && isCreativeNode(selectedNode) ? selectedNode : null;

  const onUpdateNode = (id: string, patch: Partial<CreativeNode>) => {
    dispatch(updateNode({ id, patch }));
  };

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-[#d1d5db] bg-white">
      <div className="flex border-b border-[#d1d5db] p-2">
        {["layers", "assets", "history", "comments"].map((tab) => (
          <button
            key={tab}
            type="button"
            className="rounded px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-3">
        {!creative ? (
          <p className="text-sm text-gray-400">
            Select a creative on the canvas
          </p>
        ) : (
          <>
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-gray-500">
                Style all
              </p>
              <p className="text-xs text-gray-400">Image</p>
            </div>
            <section className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Size & Position
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-gray-500">X</label>
                  <input
                    type="number"
                    value={creative.x}
                    onChange={(e) =>
                      onUpdateNode(creative.id, { x: Number(e.target.value) })
                    }
                    className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-gray-500">Y</label>
                  <input
                    type="number"
                    value={creative.y}
                    onChange={(e) =>
                      onUpdateNode(creative.id, { y: Number(e.target.value) })
                    }
                    className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-gray-500">W</label>
                  <input
                    type="number"
                    value={creative.width}
                    onChange={(e) =>
                      onUpdateNode(creative.id, {
                        width: Number(e.target.value),
                      })
                    }
                    className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-gray-500">H</label>
                  <input
                    type="number"
                    value={creative.height}
                    onChange={(e) =>
                      onUpdateNode(creative.id, {
                        height: Number(e.target.value),
                      })
                    }
                    className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500">Z (rotation)</label>
                  <input
                    type="number"
                    defaultValue={0}
                    className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1"
                  />
                </div>
              </div>
            </section>
            <section className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Layout
              </h3>
              <p className="text-xs text-gray-400">Collapsible</p>
            </section>
            <section className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Fill
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded border border-gray-200"
                  style={{
                    backgroundColor: creative.color ?? "#8AEAE2",
                  }}
                />
                <input
                  type="text"
                  value={creative.color ?? "#8AEAE2"}
                  onChange={(e) =>
                    onUpdateNode(creative.id, { color: e.target.value })
                  }
                  className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs"
                />
                <span className="text-xs text-gray-500">100%</span>
              </div>
            </section>
            <section className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stroke
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded border border-gray-200"
                  style={{ backgroundColor: "#F7F1D1" }}
                />
                <input
                  type="text"
                  defaultValue="#F7F1D1"
                  className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs"
                />
                <span className="text-xs text-gray-500">Solid</span>
              </div>
            </section>
            <section className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Layer
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Blend mode</span>
                  <select className="rounded border border-gray-200 px-2 py-0.5">
                    <option>Normal</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Opacity</span>
                  <span>100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Blur</span>
                  <span>32%</span>
                </div>
              </div>
            </section>
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                More
              </h3>
              <p className="text-xs text-gray-400">Effects</p>
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
