import L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";
import CONFIG from "../../config.json";

// "detail" adds villages and major roads when zoomed in
const variants = {
  default: {
    detail: true,
    rivers: {
      color: (dark) => (dark ? "#2b3a47" : "#bcd3e0"),
      width: {
        low: { river: 0.5, other: 0.4 },
        high: { river: 1.5, other: 1 },
      },
    },
  },
  home: {
    detail: false,
    rivers: {
      color: (dark) => (dark ? "#45647b" : "#9ec2d6"),
      width: {
        low: { river: 0.75, other: 0.5 },
        high: { river: 2, other: 1.25 },
      },
    },
  },
};

// MapLibre zoom levels are one below Leaflet's, so 10 here is Leaflet zoom 11
const DETAIL_MIN_ZOOM = 10;
const TERRAIN_FAILURES_BEFORE_FALLBACK = 3;

const placeLabelLayout = (language, textSize) => ({
  "text-field": [
    "coalesce",
    ["get", `name:${language.toLowerCase()}`],
    ["get", "name"],
  ],
  "text-font": ["Noto Sans Regular"],
  "text-size": textSize,
});

const placeLabelPaint = (dark) => ({
  "text-color": dark ? "#aab0b8" : "#555b61",
  "text-halo-color": dark ? "#1c1f24" : "#f2f2ee",
  "text-halo-width": 1.2,
});

const roadLayers = (dark) => [
  {
    id: "major-roads",
    type: "line",
    source: "openfreemap",
    "source-layer": "transportation",
    minzoom: DETAIL_MIN_ZOOM,
    filter: [
      "all",
      ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]],
      ["!=", ["get", "brunnel"], "tunnel"],
    ],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": dark ? "#3a3f47" : "#d8d5cd",
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 16, 2],
    },
  },
];

// Placed below the city and town labels so that those win any collisions
const villageLayers = (dark, language) => [
  {
    id: "village-labels",
    type: "symbol",
    source: "openfreemap",
    "source-layer": "place",
    minzoom: DETAIL_MIN_ZOOM,
    filter: ["==", ["get", "class"], "village"],
    layout: placeLabelLayout(language, [
      "interpolate",
      ["linear"],
      ["zoom"],
      10,
      10,
      16,
      13,
    ]),
    paint: placeLabelPaint(dark),
  },
];

const basemapStyle = (dark, language, variant = "default") => ({
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    terrain: {
      type: "raster-dem",
      tiles: ["https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"],
      encoding: "terrarium",
      tileSize: 512,
      maxzoom: 16,
      attribution:
        '<a href="https://mapterhorn.com/attribution">&copy; Mapterhorn</a>',
    },
    openfreemap: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
      attribution:
        '<a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": dark ? "#1c1f24" : "#f2f2ee" },
    },
    {
      id: "hillshade",
      type: "hillshade",
      source: "terrain",
      paint: {
        "hillshade-shadow-color": dark ? "#000000" : "#8a8f94",
        "hillshade-highlight-color": dark ? "#4a505a" : "#ffffff",
      },
    },
    {
      id: "water",
      type: "fill",
      source: "openfreemap",
      "source-layer": "water",
      paint: { "fill-color": dark ? "#2b3a47" : "#bcd3e0" },
    },
    {
      id: "waterway",
      type: "line",
      source: "openfreemap",
      "source-layer": "waterway",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": variants[variant].rivers.color(dark),
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          6,
          [
            "match",
            ["get", "class"],
            "river",
            variants[variant].rivers.width.low.river,
            variants[variant].rivers.width.low.other,
          ],
          12,
          [
            "match",
            ["get", "class"],
            "river",
            variants[variant].rivers.width.high.river,
            variants[variant].rivers.width.high.other,
          ],
        ],
      },
    },
    ...(variants[variant].detail ? roadLayers(dark) : []),
    {
      id: "country-borders",
      type: "line",
      source: "openfreemap",
      "source-layer": "boundary",
      filter: [
        "all",
        ["==", ["get", "admin_level"], 2],
        ["!=", ["get", "maritime"], 1],
      ],
      layout: { "line-join": "round" },
      paint: {
        "line-color": dark ? "#6a7078" : "#8f9499",
        "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.75, 12, 1.25],
        "line-dasharray": [3, 2],
      },
    },
    ...(variants[variant].detail ? villageLayers(dark, language) : []),
    {
      id: "place-labels",
      type: "symbol",
      source: "openfreemap",
      "source-layer": "place",
      filter: ["in", ["get", "class"], ["literal", ["city", "town"]]],
      layout: placeLabelLayout(language, [
        "interpolate",
        ["linear"],
        ["zoom"],
        6,
        10,
        12,
        14,
      ]),
      paint: placeLabelPaint(dark),
    },
  ],
});

let webGLSupported;
const supportsWebGL = () => {
  if (webGLSupported === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webGLSupported = !!(
        canvas.getContext("webgl2") || canvas.getContext("webgl")
      );
    } catch (e) {
      webGLSupported = false;
    }
  }
  return webGLSupported;
};

const fallbackUrl = (dark) => {
  const { url, lightMap, darkMap } = CONFIG.basemaps.fallback;
  return url.replace("_bright_", dark ? darkMap : lightMap);
};

// Plain Leaflet tiles, used when the MapLibre basemap can't be shown
const showFallback = (basemap) => {
  const { map, layer, dark } = basemap;
  if (layer) {
    if (!map.hasLayer(layer)) return; // The map has since been removed
    // Leaflet can't clear this itself, as the layer has no style once removed
    const attribution = layer.getAttribution();
    map.removeLayer(layer);
    if (map.attributionControl) {
      map.attributionControl.removeAttribution(attribution);
    }
    basemap.layer = null;
  }
  basemap.fallback = L.tileLayer(fallbackUrl(dark), {
    maxZoom: 19,
    attribution: CONFIG.basemaps.fallback.attribution,
    className: "basemap-fallback",
    zIndex: 0, // Keeps it below data overlays, which are also tile layers
  }).addTo(map);
};

// Missing tiles (404s) raise no error, so this only counts real failures. Once
// any elevation tile has loaded, later failures are treated as temporary.
const watchTerrain = (basemap) => {
  const glMap = basemap.layer.getMaplibreMap();
  let loaded = false;
  let failures = 0;
  glMap.on("sourcedata", (e) => {
    if (e.sourceId === "terrain" && e.tile) loaded = true;
  });
  glMap.on("error", (e) => {
    console.error(e.error); // MapLibre stops logging once there is a listener
    if (e.sourceId !== "terrain" || loaded) return;
    failures += 1;
    if (failures === TERRAIN_FAILURES_BEFORE_FALLBACK) {
      // Deferred so the MapLibre map isn't removed while it's firing this event
      console.warn("Basemap: elevation tiles failed, using fallback tiles");
      setTimeout(() => showFallback(basemap));
    }
  });
};

export const addBasemap = (map, dark, language, variant) => {
  const basemap = { map, dark, layer: null, fallback: null };
  if (!supportsWebGL()) {
    showFallback(basemap);
    return basemap;
  }
  basemap.layer = maplibreGL({
    style: basemapStyle(dark, language, variant),
  }).addTo(map);
  watchTerrain(basemap);
  return basemap;
};

export const updateBasemap = (basemap, dark, language, variant) => {
  basemap.dark = dark;
  if (basemap.fallback) basemap.fallback.setUrl(fallbackUrl(dark));
  const glMap = basemap.layer && basemap.layer.getMaplibreMap();
  if (glMap) glMap.setStyle(basemapStyle(dark, language, variant));
};
