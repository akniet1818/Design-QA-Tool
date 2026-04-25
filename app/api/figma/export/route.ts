import { NextRequest } from "next/server";
import { exportFigmaFrame } from "@/lib/figma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const fileKey = searchParams.get("fileKey");
    const nodeId = searchParams.get("nodeId");

    if (!fileKey || !nodeId) {
      return new Response("Missing fileKey or nodeId", { status: 400 });
    }

    const s3Url = await exportFigmaFrame(fileKey, nodeId);

    // Fetch the actual image bytes and return as base64 data URL
    // so the client and analyze pipeline always receive a data URL, never a raw S3 URL
    const imgRes = await fetch(s3Url);
    if (!imgRes.ok) throw new Error(`Failed to download Figma image: ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const mime = imgRes.headers.get("content-type") ?? "image/png";
    const imageUrl = `data:${mime};base64,${buf.toString("base64")}`;

    return Response.json({ imageUrl });
  } catch (err) {
    console.error("[figma/export]", err);
    return new Response(err instanceof Error ? err.message : "Figma export failed", { status: 500 });
  }
}
