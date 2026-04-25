import sharp from "sharp";
import { base64ToBuffer } from "@/lib/utils/image";
import { getNearestColor } from "@/lib/tokens/color-map";
import { compareColors, rgbToHex } from "@/lib/utils/delta-e";
import { severityByDeltaE } from "@/lib/utils/severity";
import type { DesignBug } from "@/types";
import { v4 as uuidv4 } from "uuid";

const SAMPLE_GRID = 8;

interface SampledRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  hex: string;
}

async function sampleColors(buf: Buffer, width: number, height: number): Promise<SampledRegion[]> {
  const meta = await sharp(buf).metadata();
  const safeW = Math.min(width, meta.width ?? width);
  const safeH = Math.min(height, meta.height ?? height);
  const stepX = Math.floor(safeW / SAMPLE_GRID);
  const stepY = Math.floor(safeH / SAMPLE_GRID);

  const tasks: Promise<SampledRegion | null>[] = [];
  for (let row = 0; row < SAMPLE_GRID; row++) {
    for (let col = 0; col < SAMPLE_GRID; col++) {
      const x = col * stepX;
      const y = row * stepY;
      const w = Math.min(stepX, safeW - x);
      const h = Math.min(stepY, safeH - y);
      if (w < 2 || h < 2) { tasks.push(Promise.resolve(null)); continue; }

      tasks.push(
        sharp(buf)
          .extract({ left: x, top: y, width: w, height: h })
          .resize(1, 1, { fit: "fill", kernel: "lanczos3" })
          .raw()
          .toBuffer({ resolveWithObject: true })
          .then(({ data }) => ({ x, y, width: w, height: h, hex: rgbToHex(data[0], data[1], data[2]) }))
      );
    }
  }

  const results = await Promise.all(tasks);
  return results.filter((r): r is SampledRegion => r !== null);
}

export async function detectColorBugs(
  figmaBase64: string,
  stagingBase64: string,
  threshold: number,
  imageWidth: number,
  imageHeight: number
): Promise<DesignBug[]> {
  const figmaBuf = base64ToBuffer(figmaBase64);
  const stagingBuf = base64ToBuffer(stagingBase64);

  const [figmaColors, stagingColors] = await Promise.all([
    sampleColors(figmaBuf, imageWidth, imageHeight),
    sampleColors(stagingBuf, imageWidth, imageHeight),
  ]);

  const bugs: DesignBug[] = [];

  for (let i = 0; i < figmaColors.length; i++) {
    const f = figmaColors[i];
    const s = stagingColors[i];
    if (!s) continue;

    const deltaE = compareColors(f.hex, s.hex);
    if (deltaE <= threshold) continue;

    const figmaToken = getNearestColor(f.hex);
    const stagingToken = getNearestColor(s.hex);

    bugs.push({
      id: uuidv4(),
      type: "color",
      severity: severityByDeltaE(deltaE),
      location: { x: f.x, y: f.y, width: f.width, height: f.height },
      figmaValue: f.hex,
      stagingValue: s.hex,
      figmaTailwindToken: figmaToken.token,
      stagingTailwindToken: stagingToken.token,
      suggestedFix: `Change ${stagingToken.token} → ${figmaToken.token}`,
      screenshot: "",
    });
  }

  return bugs;
}
