import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { base64ToBuffer, bufferToBase64, resizeToMatch, getImageDimensions } from "@/lib/utils/image";

export interface DiffResult {
  diffImageBase64: string;
  diffPercentage: number;
  width: number;
  height: number;
}

export async function generateDiff(
  figmaBase64: string,
  stagingBase64: string,
  threshold = 0.1
): Promise<DiffResult> {
  const figmaBuf = base64ToBuffer(figmaBase64);
  let stagingBuf = base64ToBuffer(stagingBase64);

  const figmaDims = await getImageDimensions(figmaBuf);
  const stagingDims = await getImageDimensions(stagingBuf);

  if (figmaDims.width !== stagingDims.width || figmaDims.height !== stagingDims.height) {
    stagingBuf = await resizeToMatch(stagingBuf, figmaDims.width, figmaDims.height);
  }

  const img1 = PNG.sync.read(figmaBuf);
  const img2 = PNG.sync.read(stagingBuf);
  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const numDiff = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold,
    includeAA: false,
    alpha: 0.1,
    diffColor: [255, 50, 50],
    diffColorAlt: [0, 150, 255],
  });

  const diffBuffer = PNG.sync.write(diff);
  return {
    diffImageBase64: bufferToBase64(diffBuffer),
    diffPercentage: Number(((numDiff / (width * height)) * 100).toFixed(2)),
    width,
    height,
  };
}
