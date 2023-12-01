import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";
import eawag_logo from "../../img/eawag_logo.png";
import esa_logo from "../../img/esa_logo.png";
import trento_logo from "../../img/trento_logo.png";
import "./about.css";

class About extends Component {
  render() {
    document.title = "About | Alplakes"
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
              for a number of European lakes. The project is a collaboration
              between <a href="https://www.eawag.ch/">Eawag</a>,{" "}
              <a href="https://www.unitn.it/">Università di Trento</a> and CNR.
              Alplakes is a follow up of a former ESA project (Meteolakes) led
              by Damien Bouffard and developed by Theo Baracchini.
            </p>
            <div className="sub-header">Hydrodynamic Models</div>

            <p>
              Model specifications, including the model and forcing data, can be
              found in the layer information tab for each lake. The model
              set-ups and calibrations can be found in the following{" "}
              <a href="https://github.com/eawag-surface-waters-research/alplakes-simulations">
                repository
              </a>.{" "}
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
          <div className="sub-header">Version</div>
          <p>2023-09 Official release of the version v1.0</p>
          <div className="sub-header">Present Core Team (current year)</div>
          <p>
            <table>
              <tbody>
                <tr>
                  <td>Marina Amadori</td>
                  <td>
                    Hydrodynamic and remote sensing expert, CNR-IREA and
                    University of Trento
                  </td>
                </tr>
                <tr>
                  <td>Damien Bouffard</td>
                  <td>
                    Hydrodynamic expert, Eawag and University of Lausanne.
                    Hydrodynamic lead. Main PI
                  </td>
                </tr>
                <tr>
                  <td>Mariano Brescani</td>
                  <td>Remote sensing expert, CNR-IREA</td>
                </tr>
                <tr>
                  <td>Claudia Giardino</td>
                  <td>Remote sensing expert, CNR-IREA</td>
                </tr>
                <tr>
                  <td>Abolfazl Irani Rahaghi</td>
                  <td>
                    Hydrodynamic and remote sensing expert, Eawag, Now at Uni.
                    Zurich
                  </td>
                </tr>
                <tr>
                  <td>Daniel Odermatt</td>
                  <td>Remote sensing expert, Eawag, Remote sensing lead</td>
                </tr>
                <tr>
                  <td>James Runnalls</td>
                  <td>Software developer, Eawag, workflow lead</td>
                </tr>
                <tr>
                  <td>Marco Toffolon</td>
                  <td>Hydrodynamic expert, University of Trento</td>
                </tr>
                <tr>
                  <td>Mortimer Werther</td>
                  <td>Remote sensing expert, Eawag, since 2023</td>
                </tr>
              </tbody>
            </table>
          </p>
          <div className="sub-header">ESA Officers</div>
          <p>
            <table>
              <tbody>
                <tr>
                  <td>Javier Alonso Concha</td>
                  <td>since 2023</td>
                </tr>
                <tr>
                  <td>Espen Volden</td>
                  <td>since 2022</td>
                </tr>
              </tbody>
            </table>
          </p>
          <div className="sub-header">Collaborators</div>
          <p>
            <table>
              <tbody>
                <tr>
                  <td>Fabian Bärenbold</td>
                  <td>Hydrodynamic expert, Eawag</td>
                </tr>
              </tbody>
            </table>
          </p>
          <div className="sub-header">Former team member</div>
          <p>
            <table>
              <tbody>
                <tr>
                  <td>Theo Baracchini</td>
                  <td>former developer of Meteolakes, now at CREALP</td>
                </tr>
                <tr>
                  <td>Steven Delwart</td>
                  <td>former ESA Officer</td>
                </tr>
              </tbody>
            </table>
          </p>
          <p>
            <b>
              Wants to include another lake? Wants to collaborate? Please
              contact us Damien.Bouffard@eawag.ch or James.Runnalls@eawag.ch
            </b>
          </p>
          <div className="sub-header">Model development</div>
          <p>
            Safin, A., Bouffard, D., Ozdemir, F., Ramón, C. L., Runnalls, J.,
            Georgatos, F., ... & Šukys, J. (2022). A Bayesian data assimilation
            framework for lake 3D hydrodynamic models with a physics-preserving
            particle filtering method using SPUX-MITgcm v1. Geoscientific Model
            Development, 15(20), 7715-7730.
          </p>
          <p>
            Li, C., Odermatt, D., Bouffard, D., Wüest, A., & Kohn, T. (2022).
            Coupling remote sensing and particle tracking to estimate
            trajectories in large water bodies. International Journal of Applied
            Earth Observation and Geoinformation, 110, 102809.
          </p>
          <p>
            Baracchini, T., Hummel, S., Verlaan, M., Cimatoribus, A., Wüest, A.,
            & Bouffard, D. (2020). An automated calibration framework and open
            source tools for 3D lake hydrodynamic models. Environmental
            Modelling & Software, 134, 104787
          </p>
          <p>
            Baracchini, T., Wüest, A., & Bouffard, D. (2020). Meteolakes: An
            operational online three-dimensional forecasting platform for lake
            hydrodynamics. Water research, 172, 115529.
          </p>
          <p>
            Baracchini, T., Chu, P. Y., Šukys, J., Lieberherr, G., Wunderle, S.,
            Wüest, A., & Bouffard, D. (2020). Data assimilation of in situ and
            satellite remote sensing data to 3D hydrodynamic lake models: a case
            study using Delft3D-FLOW v4. 03 and OpenDA v2. 4. Geoscientific
            Model Development, 13(3), 1267-1284.
          </p>
          <div className="sub-header">Remote sensing development</div>
          <p>
            Sepúlveda Steiner, O., Forrest, A. L., McInerney, J. B., Fernández
            Castro, B., Lavanchy, S., Wüest, A., & Bouffard, D. (2023). Spatial
            variability of turbulent mixing from an underwater glider in a
            large, deep, stratified lake. Journal of Geophysical Research:
            Oceans, 128(6), e2022JC018913.
          </p>
          <p>
            Perolo, P., Fernández Castro, B., Escoffier, N., Lambert, T.,
            Bouffard, D., & Perga, M. E. (2021). Accounting for surface waves
            improves gas flux estimation at high wind speed in a large
            lake. Earth System Dynamics, 12(4), 1169-1189.
          </p>
          <p>
            Råman Vinnå, L., Bouffard, D., Wüest, A., Girardclos, S., & Dubois,
            N. (2020). Assessing subaquatic mass movement hazards: an integrated
            observational and hydrodynamic modelling approach. Water Resources
            Management, 34(13), 4133-4146.
          </p>
          <p>
            Nouchi, V., Kutser, T., Wüest, A., Müller, B., Odermatt, D.,
            Baracchini, T., & Bouffard, D. (2019). Resolving biogeochemical
            processes in lakes using remote sensing. Aquatic Sciences, 81, 1-13.
          </p>
          <p>
            Soomets, T., Kutser, T., Wüest, A., & Bouffard, D. (2019). Spatial
            and temporal changes of primary production in a deep peri-alpine
            lake. Inland Waters, 9(1), 49-60.
          </p>
          <p>
            Baracchini, T., Bärenzung, K., Bouffard, D., & Wüest, A. J. (2019).
            Le Lac de Zurich en Ligne-Prévisions hydrodynamiques 3D en
            temps-réel sur meteolakes. ch. Aqua & Gas-Fachzeitschrift für Gas,
            Wasser und Abwasser. Aqua & Gas, 12, 24-29.
          </p>
          <p>
            Bouffard, D., Kiefer, I., Wüest, A., Wunderle, S., & Odermatt, D.
            (2018). Are surface temperature and chlorophyll in a large deep lake
            related? An analysis based on satellite observations in synergy with
            hydrodynamic modelling and in-situ data. Remote sensing of
            environment, 209, 510-523.
          </p>
          <p>
            Råman Vinnå, L., Wüest, A., & Bouffard, D. (2017). Physical effects
            of thermal pollution in lakes. Water Resources Research, 53(5),
            3968-3987.
          </p>
          <div className="sub-header">Related projects</div>
          <table>
            <tbody>
              <tr>
                <td>1D Swiss lakes models</td>
                <td>https://simstrat.eawag.ch</td>
              </tr>
              <tr>
                <td>Datalakes</td>
                <td>https://www.datalakes-eawag.ch</td>
              </tr>
            </tbody>
          </table>
          <div className="sub-header">Licence</div>
          <p>
            We encourage the use of our products. Please do not hesitate to
            contact us in case a collaboration will benefit your research.
          </p>
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
