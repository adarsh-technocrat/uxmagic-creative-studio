"use client";

import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateNode, updateVariantCopy, addComment } from "@/store/studioSlice";
import type { RootState } from "@/store";
import type { CreativeNode } from "@/types/jsonCanvas";

function isCreativeNode(node: { type: string }): node is CreativeNode {
  return node.type === "creative";
}

export default function RightSidebar() {
  const dispatch = useDispatch();
  const doc = useSelector((s: RootState) => s.studio.document);
  const variants = useSelector((s: RootState) => s.studio.variants);
  const selectedNodeId = useSelector((s: RootState) => s.studio.selectedNodeId);
  const selectedNode = selectedNodeId
    ? doc.nodes.find((n) => n.id === selectedNodeId)
    : null;
  const creative =
    selectedNode && isCreativeNode(selectedNode) ? selectedNode : null;
  const variant = creative?.variantId
    ? variants.find((v) => v.id === creative.variantId)
    : null;
  const currentProjectId = useSelector(
    (s: RootState) => s.studio.currentProjectId,
  );
  const projects = useSelector((s: RootState) => s.workspaces.projects);
  const brands = useSelector((s: RootState) => s.brands);
  const project = currentProjectId
    ? projects.find((p) => p.id === currentProjectId)
    : null;
  const brand = project?.brandId
    ? brands.find((b) => b.id === project.brandId)
    : null;

  const onUpdateNode = (id: string, patch: Partial<CreativeNode>) => {
    dispatch(updateNode({ id, patch }));
  };

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "layers" | "assets" | "history" | "comments"
  >("layers");
  const [commentInput, setCommentInput] = useState("");
  const comments = useSelector((s: RootState) => s.studio.comments);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !creative) return;
    const url = URL.createObjectURL(file);
    dispatch(updateNode({ id: creative.id, patch: { asset: url } }));
    e.target.value = "";
  };

  const handleRemoveBackground = () => {
    if (!creative?.asset) return;
    setRemovingBg(true);
    setTimeout(() => {
      setRemovingBg(false);
    }, 1500);
  };

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-[#d1d5db] bg-white">
      <div className="flex border-b border-[#d1d5db] p-2">
        {(["layers", "assets", "history", "comments"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded px-2 py-1.5 text-xs capitalize ${
              activeTab === tab
                ? "bg-gray-100 font-medium text-gray-800"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-3">
        {activeTab === "comments" ? (
          <div className="flex h-full flex-col">
            <p className="mb-2 text-xs text-gray-500">
              Tag team or experts with @name — they’ll be notified.
            </p>
            <div className="flex-1 space-y-2 overflow-auto">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs"
                >
                  <p className="font-medium text-gray-700">{c.author}</p>
                  <p className="mt-0.5 text-gray-600">{c.content}</p>
                  {c.mentions.length > 0 && (
                    <p className="mt-1 text-[10px] text-violet-600">
                      Notified: @{c.mentions.join(", @")}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const content = commentInput.trim();
                if (content) {
                  dispatch(addComment({ author: "You", content }));
                  setCommentInput("");
                }
              }}
            >
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add comment or @mention..."
                className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="rounded bg-violet-600 px-2 py-1.5 text-xs text-white hover:bg-violet-700"
              >
                Send
              </button>
            </form>
          </div>
        ) : !creative ? (
          <p className="text-sm text-gray-400">
            Select a creative on the canvas
          </p>
        ) : activeTab === "layers" ? (
          <>
            {brand && (
              <section className="mb-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Brand guidelines
                </h3>
                <p className="mb-2 text-xs font-medium text-gray-700">
                  {brand.name}
                </p>
                <div className="mb-2 flex gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-6 w-6 rounded border border-gray-200"
                      style={{ backgroundColor: brand.primaryColor }}
                    />
                    <span className="text-[10px] text-gray-500">Primary</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-6 w-6 rounded border border-gray-200"
                      style={{ backgroundColor: brand.secondaryColor }}
                    />
                    <span className="text-[10px] text-gray-500">Secondary</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">{brand.fontFamily}</p>
                {brand.rules && (
                  <p className="mt-1 text-[10px] text-gray-500">
                    {brand.rules}
                  </p>
                )}
              </section>
            )}
            {variant && (
              <section className="mb-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Variant copy
                </h3>
                <p className="mb-1.5 text-xs text-gray-500">
                  Edit once — adapts to every size in this set.
                </p>
                <textarea
                  value={variant.copy}
                  onChange={(e) =>
                    dispatch(
                      updateVariantCopy({
                        variantId: variant.id,
                        copy: e.target.value,
                      }),
                    )
                  }
                  rows={3}
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-800"
                  placeholder="Headline and body copy…"
                />
              </section>
            )}
            <section className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Image
              </h3>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="mb-2 w-full rounded border border-gray-200 bg-gray-50 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                Upload image
              </button>
              {creative.asset && (
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src={creative.asset}
                    alt="Creative"
                    className="h-12 w-12 rounded border border-gray-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    disabled={removingBg}
                    className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {removingBg ? "Removing…" : "Remove background"}
                  </button>
                </div>
              )}
            </section>
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
        ) : (
          <p className="text-sm text-gray-400">
            {activeTab === "assets" && "Project assets"}
            {activeTab === "history" && "Edit history"}
          </p>
        )}
      </div>
    </aside>
  );
}
