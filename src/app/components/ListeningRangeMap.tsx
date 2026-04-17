import { useEffect, useRef, type ReactNode } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import difference from "@turf/difference";
import { featureCollection } from "@turf/helpers";
import { useSoundStore } from "../store/useSoundStore";
import landMaskJson from "../data/landMask.geo.json";

const landMask = landMaskJson as GeoJSON.Feature<GeoJSON.MultiPolygon>;

const MONTEREY_BAY_CENTER: [number, number] = [-121.95, 36.8];
const SANTA_CRUZ_COAST: [number, number] = [-122.0, 36.92];
const MONTEREY_BAY_ZOOM = 9;
const MIN_ZOOM = 7.5;
const MAX_ZOOM = 9;
const MAX_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-123.5, 35.9],  // SW: west of Half Moon Bay, south of Point Sur
  [-120.5, 37.6],  // NE: east of Salinas Valley, north of Half Moon Bay
];
const RING_SOURCE_ID = "listener-range";
const RING_FILL_LAYER_ID = "listener-range-fill";
const RING_LINE_LAYER_ID = "listener-range-line";
const LISTENER_STROKE = "rgba(147, 197, 253, 0.9)";
const SOURCE_STROKE = "rgba(253, 224, 71, 0.9)";

const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    "esri-world-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },
  layers: [
    {
      id: "esri-world-imagery",
      type: "raster",
      source: "esri-world-imagery",
    },
  ],
};

function listeningRingFeature(
  centerLon: number,
  centerLat: number,
  radiusKm: number,
  steps = 96,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const kmPerDegLat = 110.574;
  const kmPerDegLon = 111.32 * Math.cos((centerLat * Math.PI) / 180);
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const dLon = (radiusKm / kmPerDegLon) * Math.cos(theta);
    const dLat = (radiusKm / kmPerDegLat) * Math.sin(theta);
    coords.push([centerLon + dLon, centerLat + dLat]);
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
    properties: {},
  };
}

function emptyFeatureCollection(): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  return { type: "FeatureCollection", features: [] };
}

function createParticipantMarkerEl(borderColor: string): {
  el: HTMLDivElement;
  img: HTMLImageElement;
} {
  const el = document.createElement("div");
  el.style.width = "56px";
  el.style.height = "56px";
  el.style.borderRadius = "9999px";
  el.style.border = `3px solid ${borderColor}`;
  el.style.background = "rgba(255, 255, 255, 0.25)";
  el.style.backdropFilter = "blur(4px)";
  el.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.35)";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.pointerEvents = "none";

  const img = document.createElement("img");
  img.alt = "";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";
  img.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.5))";
  el.appendChild(img);

  return { el, img };
}

export default function ListeningRangeMap({ mobileToggle }: { mobileToggle?: ReactNode }) {
  const listener = useSoundStore((s) => s.listener);
  const source = useSoundStore((s) => s.source);
  const distanceKm = useSoundStore((s) => s.getDistance());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const listenerMarkerRef = useRef<maplibregl.Marker | null>(null);
  const listenerImgRef = useRef<HTMLImageElement | null>(null);
  const sourceMarkerRef = useRef<maplibregl.Marker | null>(null);
  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  const isStyleLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: satelliteStyle,
      center: MONTEREY_BAY_CENTER,
      zoom: MONTEREY_BAY_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: MAX_BOUNDS,
      pitchWithRotate: false,
      dragRotate: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    const listenerMarker = createParticipantMarkerEl(LISTENER_STROKE);
    listenerImgRef.current = listenerMarker.img;
    listenerMarkerRef.current = new maplibregl.Marker({
      element: listenerMarker.el,
      anchor: "center",
    })
      .setLngLat(MONTEREY_BAY_CENTER)
      .addTo(map);

    const sourceMarker = createParticipantMarkerEl(SOURCE_STROKE);
    sourceImgRef.current = sourceMarker.img;
    sourceMarkerRef.current = new maplibregl.Marker({
      element: sourceMarker.el,
      anchor: "center",
    })
      .setLngLat(SANTA_CRUZ_COAST)
      .addTo(map);

    map.on("click", (e) => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      console.log("[ListeningRangeMap] click", {
        clicked: { lng: e.lngLat.lng, lat: e.lngLat.lat },
        viewport: {
          center: { lng: center.lng, lat: center.lat },
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
          bounds: {
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth(),
          },
        },
      });
    });

    map.on("load", () => {
      isStyleLoadedRef.current = true;
      map.addSource(RING_SOURCE_ID, {
        type: "geojson",
        data: emptyFeatureCollection(),
      });
      map.addLayer({
        id: RING_FILL_LAYER_ID,
        type: "fill",
        source: RING_SOURCE_ID,
        paint: {
          "fill-color": SOURCE_STROKE,
          "fill-opacity": 0.15,
        },
      });
      map.addLayer({
        id: RING_LINE_LAYER_ID,
        type: "line",
        source: RING_SOURCE_ID,
        paint: {
          "line-color": SOURCE_STROKE,
          "line-width": 2,
        },
      });

      updateRing();
      map.resize();
    });

    // MapLibre sizes its canvas at init. When the flex parent resolves its
    // dimensions later (or the layout changes), the canvas stays stale and
    // renders nothing. ResizeObserver keeps the canvas in sync with the box.
    const ro = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      isStyleLoadedRef.current = false;
      listenerMarkerRef.current?.remove();
      listenerMarkerRef.current = null;
      listenerImgRef.current = null;
      sourceMarkerRef.current?.remove();
      sourceMarkerRef.current = null;
      sourceImgRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const updateRing = () => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current) return;
    const src = map.getSource(RING_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    if (distanceKm > 0) {
      const circle = listeningRingFeature(
        SANTA_CRUZ_COAST[0],
        SANTA_CRUZ_COAST[1],
        distanceKm,
      );
      const clipped = difference(
        featureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>([
          circle,
          landMask,
        ]),
      );
      if (clipped) {
        src.setData({ type: "FeatureCollection", features: [clipped] });
      } else {
        src.setData(emptyFeatureCollection());
      }
    } else {
      src.setData(emptyFeatureCollection());
    }
  };

  useEffect(() => {
    if (listenerImgRef.current) {
      listenerImgRef.current.src = listener.icon;
    }
    if (sourceImgRef.current) {
      sourceImgRef.current.src = source.icon;
    }
    updateRing();
  }, [listener.id, listener.icon, source.id, source.icon, distanceKm]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden bg-black/40"
      style={{ width: "100%", height: "100%" }}
    >
      {mobileToggle && (
        <div className="absolute top-3 left-3 z-10">{mobileToggle}</div>
      )}
    </div>
  );
}
