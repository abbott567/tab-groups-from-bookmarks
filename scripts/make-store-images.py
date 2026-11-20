"""Render Chrome Web Store images into store/.

- Screenshots, 1280 x 800: the real popup (popup.html, popup.css, popup.js)
  with sample folders, next to a short headline.
- Small promo tile, 440 x 280.

The popup runs with a fake chrome API, so no extension or real bookmarks are needed.

Usage: python3 scripts/make-store-images.py   (needs Google Chrome)
"""
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "store"

CHROME_CANDIDATES = [
    os.environ.get("CHROME"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    shutil.which("google-chrome"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]

SAMPLE_FOLDERS = [
    {"id": "1", "title": "Craig Abbott", "count": 4, "color": "pink"},
    {"id": "2", "title": "Morning reading", "count": 3, "color": "green"},
    {"id": "3", "title": "Work", "count": 6, "color": "blue"},
    {"id": "4", "title": "Accessibility testing", "count": 5, "color": "purple"},
]

# name: (headline, supporting text, folders, script to run once the popup has rendered)
SCREENSHOTS = {
    "screenshot-1-groups": (
        "Open folders of bookmarks as tab groups",
        "Select a group and all of its bookmarks open together as a named tab group.",
        SAMPLE_FOLDERS,
        "",
    ),
    "screenshot-2-colours": (
        "Give every group its own colour",
        "Select the round colour swatch to choose a colour. Open groups change colour straight away.",
        SAMPLE_FOLDERS,
        'document.querySelectorAll(".swatch")[2].click();',
    ),
    "screenshot-3-setup": (
        "Quick to set up",
        "Start with demo content, or create your own “Tab\u00a0Groups” folder of bookmarks.",
        [],
        "",
    ),
}

PAGE_STYLE = """
@font-face {
  font-family: "IBM Plex Sans";
  font-weight: 100 700;
  src: url(fonts/ibm-plex-sans-latin-wght-normal.woff2) format("woff2-variations");
}
html, body { margin: 0; }
body {
  font-family: "IBM Plex Sans", sans-serif;
  color: #eae1ed;
  background: #180f24;
  -webkit-font-smoothing: antialiased;
}
.accent { color: #f075b5; }
"""


def find_chrome():
    for path in CHROME_CANDIDATES:
        if path and Path(path).exists():
            return path
    raise SystemExit("Couldn't find Chrome. Set the CHROME environment variable to its path.")


def popup_page(work, name, folders, after_render):
    """A copy of popup.html wired to a fake chrome API with the given folders."""
    stub = (
        f"const folders = {json.dumps(folders)};\n"
        "window.chrome = {\n"
        "  runtime: { sendMessage: async (m) => ({ ok: true, result: m.type === 'list' ? folders : null }) },\n"
        "  tabs: { create() {} },\n"
        "};\n"
    )
    (work / f"{name}-stub.js").write_text(stub)
    html = (ROOT / "popup.html").read_text()
    html = html.replace(
        '<script src="popup.js"></script>',
        f'<script src="{name}-stub.js"></script><script src="popup.js"></script>'
        f"<script>setTimeout(() => {{ {after_render} }}, 100)</script>",
    )
    # Match Chrome's own extension-page stylesheet, and show the dark theme.
    html = html.replace(
        '<link rel="stylesheet" href="popup.css" />',
        "<style>body{font-family:system-ui,sans-serif;font-size:75%}</style>"
        '<link rel="stylesheet" href="popup.css" />'
        "<style>:root{color-scheme:dark}</style>",
    )
    page = work / f"{name}-popup.html"
    page.write_text(html)
    return page.name


def screenshot_page(popup_file, headline, text):
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
{PAGE_STYLE}
body {{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 96px;
  align-items: center;
  box-sizing: border-box;
  width: 1280px;
  height: 800px;
  padding: 0 120px;
  background:
    radial-gradient(circle at 85% 20%, #3e2d53 0, transparent 55%),
    #180f24;
}}
h1 {{ margin: 0 0 28px; font-size: 64px; line-height: 1.1; font-weight: 700; letter-spacing: -0.01em; }}
h1::after {{ content: ""; display: block; width: 120px; height: 6px; margin-top: 32px; background: #f1419c; }}
p {{ margin: 0; font-size: 28px; line-height: 1.45; color: #c1b4c5; max-width: 22ch; text-wrap: pretty; }}
.popup {{
  width: 320px;
  border: 1px solid #4e346d;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 30px 80px #0009;
  zoom: 1.45;
}}
iframe {{ display: block; width: 320px; height: 1px; border: 0; }}
</style></head><body>
<div><h1>{headline}</h1><p>{text}</p></div>
<div class="popup"><iframe src="{popup_file}"></iframe></div>
<script>
  // Fit the frame to the popup's content, like Chrome does with real popups.
  const frame = document.querySelector("iframe");
  setTimeout(() => {{
    frame.style.height = frame.contentDocument.documentElement.scrollHeight + "px";
  }}, 400);
</script>
</body></html>"""


def promo_tile_page():
    svg = (ROOT / "icons" / "icon.svg").read_text()
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
{PAGE_STYLE}
body {{
  display: flex;
  gap: 28px;
  align-items: center;
  box-sizing: border-box;
  width: 440px;
  height: 280px;
  padding: 0 40px;
  background: radial-gradient(circle at 90% 10%, #3e2d53 0, transparent 60%), #180f24;
}}
svg {{ flex: none; width: 112px; height: 112px; }}
h1 {{ margin: 0; font-size: 34px; line-height: 1.1; font-weight: 700; }}
p {{ margin: 12px 0 0; font-size: 17px; line-height: 1.35; color: #c1b4c5; text-wrap: balance; }}
</style></head><body>
{svg}
<div><h1><span class="accent">Tab Groups</span> from Bookmarks</h1>
<p>Open folders of saved bookmarks as named tab groups.</p></div>
</body></html>"""


def shoot(chrome, page, out, width, height):
    subprocess.run(
        [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--allow-file-access-from-files",
            f"--window-size={width},{height}",
            "--virtual-time-budget=3000",
            f"--screenshot={out}",
            page.as_uri(),
        ],
        check=True,
        capture_output=True,
    )


def main():
    chrome = find_chrome()
    OUT.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        for item in ("popup.css", "popup.js", "fonts", "icons"):
            src = ROOT / item
            (shutil.copytree if src.is_dir() else shutil.copy)(src, work / item)

        for name, (headline, text, folders, after_render) in SCREENSHOTS.items():
            popup_file = popup_page(work, name, folders, after_render)
            page = work / f"{name}.html"
            page.write_text(screenshot_page(popup_file, headline, text))
            shoot(chrome, page, OUT / f"{name}.png", 1280, 800)
            print(f"Wrote store/{name}.png")

        page = work / "promo-tile.html"
        page.write_text(promo_tile_page())
        shoot(chrome, page, OUT / "promo-small-440x280.png", 440, 280)
        print("Wrote store/promo-small-440x280.png")


if __name__ == "__main__":
    main()
