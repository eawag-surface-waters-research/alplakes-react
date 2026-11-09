import { setWorkerUrl } from "maplibre-gl";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";
// eslint-disable-next-line import/no-webpack-loader-syntax
import maplibreWorkerUrl from "!!file-loader?esModule=false&name=static/js/[name].[contenthash:8].[ext]!maplibre-gl/dist/maplibre-gl-csp-worker.js";

// MapLibre's built-in worker is created from the source of a function in its
// bundle. In production builds Babel moves helpers out of that function, so the
// worker crashes with "ReferenceError: y is not defined" and no tiles render.
// The prebuilt worker file bypasses Babel.
setWorkerUrl(maplibreWorkerUrl);

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

// Without WebGL there is no basemap, so this returns null
export const addBasemap = (map, dark, language, variant) => {
  if (!supportsWebGL()) {
    console.warn("Basemap: WebGL is not supported, no basemap shown");
    return null;
  }
  return maplibreGL({
    style: basemapStyle(dark, language, variant),
  }).addTo(map);
};

export const updateBasemap = (layer, dark, language, variant) => {
  const glMap = layer && layer.getMaplibreMap();
  if (glMap) glMap.setStyle(basemapStyle(dark, language, variant));
};
