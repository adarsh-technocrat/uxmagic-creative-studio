import type { CreativeNode, Variant } from "@/types/jsonCanvas";
import type { BriefPipelineResult, CreativeBrief } from "@/types/brief";
import { STANDARD_AD_SIZES } from "@/types/jsonCanvas";

const GAP = 40;

export async function runBriefPipeline(
  _files: File[],
  prompt?: string,
): Promise<BriefPipelineResult> {
  await new Promise((r) => setTimeout(r, 1200));

  const suggestedSizes = [...STANDARD_AD_SIZES].slice(0, 4);
  const projectName = prompt?.trim() || "Campaign from brief";
  const creativeBrief: CreativeBrief = {
    name: projectName,
    strategy: "Generated from your production brief and attachments.",
    creativeDirection:
      "Apply brand guidelines. Keep messaging consistent across sizes.",
    suggestedSizes: suggestedSizes.map((s) => ({
      width: s.width,
      height: s.height,
      label: s.label,
    })),
  };

  const variantId = `var-${Date.now()}`;
  const variants: Variant[] = [
    {
      id: variantId,
      copy: "Your headline and copy – edit once, syncs to all sizes.",
    },
  ];

  const nodes: CreativeNode[] = suggestedSizes.map((s, i) => {
    const worldW = s.width / 50;
    const worldH = s.height / 50;
    const col = i % 3;
    const row = Math.floor(i / 3);
    return {
      id: `creative-${Date.now()}-${i}`,
      type: "creative" as const,
      x: col * (worldW + GAP),
      y: row * (worldH + GAP),
      width: worldW,
      height: worldH,
      sizeLabel: s.label,
      variantId,
    };
  });

  return {
    creativeBrief,
    document: { nodes, edges: [] },
    projectName,
    variants,
  };
}
