import { useEffect, useRef, useState, type ReactNode } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import difference from "@turf/difference";
import { featureCollection } from "@turf/helpers";
import { useSoundStore } from "../store/useSoundStore";
import { conditionOrder } from "../data/conditions";
import type { AmbientCondition } from "../types";
import landMaskJson from "../data/landMask.geo.json";

const landMask = landMaskJson as GeoJSON.Feature<GeoJSON.MultiPolygon>;

const LISTENER_COORDINATE: [number, number] = [-121.956, 36.64324];
const SOURCE_ENDPOINT: [number, number] = [-122.0448, 36.93279];
const MONTEREY_BAY_CENTER: [number, number] = [-121.95, 36.8];
const MONTEREY_BAY_ZOOM = 9;
const MIN_ZOOM = 7.5;
const MAX_ZOOM = 11.7;
const MAX_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-123.5, 35.9],
  [-120.5, 37.6],
];
const RING_SOURCE_ID = "listener-range";
const RING_FILL_LAYER_ID = "listener-range-fill";
const RING_LINE_LAYER_ID = "listener-range-line";
const LISTENER_STROKE = "rgba(147, 197, 253, 0.9)";
const SOURCE_STROKE = "rgba(253, 224, 71, 0.9)";

const CONDITION_COLOR: Record<AmbientCondition, string> = {
  calm: "rgb(45, 212, 191)",
  winter: "rgb(234, 179, 8)",
  storm: "rgb(220, 38, 38)",
  cruiseShip: "rgb(127, 29, 29)",
};

const KM_PER_DEG_LAT = 110.574;

function kmPerDegLon(lat: number) {
  return 111.32 * Math.cos((lat * Math.PI) / 180);
}

function approxDistanceKm(a: [number, number], b: [number, number]): number {
  const dLat = (b[1] - a[1]) * KM_PER_DEG_LAT;
  const dLon = (b[0] - a[0]) * kmPerDegLon((a[1] + b[1]) / 2);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

function interpolatePoint(
  from: [number, number],
  to: [number, number],
  distKm: number,
): [number, number] {
  const totalKm = approxDistanceKm(from, to);
  if (totalKm <= 0) return from;
  const t = Math.min(distKm / totalKm, 1);
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
  ];
}

function listeningRingFeature(
  centerLon: number,
  centerLat: number,
  radiusKm: number,
  steps = 96,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const kpdLon = kmPerDegLon(centerLat);
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const dLon = (radiusKm / kpdLon) * Math.cos(theta);
    const dLat = (radiusKm / KM_PER_DEG_LAT) * Math.sin(theta);
    coords.push([centerLon + dLon, centerLat + dLat]);
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
    properties: {},
  };
}

