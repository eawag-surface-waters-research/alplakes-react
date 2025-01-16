import React, { Component } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import CONFIG from "../../config.json";
import Translations from "../../translations.json";
import "./lake.css";
import ThreeDModel from "./components/threedmodel";
import OneDModel from "./components/onedmodel";
import Satellite from "./components/satellite";
import sortIcon from "../../img/sort.png";
import WaterTemperature from "./components/watertemperature";
import Scientific from "./components/scientific";
import Parameters from "./components/parameters";
import Bathymetry from "./components/bathymetry";

class NotFound extends Component {
  render() {
    var { id, text } = this.props;
    return (
      <div className="not-found">
        {text && (
          <div className="inner">
            Sorry the lake <div className="title">"{id}"</div> cannot be found.
          </div>
        )}
      </div>
    );
  }
}

class Lake extends Component {
  state = {
    id: "",
    metadata: {},
    error: false,
  };

  constructor(props) {
    super(props);
    this.divRef = React.createRef();
  }

  scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      window.scrollTo({
        top: sectionRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    const url = new URL(window.location.href);
    const id = url.pathname.replace(/[^a-zA-Z ]/g, "");
    try {
      var { data } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/${id}.json?timestamp=${
            Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
          }`
      );
      this.setState({
        id,
        metadata: data,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { metadata, error, id } = this.state;
    var { language, dark } = this.props;
    var title = "";
    var documentTitle = "Alplakes";
    if ("name" in metadata) {
      documentTitle = metadata.name[language] + " | Alplakes";
      title = metadata.name[language];
    }
    return (
      <div className="main">
        <Helmet>
          <title>{documentTitle}</title>
          <meta
            name="description"
            content="View the latest temperature forecast and water quality information."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        {error ? (
          <NotFound id={id} text={true} />
        ) : (
          <div className="lake">
            <div className="header">
              <h1>{title}</h1>
              <div
                className="properties-link"
                onClick={() => this.scrollToSection(this.divRef)}
              >
                {Translations.lakeProperties[language]}
                <img src={sortIcon} alt="Down" />
              </div>
            </div>
            {"forecast" in metadata && (
              <div className="section forecast">
                <h2>{Translations.forecast[language]}</h2>
                {"3d_model" in metadata["forecast"] && (
                  <ThreeDModel
                    parameters={metadata.forecast["3d_model"]}
                    language={language}
                    dark={dark}
                    bounds={metadata.properties.bounds}
                  />
                )}
                {"1d_model" in metadata["forecast"] && (
                  <OneDModel
                    parameters={metadata.forecast["3d_model"]}
                    language={language}
                  />
                )}
              </div>
            )}
            {"measurements" in metadata && (
              <div className="section measurements">
                <h2>{Translations.measurements[language]}</h2>
                {"water_temperature" in metadata["measurements"] && (
                  <WaterTemperature
                    parameters={metadata.measurements["water_temperature"]}
                    language={language}
                    dark={dark}
                    bounds={metadata.properties.bounds}
                  />
                )}
                {"scientific" in metadata["measurements"] && (
                  <Scientific
                    parameters={metadata.measurements["scientific"]}
                    language={language}
                    dark={dark}
                    bounds={metadata.properties.bounds}
                  />
                )}
              </div>
            )}
            {"satellite" in metadata && (
              <div className="section satellite">
                <h2>{Translations.satellite[language]}</h2>
                <div className="satellite-maps">
                  {metadata.satellite.map((p) => (
                    <Satellite
                      key={p.parameter}
                      parameters={p}
                      language={language}
                      dark={dark}
                      bounds={metadata.properties.bounds}
                    />
                  ))}
                </div>
              </div>
            )}
            {"trends" in metadata && (
              <div className="section trends">
                <h2>{Translations.trends[language]}</h2>
              </div>
            )}
            {"properties" in metadata && (
              <div className="section properties" ref={this.divRef}>
                <h2>{Translations.lakeProperties[language]}</h2>
                {"parameters" in metadata["properties"] && (
                  <Parameters
                    parameters={metadata.properties["parameters"]}
                    language={language}
                    dark={dark}
                    bounds={metadata.properties.bounds}
                  />
                )}
                {"bathymetry" in metadata["properties"] && (
                  <Bathymetry
                    parameters={metadata.properties["bathymetry"]}
                    language={language}
                    dark={dark}
                    bounds={metadata.properties.bounds}
                  />
                )}
              </div>
            )}
          </div>
        )}
        <Footer {...this.props} />
      </div>
    );
  }
}

export default Lake;
