"""Render the extension icons from icons/icon.svg.

The SVG is the source of truth. It's drawn on a 19 x 18 grid and centred in a
21 x 21 viewBox: square because Chrome needs square icons, with 1 unit of
padding on each side so the logo sits slightly smaller.

Colours (checked against white, #f1f3f4, #35363a and #202124 toolbars,
all at least 3:1 for WCAG 1.4.11 non-text contrast):
  pink  #F1419C
  lilac #947EA0

The SVG is rendered once at high resolution with headless Google Chrome,
then scaled down to each size so edges stay smooth.

Usage: python3 scripts/make-icons.py   (needs Pillow and Google Chrome)
"""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "icons" / "icon.svg"
OUT = ROOT / "icons"
SIZES = (16, 32, 48, 128)
RENDER = 1024

CHROME_CANDIDATES = [
    os.environ.get("CHROME"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    shutil.which("google-chrome"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]


def find_chrome():
    for path in CHROME_CANDIDATES:
        if path and Path(path).exists():
            return path
    raise SystemExit("Couldn't find Chrome. Set the CHROME environment variable to its path.")


def render_large(chrome):
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "icon.html"
        shot = Path(tmp) / "icon.png"
        page.write_text(
            "<!doctype html><style>html,body{margin:0;background:transparent}"
            f"img{{display:block;width:{RENDER}px;height:{RENDER}px}}</style>"
            f'<img src="{SVG.as_uri()}">'
        )
        subprocess.run(
            [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--default-background-color=00000000",
                f"--window-size={RENDER},{RENDER}",
                "--allow-file-access-from-files",
                f"--screenshot={shot}",
                page.as_uri(),
            ],
            check=True,
            capture_output=True,
        )
        return Image.open(shot).convert("RGBA").crop((0, 0, RENDER, RENDER))


def main():
    big = render_large(find_chrome())
    for px in SIZES:
        big.resize((px, px), Image.LANCZOS).save(OUT / f"icon-{px}.png")
    print("Wrote", ", ".join(f"icon-{px}.png" for px in SIZES))


if __name__ == "__main__":
    main()
