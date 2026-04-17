# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "geopandas>=1.0",
#   "shapely>=2.0",
#   "fiona>=1.9",
# ]
# ///
"""Build a Monterey Bay land-mask GeoJSON from the bundled Natural Earth coastline.

Input:  ne_10m_coastline.zip   (repo root, zipped shapefile; geopandas reads directly)
Output: src/app/data/landMask.geo.json   (Feature<MultiPolygon>, WGS84)

Re-run with:
    uv run scripts/build_land_mask.py

The script clips the global coastline to a box slightly larger than the in-app
map bounds, polygonizes `bbox_boundary ∪ clipped_coastlines`, and keeps the
polygon faces that contain any known-land seed point. The union of those faces
is the land mask used at runtime to subtract land from the listening-range ring.
"""

from __future__ import annotations

import json
from pathlib import Path

import geopandas as gpd
from shapely.geometry import Point, box, mapping
from shapely.ops import polygonize, unary_union

REPO_ROOT = Path(__file__).resolve().parent.parent
COASTLINE_ZIP = REPO_ROOT / "ne_10m_coastline.zip"
OUTPUT_PATH = REPO_ROOT / "src" / "app" / "data" / "landMask.geo.json"

# Slightly larger than MAX_BOUNDS in ListeningRangeMap.tsx so the mask fully
# covers the viewport with headroom for any listening radius that might extend
# past the visible area.
BBOX = (-124.0, 35.5, -120.0, 38.0)  # (minLon, minLat, maxLon, maxLat)

# Sample points known to be on land inside the bbox. Any polygon face that
# contains at least one of these is classified as land. Spread across the
# contiguous land area to handle potential disconnected faces (peninsulas,
# offshore rocks, etc.).
LAND_SEEDS: list[tuple[float, float]] = [
    (-121.89, 37.34),  # San Jose
    (-121.66, 36.68),  # Salinas
    (-121.30, 36.20),  # inland Big Sur / Santa Lucia range
    (-121.50, 37.05),  # Diablo Range foothills
    (-122.10, 37.35),  # Santa Cruz Mountains inland
    (-121.00, 37.70),  # Central Valley edge
]

COORD_PRECISION = 6


def _round_coords(geom: dict) -> dict:
    """Round GeoJSON coordinate arrays in place to shrink the bundled asset."""

    def _round(seq):
        if isinstance(seq, (int, float)):
            return round(float(seq), COORD_PRECISION)
        return [_round(item) for item in seq]

    geom["coordinates"] = _round(geom["coordinates"])
    return geom


def main() -> None:
    if not COASTLINE_ZIP.exists():
        raise SystemExit(f"Missing input shapefile: {COASTLINE_ZIP}")

    print(f"Reading {COASTLINE_ZIP.name}...")
    coastlines = gpd.read_file(f"zip://{COASTLINE_ZIP}")

    if coastlines.crs is None:
        coastlines = coastlines.set_crs("EPSG:4326")
    elif coastlines.crs.to_epsg() != 4326:
        coastlines = coastlines.to_crs("EPSG:4326")

    bbox_geom = box(*BBOX)
    print(f"Clipping coastline to bbox {BBOX}...")
    clipped = gpd.clip(coastlines, bbox_geom)
    if clipped.empty:
        raise SystemExit("No coastline segments intersect the bbox.")

    # Merge all clipped line segments + the bbox ring so polygonize can build
    # closed faces on both sides of the coast.
    merged = unary_union([*clipped.geometry.values, bbox_geom.boundary])
    faces = list(polygonize(merged))
    if not faces:
        raise SystemExit("polygonize produced no faces.")
    print(f"Polygonized into {len(faces)} face(s).")

    seed_points = [Point(lon, lat) for lon, lat in LAND_SEEDS]
    land_faces = [
        face for face in faces if any(face.contains(pt) for pt in seed_points)
    ]
    if not land_faces:
        raise SystemExit(
            "No polygon face contained a land seed point; check BBOX/LAND_SEEDS."
        )
    print(f"Identified {len(land_faces)} land face(s) via seed points.")

    land_union = unary_union(land_faces)
    geometry = mapping(land_union)
    if geometry["type"] == "Polygon":
        # Normalize to MultiPolygon for a single stable runtime shape.
        geometry = {"type": "MultiPolygon", "coordinates": [geometry["coordinates"]]}
    _round_coords(geometry)

    feature = {
        "type": "Feature",
        "geometry": geometry,
        "properties": {
            "source": "Natural Earth 1:10m coastline",
            "bbox": list(BBOX),
        },
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(feature, separators=(",", ":")) + "\n")
    size_kb = OUTPUT_PATH.stat().st_size / 1024
    print(f"Wrote {OUTPUT_PATH.relative_to(REPO_ROOT)} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
