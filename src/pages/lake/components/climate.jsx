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
      xlabel: "",
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

  render() {
    var { language, dark, parameters } = this.props;
    var { display, model } = this.state;
    return (
      <div className="climate" ref={this.ref}>
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
                <div className="description">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book.
                </div>
                <Expand
                  openLabel="Settings"
                  closeLabel="Hide settings"
                  content={
                    <React.Fragment>
                      <div className="setting">
                        <div className="label">Simulation</div>
                        <select value={model} onChange={this.setModel}>
                          {Object.keys(parameters).map((p) => (
                            <option value={p} key={p}>
                              {parameters[p].name} (
                              {capitalize(parameters[p].model)})
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
