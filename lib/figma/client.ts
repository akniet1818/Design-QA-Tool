const FIGMA_API = "https://api.figma.com/v1";

function headers() {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token || token === "your_figma_token_here") {
    throw new Error("FIGMA_ACCESS_TOKEN not configured");
  }
  return { "X-Figma-Token": token };
}

export async function getFigmaNode(fileKey: string, nodeId: string) {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Figma API error: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function exportFigmaFrame(fileKey: string, nodeId: string, scale = 2): Promise<string> {
  const res = await fetch(
    `${FIGMA_API}/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=${scale}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Figma export error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const imageUrl = data.images?.[nodeId] ?? data.images?.[nodeId.replace("-", ":")];
  if (!imageUrl) throw new Error("Figma returned no image URL for this node");
  return imageUrl;
}

export async function getFigmaStyles(fileKey: string) {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}/styles`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Figma styles error: ${res.status}`);
  return res.json();
}
