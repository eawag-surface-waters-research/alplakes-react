import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";
import eawag_logo from "../../img/eawag_logo.png";
import esa_logo from "../../img/esa_logo.png";
import trento_logo from "../../img/trento_logo.png";
import "./about.css";

class About extends Component {
  render() {
    return (
      <div className="main">
        <NavBar {...this.props} />
        <div className="about">
          <div className="header">
            Monitoring and forecasting of lakes across the European alpine
            region.
          </div>
          <div className="text">
            <p>
              Alplakes is an open-source{" "}
              <a href="https://eo4society.esa.int/projects/alplakes/">esa</a>{" "}
              funded research project aimed at providing operational products
              based on a combination of remote sensing and hydrodynamic models
              for a number of European lakes.
            </p>
            <p>
              The project is a collaboration between{" "}
              <a href="https://www.eawag.ch/">Eawag</a> and the{" "}
              <a href="https://www.unitn.it/">Università di Trento</a>.
            </p>
            <div className="sub-header">Hydrodynamic Models</div>

            <p>
              Model specifications, including the model and forcing data, can be
              found in the layer information tab for each lake. The model
              set-ups and calibrations can be found in the following{" "}
              <a href="https://github.com/eawag-surface-waters-research/alplakes-simulations">
                repository
              </a>{" "}
              The models are run using an Apache Airflow deployment, the source
              code can be accessed{" "}
              <a href="https://github.com/eawag-surface-waters-research/airflow">
                here
              </a>
              .
            </p>

            <div className="sub-header">Remote Sensing</div>

            <p>
              Remote sensing products are generated using{" "}
              <a href="https://github.com/eawag-surface-waters-research/sencast">
                Sencast
              </a>
              , a python toolbox that collates a number of methods for deriving
              water quality parameters from satellite data. Images from esa's
              Sentinel-3 are available daily at 300m resolution and Sentinel-2
              images are available every 5 days at 10m resolution.
            </p>

            <div className="sub-header">Website</div>
            <p>
              This website is developed using{" "}
              <a href="https://react.dev/">React</a> and the open source code is
              available{" "}
              <a href="https://github.com/eawag-surface-waters-research/alplakes-react">
                here
              </a>
              .
            </p>
          </div>
          <div className="images">
            <img src={eawag_logo} alt="Eawag" />
            <img src={esa_logo} alt="ESA" />
            <img src={trento_logo} alt="Trento" />
          </div>
        </div>
      </div>
    );
  }
}

export default About;
