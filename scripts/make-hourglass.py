#!/usr/bin/env python3
import math
import struct
import zlib
from pathlib import Path


def chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def write_png(path: Path, w: int, h: int, pixels: bytearray) -> None:
    raw = b"".join(b"\x00" + pixels[y * w * 4 : (y + 1) * w * 4] for y in range(h))
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def mix(dst: bytearray, i: int, r: int, g: int, b: int, a: int) -> None:
    if a <= 0:
        return
    dr, dg, db, da = dst[i : i + 4]
    inv = 255 - a
    out_a = a + (da * inv) // 255
    if out_a == 0:
        dst[i : i + 4] = b"\x00\x00\x00\x00"
        return
    dst[i] = (r * a + dr * inv) // 255
    dst[i + 1] = (g * a + dg * inv) // 255
    dst[i + 2] = (b * a + db * inv) // 255
    dst[i + 3] = out_a


def fill_poly(px: bytearray, w: int, h: int, pts: list[tuple[float, float]], color: tuple[int, int, int, int]) -> None:
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    minx, maxx = max(0, int(min(xs))), min(w - 1, int(max(xs)))
    miny, maxy = max(0, int(min(ys))), min(h - 1, int(max(ys)))
    n = len(pts)
    r, g, b, a = color
    for y in range(miny, maxy + 1):
        y + 0.5
        crosses = []
        for i in range(n):
            x1, y1 = pts[i]
            x2, y2 = pts[(i + 1) % n]
            if (y1 <= y < y2) or (y2 <= y < y1):
                t = (y - y1) / (y2 - y1) if y2 != y1 else 0
                crosses.append(x1 + t * (x2 - x1))
        crosses.sort()
        for a1, a2 in zip(crosses[0::2], crosses[1::2]):
            x0, x1 = int(math.floor(a1)), int(math.ceil(a2))
            for x in range(max(0, x0), min(w, x1 + 1)):
                mix(px, (y * w + x) * 4, r, g, b, a)


def stroke_poly(px: bytearray, w: int, h: int, pts: list[tuple[float, float]], color: tuple[int, int, int, int], width: float) -> None:
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        dx, dy = x2 - x1, y2 - y1
        length = math.hypot(dx, dy) or 1
        nx, ny = -dy / length * width / 2, dx / length * width / 2
        fill_poly(
            px,
            w,
            h,
            [
                (x1 + nx, y1 + ny),
                (x1 - nx, y1 - ny),
                (x2 - nx, y2 - ny),
                (x2 + nx, y2 + ny),
            ],
            color,
        )


def round_rect(px: bytearray, w: int, h: int, x: float, y: float, rw: float, rh: float, rad: float, color: tuple[int, int, int, int]) -> None:
    fill_poly(
        px,
        w,
        h,
        [
            (x + rad, y),
            (x + rw - rad, y),
            (x + rw, y + rad),
            (x + rw, y + rh - rad),
            (x + rw - rad, y + rh),
            (x + rad, y + rh),
            (x, y + rh - rad),
            (x, y + rad),
        ],
        color,
    )


def draw_hourglass(mode: str) -> bytearray:
    w, h = 160, 220
    px = bytearray(w * h * 4)
    glass = [(30, 36), (130, 36), (88, 110), (130, 184), (30, 184), (72, 110)]
    top_sand_full = [(38, 42), (122, 42), (84, 102), (76, 102)]
    bot_sand_full = [(38, 178), (122, 178), (84, 118), (76, 118)]
    top_sand_half = [(50, 70), (110, 70), (84, 102), (76, 102)]
    bot_sand_half = [(50, 150), (110, 150), (84, 118), (76, 118)]
    pink = (232, 160, 184, 255)
    cap = (247, 201, 216, 255)
    sand = (232, 154, 76, 255)
    round_rect(px, w, h, 42, 8, 76, 22, 10, cap)
    round_rect(px, w, h, 42, 190, 76, 22, 10, cap)
    stroke_poly(px, w, h, glass, pink, 7)

    if mode == "full":
        fill_poly(px, w, h, top_sand_full, sand)
    elif mode == "half":
        fill_poly(px, w, h, top_sand_half, sand)
        fill_poly(px, w, h, bot_sand_half, sand)
        fill_poly(px, w, h, [(76, 104), (84, 104), (84, 116), (76, 116)], sand)
    else:
        fill_poly(px, w, h, bot_sand_full, sand)
    return px


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "public" / "sprites"
    out.mkdir(parents=True, exist_ok=True)
    for name, mode in (("hourglass-full.png", "full"), ("hourglass-half.png", "half"), ("hourglass-empty.png", "empty")):
        write_png(out / name, 160, 220, draw_hourglass(mode))
        print("wrote", name)


if __name__ == "__main__":
    main()