function emptyFeatureCollection(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

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
  const oceanCondition = useSoundStore((s) => s.oceanCondition);
  const [audibility, setAudibility] = useState<"audible" | "not-audible" | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const listenerMarkerRef = useRef<maplibregl.Marker | null>(null);
  const listenerImgRef = useRef<HTMLImageElement | null>(null);
  const sourceMarkerRef = useRef<maplibregl.Marker | null>(null);
  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  const isStyleLoadedRef = useRef(false);

  const updateRings = () => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current) return;
    const geoSrc = map.getSource(RING_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (!geoSrc) return;

    const state = useSoundStore.getState();
    const detection = state.listener.detections[state.source.id];

    if (!detection) {
      geoSrc.setData(emptyFeatureCollection());
      sourceMarkerRef.current?.setLngLat(LISTENER_COORDINATE);
      setAudibility(null);
      return;
    }

    const activeColor = CONDITION_COLOR[state.oceanCondition];

    // Active circle first (bottom), then inactive sorted largest-first
    // so smaller inactive rings layer on top and remain visible.
    const activeEntry = { cond: state.oceanCondition, radius: detection[state.oceanCondition] };
    const inactiveEntries = conditionOrder
      .filter((c) => c !== state.oceanCondition)
      .map((cond) => ({ cond, radius: detection[cond] }))
      .filter(({ radius }) => radius > 0)
      .sort((a, b) => b.radius - a.radius);

    const features: GeoJSON.Feature[] = [];

    const buildFeature = (cond: AmbientCondition, radius: number, active: boolean) => {
      const circle = listeningRingFeature(
        LISTENER_COORDINATE[0],
        LISTENER_COORDINATE[1],
        radius,
      );
      const clipped = difference(
        featureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>([circle, landMask]),
      );
      if (clipped) {
        clipped.properties = { condition: cond, active, color: activeColor };
        features.push(clipped);
      }
    };

    if (activeEntry.radius > 0) {
      buildFeature(activeEntry.cond, activeEntry.radius, true);
    }
    for (const { cond, radius } of inactiveEntries) {
      buildFeature(cond, radius, false);
    }

    geoSrc.setData({ type: "FeatureCollection", features });

    // Position source marker along the listener-to-endpoint line at the
    // winter (Wind & Waves) distance, capped at SOURCE_ENDPOINT.
    const winterDist = detection.winter;
    const maxLineDist = approxDistanceKm(LISTENER_COORDINATE, SOURCE_ENDPOINT);
    const sourceDist = Math.min(winterDist, maxLineDist);
    sourceMarkerRef.current?.setLngLat(
      winterDist > 0
        ? interpolatePoint(LISTENER_COORDINATE, SOURCE_ENDPOINT, winterDist)
        : LISTENER_COORDINATE,
    );

    const activeRange = detection[state.oceanCondition];
    setAudibility(sourceDist <= activeRange ? "audible" : "not-audible");
  };

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
      .setLngLat(LISTENER_COORDINATE)
      .addTo(map);

    const sourceMarker = createParticipantMarkerEl(SOURCE_STROKE);
    sourceImgRef.current = sourceMarker.img;
    sourceMarkerRef.current = new maplibregl.Marker({
      element: sourceMarker.el,
      anchor: "center",
    })
      .setLngLat(SOURCE_ENDPOINT)
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
          "fill-color": ["get", "color"] as any,
          "fill-opacity": [
            "case", ["get", "active"], 0.25, 0.08,
          ] as any,
        },
      });

      map.addLayer({
        id: RING_LINE_LAYER_ID,
        type: "line",
        source: RING_SOURCE_ID,
        paint: {
          "line-color": ["get", "color"] as any,
          "line-width": [
            "case", ["get", "active"], 2.5, 1,
          ] as any,
          "line-opacity": [
            "case", ["get", "active"], 0.9, 0.3,
          ] as any,
        },
      });

      updateRings();
      map.resize();
    });

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

  useEffect(() => {
    if (listenerImgRef.current) {
      listenerImgRef.current.src = listener.icon;
    }
    if (sourceImgRef.current) {
      sourceImgRef.current.src = source.icon;
    }
    updateRings();
  }, [listener.id, listener.icon, source.id, source.icon, oceanCondition]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoadedRef.current) return;
    const sourceLngLat = sourceMarkerRef.current?.getLngLat();
    if (!sourceLngLat) return;
    const bounds = new maplibregl.LngLatBounds()
      .extend(LISTENER_COORDINATE)
      .extend([sourceLngLat.lng, sourceLngLat.lat]);
    map.fitBounds(bounds, { padding: 60, duration: 1500 });
  }, [source.id]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden bg-black/40"
      style={{ width: "100%", height: "100%" }}
    >
      {mobileToggle && (
        <div className="absolute top-3 left-3 z-10">{mobileToggle}</div>
      )}
      {audibility && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-white/90 backdrop-blur-sm"
          style={{ background: "rgba(0, 0, 0, 0.45)" }}
        >
          {audibility === "audible" ? "Audible" : "Not Audible"}
        </div>
      )}
    </div>
  );
}
