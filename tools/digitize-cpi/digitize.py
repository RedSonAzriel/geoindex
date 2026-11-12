"""Digitize curves from Techlog-style CPI raster images (South Lokichar FDP).

For each image:
  1. find the body top (long horizontal rule under the track headers)
  2. find track borders (columns that are dark through most of the body)
  3. OCR the MD depth labels to get a linear depth(y) fit
  4. per track, trace one curve by colour: median x of matching pixels per row
Outputs JSON {well, depth[], curves{name: values[]}} at the image's row spacing.
"""
import json, subprocess, sys, io, csv
import numpy as np
from PIL import Image

def load(path):
    return np.asarray(Image.open(path).convert("RGB")).astype(int)

def dark(a, thr=160):
    return (a[..., 0] < thr) & (a[..., 1] < thr) & (a[..., 2] < thr)

def body_top(a):
    d = dark(a)
    W = a.shape[1]
    for y in range(40, a.shape[0] // 3):
        if d[y].sum() > 0.85 * W:
            last = y
            # continue to the last consecutive rule row
            while last + 1 < a.shape[0] and d[last + 1].sum() > 0.85 * W:
                last += 1
            return last + 1
    raise RuntimeError("no body top")

def borders(a, top):
    d = dark(a)[top + 5:]
    frac = d.mean(axis=0)
    cols = np.where(frac > 0.8)[0]
    # merge adjacent columns into single borders
    groups, cur = [], [cols[0]]
    for c in cols[1:]:
        if c - cur[-1] <= 2:
            cur.append(c)
        else:
            groups.append(cur); cur = [c]
    groups.append(cur)
    return [(g[0], g[-1]) for g in groups]

def depth_fit(path, a, top, x0, x1):
    crop = Image.open(path).convert("L").crop((x0, top, x1, a.shape[0]))
    s = 4
    crop = crop.resize((crop.width * s, crop.height * s), Image.LANCZOS)
    buf = io.BytesIO(); crop.save(buf, format="PNG")
    out = subprocess.run(["tesseract", "stdin", "stdout", "--psm", "6", "-c",
                          "tessedit_char_whitelist=0123456789", "tsv"],
                         input=buf.getvalue(), capture_output=True).stdout.decode()
    pts = []
    for row in csv.DictReader(io.StringIO(out), delimiter="\t"):
        t = (row.get("text") or "").strip()
        if t.isdigit() and len(t) >= 3 and float(row["conf"]) > 50:
            yc = top + (int(row["top"]) + int(row["height"]) / 2) / s
            pts.append((yc, int(t)))
    pts.sort()
    # keep labels consistent with a monotone, evenly spaced sequence
    ys = np.array([p[0] for p in pts]); ds = np.array([p[1] for p in pts], float)
    for _ in range(3):
        A = np.vstack([ys, np.ones_like(ys)]).T
        k, b = np.linalg.lstsq(A, ds, rcond=None)[0]
        res = np.abs(ds - (k * ys + b))
        keep = res < max(2.0, 3 * np.median(res) + 0.5)
        ys, ds = ys[keep], ds[keep]
    A = np.vstack([ys, np.ones_like(ys)]).T
    k, b = np.linalg.lstsq(A, ds, rcond=None)[0]
    return k, b, len(ys), float(np.max(np.abs(ds - (k * ys + b))))

COLOURS = {
    # name: predicate on rgb arrays
    # lines are anti-aliased and desaturated, so test relative dominance
    "green": lambda r, g, b: (g - np.maximum(r, b) > 22) & (g < 235),
    "blue":  lambda r, g, b: (b - np.maximum(r, g) > 22) & (b < 240) & (np.abs(r - g) < 40),
    "black": lambda r, g, b: (np.maximum(np.maximum(r, g), b) < 125) &
                             (np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b) < 30),
}

def trace(a, top, xl, xr, colour, pad=3):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = COLOURS[colour](r, g, b)
    xl, xr = xl + pad, xr - pad
    vals = np.full(a.shape[0], np.nan)
    for y in range(top + 2, a.shape[0]):
        xs = np.where(m[y, xl:xr])[0]
        if len(xs):
            vals[y] = (np.median(xs)) / (xr - xl)  # 0..1 across track
    return vals, (xl, xr)

def run(spec):
    a = load(spec["image"])
    top = body_top(a)
    bd = borders(a, top)
    k, b, n, err = depth_fit(spec["image"], a, top, bd[0][1] + 1, bd[1][0])
    tracks = [(bd[i][1] + 1, bd[i + 1][0]) for i in range(len(bd) - 1)]
    rows = np.arange(a.shape[0])
    depth = k * rows + b
    out = {"well": spec["well"], "curves": {}}
    for cname, (ti, colour, lo, hi) in spec["curves"].items():
        xl, xr = tracks[ti]
        frac, _ = trace(a, top, xl, xr, colour)
        out["curves"][cname] = lo + frac * (hi - lo)
    sl = slice(top + 3, a.shape[0] - 2)
    depth = depth[sl]
    for c in out["curves"]:
        out["curves"][c] = out["curves"][c][sl]
    info = dict(top=int(top), n_tracks=len(tracks), depth_k=k, labels=n, label_err_m=err,
                depth_range=(float(depth[0]), float(depth[-1])),
                coverage={c: float(np.mean(~np.isnan(v))) for c, v in out["curves"].items()})
    out["depth"] = depth
    out["_k"], out["_b"] = k, b
    return out, info, tracks

def overlay(spec, out, tracks, path):
    from PIL import ImageDraw
    im = Image.open(spec["image"]).convert("RGB")
    im = im.resize((im.width * 2, im.height * 2))
    dr = ImageDraw.Draw(im)
    k = (out["depth"][1] - out["depth"][0])
    y0 = None
    for cname, (ti, colour, lo, hi) in spec["curves"].items():
        xl, xr = tracks[ti]; xl += 3; xr -= 3
        for i, (d, v) in enumerate(zip(out["depth"], out["curves"][cname])):
            if np.isnan(v): continue
            y = (d - out["_b"]) / out["_k"]
            x = xl + (v - lo) / (hi - lo) * (xr - xl)
            dr.ellipse([2*x-2, 2*y-2, 2*x+2, 2*y+2], fill=(255, 0, 255))
    im.save(path)

if __name__ == "__main__":
    spec = json.load(open(sys.argv[1]))
    out, info, tracks = run(spec)
    print(json.dumps(info, default=float))
    overlay(spec, out, tracks, sys.argv[2])
