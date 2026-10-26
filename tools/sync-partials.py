"""Inject the shared header and footer partials into every page.

Each page carries marker comments:
    <!-- @@HEADER -->  ...  <!-- @@/HEADER -->
    <!-- @@FOOTER -->  ...  <!-- @@/FOOTER -->
Edit tools/partials/*.html, then run:  python tools/sync-partials.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTS = ROOT / "tools" / "partials"


def inject(html: str, name: str, body: str) -> str:
    pat = re.compile(rf"(<!-- @@{name} -->)(.*?)(<!-- @@/{name} -->)", re.S)
    if not pat.search(html):
        return html
    return pat.sub(lambda m: f"{m.group(1)}\n{body}\n{m.group(3)}", html)


def main() -> None:
    header = (PARTS / "header.html").read_text(encoding="utf-8").strip()
    footer = (PARTS / "footer.html").read_text(encoding="utf-8").strip()
    for page in sorted(ROOT.glob("*.html")):
        src = page.read_text(encoding="utf-8")
        out = inject(inject(src, "HEADER", header), "FOOTER", footer)
        if out != src:
            page.write_text(out, encoding="utf-8")
            print("synced", page.name)


if __name__ == "__main__":
    main()
