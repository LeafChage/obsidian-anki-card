import type { UIAPI } from "@/obsidian/api";

// Browser-only stand-in for ObsidianUI (Notice/Modal), used when running the
// app outside of Obsidian (see frontend.tsx).
export class LocalUI implements UIAPI {
  public notice = (msg: string) => {
    console.log(`[notice] ${msg}`);
  }

  public markdownModal = (md: string) => {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8";

    const panel = document.createElement("pre");
    panel.className = "max-h-[80vh] max-w-[80vw] overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-6 text-slate-800 shadow-xl";
    panel.textContent = md;

    overlay.appendChild(panel);
    overlay.addEventListener("click", () => close());

    const open = () => document.body.appendChild(overlay);
    const close = () => overlay.remove();

    return { open, close };
  }
}
