import { NextRequest } from "next/server";
import { getFigmaStyles } from "@/lib/figma/client";

export async function GET(req: NextRequest) {
  try {
    const fileKey = req.nextUrl.searchParams.get("fileKey");
    if (!fileKey) return new Response("Missing fileKey", { status: 400 });
    const data = await getFigmaStyles(fileKey);
    return Response.json(data);
  } catch (err) {
    console.error("[figma/styles]", err);
    return new Response(err instanceof Error ? err.message : "Failed", { status: 500 });
  }
}
