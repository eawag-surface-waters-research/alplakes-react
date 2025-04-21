import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import CatchmentMap from "../../../components/leaflet/catchment";
import grow_icon from "../../../img/full.png";
import shrink_icon from "../../../img/shrink.png";

class LandCover extends Component {
  state = {
    hasBeenVisible: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
    polygon: false,
    fullscreen: false,
  };

  ref = createRef();

  updated = () => {
    this.setState({ updates: [] });
  };

  toggleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  extractPolygonFromGeoJSON = (geojson) => {
    if (
      geojson.type === "FeatureCollection" &&
      geojson.features &&
      geojson.features.length > 0
    ) {
      geojson = geojson.features[0];
    }
    if (geojson.type === "Feature" && geojson.geometry) {
      geojson = geojson.geometry;
    }
    if (
      geojson.type === "Polygon" &&
      geojson.coordinates &&
      geojson.coordinates.length > 0
    ) {
      return geojson.coordinates[0].map((coord) => [coord[1], coord[0]]);
    } else if (
      geojson.type === "MultiPolygon" &&
      geojson.coordinates &&
      geojson.coordinates.length > 0
    ) {
      return geojson.coordinates[0][0].map((coord) => [coord[1], coord[0]]);
    }
  };

  componentDidMount() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.state.hasBeenVisible) {
          this.setState({ hasBeenVisible: true }, this.onVisible);
          this.observer.disconnect();
        }
      },
      { threshold: 0.0 }
    );

    if (this.ref.current) {
      this.observer.observe(this.ref.current);
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onVisible = async () => {
    const { id } = this.props;
    var { data } = await axios.get(
      CONFIG.alplakes_bucket + `/static/catchments/${id}.json`
    );
    const polygon = this.extractPolygonFromGeoJSON(data);
    this.setState({ polygon });
  };

  render() {
    var { mapId, polygon, fullscreen } = this.state;
    var { dark, language, parameters } = this.props;
    const wmts = {
      url: "https://services.terrascope.be/wmts/v2",
      options: {
        layer: "WORLDCOVER_2021_MAP",
        tilematrixset: "EPSG:3857",
        format: "image/png",
        attribution: "© ESA WorldCover 2021, produced by VITO",
      },
    };
    const details = [
      {
        type: 10,
        name: {
          "EN": "Tree cover",
          "DE": "Baumbedeckung",
          "FR": "Couverture arborée",
          "IT": "Copertura arborea"
        },
        description:
          "This class includes any geographic area dominated by trees with a cover of 10% or more. Other land cover classes (shrubs and/or herbs in the understorey, built-up, permanent water bodies, …)  can be present below the canopy, even with a density higher than trees.\nAreas planted with trees for afforestation purposes and plantations (e.g. oil palm, olive trees) are included in this class. This class also includes tree covered areas seasonally or permanently flooded with\nfresh water except for mangroves.",
        rgb: "0,100,0",
      },
      {
        type: 20,
        name: {
          "EN": "Shrubland",
          "DE": "Buschland",
          "FR": "Arbustes",
          "IT": "Arbusti"
        },
        description:
          "This class includes any geographic area dominated by natural shrubs having a cover of 10% or more. Shrubs are defined as woody perennial plants with persistent and woody stems and without any defined main stem being less than 5 m tall. Trees can be present in scattered form if their cover is less than 10%. Herbaceous plants can also be present at any density. The shrub foliage can be either\nevergreen or deciduous.",
        rgb: "255,187,34",
      },
      {
        type: 30,
        name: {
          "EN": "Grassland",
          "DE": "Wiese",
          "FR": "Prairie",
          "IT": "Prateria"
        },
        description:
          "This class includes any geographic area dominated by natural herbaceous plants (Plants without persistent stem or shoots above ground and lacking definite firm structure): (grasslands, prairies, steppes, savannahs, pastures) with a cover of 10% or more, irrespective of different human and/or animal activities, such as: grazing, selective fire management etc. Woody plants (trees and/or shrubs) can be present assuming their cover is less than 10%. It may also contain uncultivated cropland areas (without harvest/ bare soil\nperiod) in the reference year",
        rgb: "255,255,76",
      },
      {
        type: 40,
        name: {
          "EN": "Cropland",
          "DE": "Ackerland",
          "FR": "Terres cultivées",
          "IT": "Terreno coltivabile"
        },
        description:
          "Land covered with annual cropland  that is sowed/planted and harvestable at least once within the 12 months after the sowing/planting date. The annual cropland produces an herbaceous cover and is sometimes combined with some tree or woody vegetation. Note that perennial woody crops will be classified as the appropriate tree cover or shrub land cover type. Greenhouses are\nconsidered as built-up.",
        rgb: "240,150,255",
      },
      {
        type: 50,
        name: {
          "EN": "Built-up",
          "DE": "Aufgebaut",
          "FR": "Construit",
          "IT": "Costruito"
        },
        description:
          "Land covered by buildings, roads and other man-made structures such as railroads. Buildings include both residential and industrial building. Urban green (parks,\nsport facilities) is not included in this class. Waste dump deposits\nand extraction sites are considered as bare.",
        rgb: "250,0,0",
      },
      {
        type: 60,
        name: {
          "EN": "Bare / sparse vegetation",
          "DE": "Kahle / spärliche Vegetation",
          "FR": "Végétation nue/éparse",
          "IT": "Vegetazione spoglia/rada"
        },
        description:
          "Lands with exposed soil, sand, or rocks and never has more than 10\n% vegetated cover during any time of the year",
        rgb: "180,180,180",
      },
      {
        type: 70,
        name: {
          "EN": "Snow and Ice",
          "DE": "Schnee und Eis",
          "FR": "Neige et glace",
          "IT": "Neve e ghiaccio"
        },
        description:
          "This class includes any geographic area covered by snow or glaciers persistently",
        rgb: "240,240,240",
      },
      {
        type: 80,
        name: {
          "EN": "Permanent water bodies",
          "DE": "Permanente Wasserkörper",
          "FR": "Plans d'eau permanents",
          "IT": "Corpi idrici permanenti"
        },
        description:
          "This class includes any geographic area covered for most of the year (more than 9 months) by water bodies: lakes, reservoirs, and rivers. Can be either fresh or salt-water bodies. In some cases the water\ncan be frozen for part of the year (less than 9 months).",
        rgb: "0,100,200",
      },
      {
        type: 90,
        name: {
          "EN": "Herbaceous wetland",
          "DE": "Krautiges Feuchtgebiet",
          "FR": "Zone humide herbacée",
          "IT": "Zona umida erbacea"
        },
        description:
          "Land dominated by natural herbaceous vegetation (cover of 10% or more) that is permanently or regularly flooded by fresh, brackish or salt water.  It excludes unvegetated sediment (see 60), swamp\nforests (classified as tree cover) and mangroves see 95)",
        rgb: "0,150,160",
      },
      {
        type: 95,
        name: {
          "EN": "Mangroves",
          "DE": "Mangroven",
          "FR": "Mangroves",
          "IT": "Mangrovie"
        },
        description:
          'Taxonomically diverse, salt-tolerant tree and other plant species which thrive in intertidal zones of sheltered tropical shores, "overwash" islands, and estuaries.',
        rgb: "0,207,117",
      },
      {
        type: 100,
        name: {
          "EN": "Moss and lichen",
          "DE": "Moos und Flechten",
          "FR": "Mousse et lichen",
          "IT": "Muschio e licheni"
        },
        description:
          "Land covered with lichens and/or mosses. Lichens are composite organisms formed from the  symbiotic association of fungi and algae. Mosses contain photo-autotrophic land  plants without true\nleaves, stems, roots but with leaf-and stemlike organs.",
        rgb: "250,230,160",
      },
    ];
    const lookup = details.reduce((acc, dict) => {
      acc[dict.rgb + ",255"] = dict.name[language];
      return acc;
    }, {});
    return (
      <div className="landcover subsection" ref={this.ref}>
        <h3>
          {Translations.landcover[language]}
          <Information information={Translations.landcoverText[language]} />
        </h3>
        <div className="map-sidebar">
          <div
            className={
              fullscreen ? "map-sidebar-left fullscreen" : "map-sidebar-left"
            }
          >
            {polygon && (
              <CatchmentMap
                dark={dark}
                mapId={mapId}
                polygon={polygon}
                wmts_url={wmts.url}
                options={wmts.options}
                lookup={lookup}
              />
            )}
            <div
              className="toggle-fullscreen"
              onClick={this.toggleFullscreen}
              title={
                fullscreen
                  ? Translations.collapse[language]
                  : Translations.fullscreen[language]
              }
            >
              <img
                src={fullscreen ? shrink_icon : grow_icon}
                alt="Fullscreen"
              />
            </div>
          </div>
          <div className="map-sidebar-right">
            {Translations.landCoverDescription[language]}
            <div className="landcover-table">
              <table>
                <tbody>
                  <tr>
                    <th style={{ width: "50px" }}></th>
                    <th>{Translations.type[language]}</th>
                    <th>{Translations.coverage[language]}</th>
                    <th>{Translations.area[language]}</th>
                  </tr>

                  {parameters.map((p) => (
                    <tr
                      title={details.find((d) => d.type === p.type).description}
                      key={p.type}
                    >
                      <td
                        style={{
                          backgroundColor: `rgb(${
                            details.find((d) => d.type === p.type).rgb
                          })`,
                        }}
                      ></td>
                      <td>{details.find((d) => d.type === p.type).name[language]}</td>
                      <td>{p.percent}%</td>
                      <td>{p.area}km²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LandCover;
