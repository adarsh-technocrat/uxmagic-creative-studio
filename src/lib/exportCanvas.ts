import type { CreativeNode, Variant } from "@/types/jsonCanvas";
import type { JsonCanvasDocument } from "@/types/jsonCanvas";

const PIXELS_PER_WORLD = 50;

function getCreativeNodes(doc: JsonCanvasDocument): CreativeNode[] {
  return doc.nodes.filter((n): n is CreativeNode => n.type === "creative");
}

function drawCreativeToCanvas(
  node: CreativeNode,
  variants: Variant[],
  canvas: HTMLCanvasElement,
): Promise<void> {
  const w = Math.max(1, Math.round(node.width * PIXELS_PER_WORLD));
  const h = Math.max(1, Math.round(node.height * PIXELS_PER_WORLD));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve();

  ctx.fillStyle = node.color ?? "#f9fafb";
  ctx.fillRect(0, 0, w, h);

  const variant = node.variantId
    ? variants.find((v) => v.id === node.variantId)
    : null;

  if (node.asset) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        if (variant?.copy) {
          ctx.fillStyle = "#374151";
          ctx.font = "14px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lines = variant.copy.slice(0, 80).split(/\n/).slice(0, 3);
          const lineHeight = 18;
          const startY =
            h / 2 - (lines.length * lineHeight) / 2 + lineHeight / 2;
          lines.forEach((line, i) => {
            ctx.fillText(line, w / 2, startY + i * lineHeight);
          });
        }
        resolve();
      };
      img.onerror = reject;
      img.src = node.asset as string;
    });
  }

  if (variant?.copy) {
    ctx.fillStyle = "#374151";
    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = variant.copy.slice(0, 80).split(/\n/).slice(0, 3);
    const lineHeight = 18;
    const startY = h / 2 - (lines.length * lineHeight) / 2 + lineHeight / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, startY + i * lineHeight);
    });
  }

  if (node.sizeLabel) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(node.sizeLabel, w / 2, h - 8);
  }

  return Promise.resolve();
}

export async function exportCreativesAsPng(
  doc: JsonCanvasDocument,
  variants: Variant[],
  projectName: string,
): Promise<void> {
  const nodes = getCreativeNodes(doc);
  const canvas = document.createElement("canvas");
  const safeName = projectName.replace(/\s+/g, "_");

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    await drawCreativeToCanvas(node, variants, canvas);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) continue;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}_${node.sizeLabel ?? i}_${i + 1}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

const PDF_PAGE_W = 595;
const PDF_PAGE_H = 842;

export async function exportCreativesAsPdf(
  doc: JsonCanvasDocument,
  variants: Variant[],
  projectName: string,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const nodes = getCreativeNodes(doc);
  const canvas = document.createElement("canvas");

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt" });

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    await drawCreativeToCanvas(node, variants, canvas);
    const w = canvas.width;
    const h = canvas.height;
    const imgData = canvas.toDataURL("image/png");
    const scale = Math.min(PDF_PAGE_W / w, PDF_PAGE_H / h, 1);
    const drawW = w * scale;
    const drawH = h * scale;
    const x = (PDF_PAGE_W - drawW) / 2;
    const y = (PDF_PAGE_H - drawH) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", x, y, drawW, drawH);
  }

  const safeName = projectName.replace(/\s+/g, "_");
  pdf.save(`${safeName}.pdf`);
}

export function exportCanvasAsJson(
  doc: JsonCanvasDocument,
  projectName: string,
): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, "_")}_canvas.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportCreativesAsPsd(
  doc: JsonCanvasDocument,
  variants: Variant[],
  projectName: string,
): Promise<void> {
  const { writePsd } = await import("ag-psd");
  const nodes = getCreativeNodes(doc);
  const canvas = document.createElement("canvas");
  const safeName = projectName.replace(/\s+/g, "_");

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    await drawCreativeToCanvas(node, variants, canvas);
    const psd = {
      width: canvas.width,
      height: canvas.height,
      canvas,
    };
    const buffer = writePsd(psd as import("ag-psd").Psd);
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}_${node.sizeLabel ?? i}_${i + 1}.psd`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
