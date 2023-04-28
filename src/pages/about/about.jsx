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
          <div className="text">
            <div className="title">About</div>
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
            <div className="repo">
              Simulations:{" "}
              <a href="https://github.com/eawag-surface-waters-research/alplakes-simulations">
                Delft3D
              </a>
            </div>
            <div className="repo">
              Orchestrator:{" "}
              <a href="https://github.com/eawag-surface-waters-research/airflow">
                Airflow
              </a>
            </div>
            <div className="repo">
              API:{" "}
              <a href="https://github.com/eawag-surface-waters-research/alplakes-fastapi">
                FastAPI
              </a>
            </div>
            <div className="repo">
              Front end:{" "}
              <a href="https://github.com/eawag-surface-waters-research/alplakes-react">
                React
              </a>
            </div>
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
