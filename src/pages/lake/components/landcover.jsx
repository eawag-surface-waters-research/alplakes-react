import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import CatchmentMap from "../../../components/leaflet/catchment";

class LandCover extends Component {
  state = {
    hasBeenVisible: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
    polygon: false,
    wmts: {
      url: "https://services.terrascope.be/wmts/v2",
      options: {
        layer: "WORLDCOVER_2021_MAP",
        tilematrixset: "EPSG:3857",
        format: "image/png",
        attribution: "© ESA WorldCover 2021, produced by VITO",
      },
    },
  };

  ref = createRef();

  updated = () => {
    this.setState({ updates: [] });
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
    var { mapId, polygon, wmts } = this.state;
    var { dark, language, parameters } = this.props;
    var details = [
      {
        type: 10,
        name: "Tree cover",
        description:
          "This class includes any geographic area dominated by trees with a cover of 10% or more. Other land cover classes (shrubs and/or herbs in the understorey, built-up, permanent water bodies, …)  can be present below the canopy, even with a density higher than trees.\nAreas planted with trees for afforestation purposes and plantations (e.g. oil palm, olive trees) are included in this class. This class also includes tree covered areas seasonally or permanently flooded with\nfresh water except for mangroves.",
        hex: "#006300",
      },
      {
        type: 20,
        name: "Shrubland",
        description:
          "This class includes any geographic area dominated by natural shrubs having a cover of 10% or more. Shrubs are defined as woody perennial plants with persistent and woody stems and without any defined main stem being less than 5 m tall. Trees can be present in scattered form if their cover is less than 10%. Herbaceous plants can also be present at any density. The shrub foliage can be either\nevergreen or deciduous.",
        hex: "#ffba21",
      },
      {
        type: 30,
        name: "Grassland",
        description:
          "This class includes any geographic area dominated by natural herbaceous plants (Plants without persistent stem or shoots above ground and lacking definite firm structure): (grasslands, prairies, steppes, savannahs, pastures) with a cover of 10% or more, irrespective of different human and/or animal activities, such as: grazing, selective fire management etc. Woody plants (trees and/or shrubs) can be present assuming their cover is less than 10%. It may also contain uncultivated cropland areas (without harvest/ bare soil\nperiod) in the reference year",
        hex: "#ffff4b",
      },
      {
        type: 40,
        name: "Cropland",
        description:
          "Land covered with annual cropland  that is sowed/planted and harvestable at least once within the 12 months after the sowing/planting date. The annual cropland produces an herbaceous cover and is sometimes combined with some tree or woody vegetation. Note that perennial woody crops will be classified as the appropriate tree cover or shrub land cover type. Greenhouses are\nconsidered as built-up.",
        hex: "#ef95ff",
      },
      {
        type: 50,
        name: "Built-up",
        description:
          "Land covered by buildings, roads and other man-made structures such as railroads. Buildings include both residential and industrial building. Urban green (parks,\nsport facilities) is not included in this class. Waste dump deposits\nand extraction sites are considered as bare.",
        hex: "#f90000",
      },
      {
        type: 60,
        name: "Bare / sparse vegetation",
        description:
          "Lands with exposed soil, sand, or rocks and never has more than 10\n% vegetated cover during any time of the year",
        hex: "#b4b4b4",
      },
      {
        type: 70,
        name: "Snow and Ice",
        description:
          "This class includes any geographic area covered by snow or glaciers persistently",
        hex: "#efefef",
      },
      {
        type: 80,
        name: "Permanent water bodies",
        description:
          "This class includes any geographic area covered for most of the year (more than 9 months) by water bodies: lakes, reservoirs, and rivers. Can be either fresh or salt-water bodies. In some cases the water\ncan be frozen for part of the year (less than 9 months).",
        hex: "#0063c7",
      },
      {
        type: 90,
        name: "Herbaceous wetland",
        description:
          "Land dominated by natural herbaceous vegetation (cover of 10% or more) that is permanently or regularly flooded by fresh, brackish or salt water.  It excludes unvegetated sediment (see 60), swamp\nforests (classified as tree cover) and mangroves see 95)",
        hex: "#00959f",
      },
      {
        type: 95,
        name: "Mangroves",
        description:
          'Taxonomically diverse, salt-tolerant tree and other plant species which thrive in intertidal zones of sheltered tropical shores, "overwash" islands, and estuaries.',
        hex: "#00cf75",
      },
      {
        type: 100,
        name: "Moss and lichen",
        description:
          "Land covered with lichens and/or mosses. Lichens are composite organisms formed from the  symbiotic association of fungi and algae. Mosses contain photo-autotrophic land  plants without true\nleaves, stems, roots but with leaf-and stemlike organs.",
        hex: "#f9e69f",
      },
    ];
    return (
      <div className="landcover subsection" ref={this.ref}>
        <h3>
          {Translations.landcover[language]}
          <Information information={Translations.landcoverText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {polygon && (
              <CatchmentMap
                dark={dark}
                mapId={mapId}
                polygon={polygon}
                wmts={wmts}
              />
            )}
          </div>
          <div className="map-sidebar-right">
            Land cover for the catchment is extracted from the ESA WorldCover
            2020 Global land cover product at 10 m resolution for 2020 based on
            Sentinel-1 and 2 data.
            <table>
              <tbody>
                <tr>
                  <th style={{ width: "50px" }}></th>
                  <th>Type</th>
                  <th>Coverage</th>
                  <th>Area</th>
                </tr>

                {parameters.map((p) => (
                  <tr
                    title={details.find((d) => d.type === p.type).description}
                    key={p.type}
                  >
                    <td
                      style={{
                        backgroundColor: details.find((d) => d.type === p.type)
                          .hex,
                      }}
                    ></td>
                    <td>{details.find((d) => d.type === p.type).name}</td>
                    <td>{p.percent}%</td>
                    <td>{p.area}km²</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default LandCover;
