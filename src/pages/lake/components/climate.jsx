import React, { Component, createRef } from "react";
import { downloadClimate } from "../functions/download";
import { capitalize } from "../functions/general";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import DatasetLinegraph from "../../../components/d3/dataset/datasetlinegraph";
import Loading from "../../../components/loading/loading";
import Expand from "../../../components/expand/expand";

class ClimateLegend extends Component {
  render() {
    return (
      <div className="graph-legend">
        <div className="item">
          <div className="line" style={{ borderColor: "green" }}></div>
          <div className="text">RCP 2.6</div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "orange" }}></div>
          <div className="text">RCP 4.5</div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "red" }}></div>
          <div className="text">RCP 8.5</div>
        </div>
      </div>
    );
  }
}

class Climate extends Component {
  state = {
    hasBeenVisible: false,
    model: "",
    display: false,
    data: false,
    depth: "surface",
    depths: ["surface", "bottom"],
  };

  ref = createRef();

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
    const { parameters, language } = this.props;
    const { depth } = this.state;
    const model = Object.keys(parameters)[0];
    const data = await downloadClimate(parameters[model].key);
    const display = {
      xlabel: Translations.year[language],
      xunits: "",
      ylabel: Translations["temperature"][language],
      yunits: "°C",
      data: data[depth],
    };
    this.setState({
      model,
      data,
      display,
    });
  };

  setModel = async (event) => {
    const { parameters } = this.props;
    const { depth, display } = this.state;
    const model = event.target.value;
    const data = await downloadClimate(parameters[model].key);
    display.data = data[depth];
    this.setState({
      model,
      data,
      display,
    });
  };

  setDepth = (event) => {
    const { data, display } = this.state;
    const depth = event.target.value;
    display.data = data[depth];
    this.setState({
      display,
      depth,
    });
  };

  render() {
    var { language, dark, parameters } = this.props;
    var { display, model, depth, depths } = this.state;
    const url1 =
      "https://www.nccs.admin.ch/nccs/en/home/climate-change-and-impacts/swiss-climate-change-scenarios/understanding-climate-change-scenarios.html";
    const url2 =
      "https://opendata.eawag.ch/dataset/the-vulnerability-of-lakes-along-an-altitudinal-gradient-to-climate-change";
    const description = {
      EN: (
        <div className="description">
          Predicted lake temperature from 1980 to 2100 under three climate
          scenarios (RCP 2.6, 4.5, 8.5). For more about the scenarios see{" "}
          <a href={url1} target="_blank" rel="noopener noreferrer">
            here
          </a>{" "}
          and for more details about the project see{" "}
          <a href={url2} target="_blank" rel="noopener noreferrer">
            here
          </a>
          .
        </div>
      ),
      DE: (
        <div className="description">
          Vorhersage der Seetemperatur von 1980 bis 2100 unter drei
          Klimaszenarien (RCP 2.6, 4.5, 8.5). Weitere Informationen über die
          Szenarien finden Sie{" "}
          <a href={url1} target="_blank" rel="noopener noreferrer">
            hier
          </a>{" "}
          und weitere Einzelheiten über das Projekt
          <a href={url2} target="_blank" rel="noopener noreferrer">
            hier
          </a>
          .
        </div>
      ),
      FR: (
        <div className="description">
          Prévision de la température des lacs de 1980 à 2100 selon trois
          scénarios climatiques (RCP 2.6, 4.5, 8.5). Pour plus d'informations
          sur les scénarios, voir{" "}
          <a href={url1} target="_blank" rel="noopener noreferrer">
            ici
          </a>{" "}
          et pour plus de détails sur le projet, voir{" "}
          <a href={url2} target="_blank" rel="noopener noreferrer">
            ici
          </a>
          .
        </div>
      ),
      IT: (
        <div className="description">
          Previsione della temperatura del lago dal 1980 al 2100 in base a tre
          scenari climatici (RCP 2.6, 4.5, 8.5). Per maggiori informazioni sugli
          scenari si veda{" "}
          <a href={url1} target="_blank" rel="noopener noreferrer">
            qui
          </a>{" "}
          e per maggiori dettagli sul progetto si veda{" "}
          <a href={url2} target="_blank" rel="noopener noreferrer">
            qui
          </a>
          .
        </div>
      ),
    };
    return (
      <div className="climate subsection" ref={this.ref}>
        <h3>
          {Translations.climate[language]}
          <Information information={Translations.climateText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {display ? (
              <div className="line-graph-container">
                <DatasetLinegraph
                  {...display}
                  dark={dark}
                  language={language}
                />
                <ClimateLegend language={language} />
              </div>
            ) : (
              <div className="loading-graph">
                <Loading />
              </div>
            )}
          </div>
          <div className="map-sidebar-right">
            {model && (
              <div className="graph-properties">
                {description[language]}
                <Expand
                  openLabel={Translations.settings[language]}
                  closeLabel={Translations.hideSettings[language]}
                  content={
                    <React.Fragment>
                      <div className="setting">
                        <div className="label">
                          {Translations.simulation[language]}
                        </div>
                        <select value={model} onChange={this.setModel}>
                          {Object.keys(parameters).map((p) => (
                            <option value={p} key={p}>
                              {parameters[p].name} (
                              {capitalize(parameters[p].model)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="setting">
                        <div className="label">
                          {Translations.depth[language]}
                        </div>
                        <select value={depth} onChange={this.setDepth}>
                          {depths.map((p) => (
                            <option value={p} key={p}>
                              {capitalize(p)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </React.Fragment>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Climate;
