import { toPng } from "html-to-image";

// Render a DOM node (the report card) to a high-resolution PNG data URL,
// sized for phone sharing (~1080x1350). We render at the node's natural size
// and upscale via pixelRatio for crisp output in iMessage/WhatsApp.
export async function nodeToPng(node: HTMLElement): Promise<string> {
  // Base card is 380px wide; ratio 3 → ~1140px, crisp for phone sharing
  // and close to the recommended 1080×1350 export size.
  return toPng(node, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: "#F8F3EA",
    skipFonts: false,
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Share an image using the native share sheet when available, otherwise
// fall back to downloading it. Returns the method used.
export async function shareImage(
  dataUrl: string,
  filename: string,
  title: string,
  text: string,
): Promise<"shared" | "downloaded"> {
  try {
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title, text });
      return "shared";
    }
  } catch (err) {
    // user canceled or share failed → fall through to download
    if ((err as Error)?.name === "AbortError") return "shared";
  }
  downloadDataUrl(dataUrl, filename);
  return "downloaded";
}

export async function shareText(title: string, text: string): Promise<boolean> {
  const nav = navigator as Navigator;
  if (nav.share) {
    try {
      await nav.share({ title, text });
      return true;
    } catch {
      /* canceled */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
  return false;
}
