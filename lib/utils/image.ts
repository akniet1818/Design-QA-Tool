export function base64ToBuffer(base64: string): Buffer {
  const data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(data, "base64");
}

export function bufferToBase64(buf: Buffer, mime = "image/png"): string {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export function bufferToBase64Raw(buf: Buffer): string {
  return buf.toString("base64");
}

export async function cropImageSharp(
  buf: Buffer,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp(buf)
    .extract({ left: Math.max(0, x), top: Math.max(0, y), width, height })
    .png()
    .toBuffer();
}

export async function resizeToMatch(
  buf: Buffer,
  targetWidth: number,
  targetHeight: number
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp(buf)
    .resize(targetWidth, targetHeight, { fit: "fill" })
    .png()
    .toBuffer();
}

export async function getImageDimensions(
  buf: Buffer
): Promise<{ width: number; height: number }> {
  const sharp = (await import("sharp")).default;
  const meta = await sharp(buf).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0 };
}
