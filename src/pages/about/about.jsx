import React, { Component } from "react";
import { Helmet } from "react-helmet";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import runnallja from "../../img/runnalja.jpg";
import bouffada from "../../img/bouffada.jpg";
import odermada from "../../img/odermada.jpg";
import schmidma from "../../img/schmidma.jpg";
import Translations from "../../translations.json";
import "./about.css";

class About extends Component {
  constructor(props) {
    super(props);
    this.contact = React.createRef();
    this.vision = React.createRef();
    this.projects = React.createRef();
    this.people = React.createRef();
    this.opensource = React.createRef();
    this.publications = React.createRef();
  }
  scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  render() {
    var { language } = this.props;
    return (
      <React.Fragment>
        <Helmet>
          <title>About | Alplakes</title>
          <meta
            name="description"
            content="Learn more about the Alplakes project and our partners."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="about">
          <div className="content">
            <h1>{Translations.about[language]}</h1>
            <p>
              Alplakes is a research initiative that provides accurate
              predictions of the condition of lakes throughout the European
              Alpine region.
            </p>
            <p>
              We integrate models and remote sensing products developed by the
              research community to provide the most up-to-date and accurate
              information possible.
            </p>
            <div ref={this.vision} className="section">
              <h2>Vision</h2>
              <p>
                This platform aims to transform how lakes are studied and
                monitored by providing a unified, user-friendly data
                visualization interface for citizens, water professionals, and
                scientists. This broader access to hydrodynamic modeling and
                remote sensing data not only accelerates scientific research but
                enables evidence-based decisions in water resource management.
                What once required specialized expertise is now accessible
                through a seamless, user-friendly platform that combines
                scientific rigor with practical utility.
              </p>
              <h3>Future development roadmap</h3>
              <h4>Expansion plans</h4>
              <ul>
                <li>Include additional Alpine lakes</li>
                <li>Expand remote sensing coverage to entire Alpine region</li>
                <li>
                  Integration of additional model types (MITgcm and Delft3D-FM
                  in testing)
                </li>
                <li>Implementation of on-demand high-resolution modeling</li>
              </ul>
              <h4>Enhanced features</h4>
              <ul>
                <li>
                  Development of physically-guided machine learning models
                </li>
                <li>Integration of specialized product solutions</li>
                <li>Advanced particle tracking capabilities</li>
                <li>Implementation of early warning systems</li>
                <li>Water quality module development</li>
              </ul>
            </div>
            <div ref={this.contact} className="section">
              <h2>Contact us</h2>
              <p>
                We encourage the use of our products. Please do not hesitate to
                contact us in case you have feedback or are interested in
                collaborating.
              </p>
              <div className="person">
                <img src={runnallja} alt="James" />
                <div className="name">James Runnalls</div>
                <div className="job">Software Engineer</div>
                <div className="email">james.runnalls@eawag.ch</div>
                <div className="contact-head">
                  {Translations["talk"][language]}
                </div>
                <div className="contact">Bug reports, new features</div>
              </div>
              <div className="person">
                <img src={bouffada} alt="Damien" />
                <div className="name">Damien Bouffard</div>
                <div className="job">Group Leader</div>
                <div className="email">damien.bouffard@eawag.ch</div>
                <div className="contact-head">
                  {Translations["talk"][language]}
                </div>
                <div className="contact">3D models, particle tracking</div>
              </div>
              <div className="person">
                <img src={odermada} alt="Dani" />
                <div className="name">Daniel Odermatt</div>
                <div className="job">Group Leader</div>
                <div className="email">daniel.odermatt@eawag.ch</div>
                <div className="contact-head">
                  {Translations["talk"][language]}
                </div>
                <div className="contact">Remote sensing products</div>
              </div>
              <div className="person" style={{ margin: 0 }}>
                <img src={schmidma} alt="Martin" />
                <div className="name">Martin Schmid</div>
                <div className="job">Group Leader</div>
                <div className="email">martin.schmid@eawag.ch</div>
                <div className="contact-head">
                  {Translations["talk"][language]}
                </div>
                <div className="contact">1D models</div>
              </div>
            </div>
            <div ref={this.projects} className="section">
              <h2>Contributing projects</h2>
              <p>
                The following projects have been fundamental to either
                developing the Alplakes platform or the models and products that
                it make available.
              </p>
              <h3>Alplakes</h3>
              <p>
                Alplakes is an open-source ESA funded research project aimed at
                providing operational products based on a combination of remote
                sensing and hydrodynamic models for a number of European lakes.
                The project is a collaboration between Eawag, Università di
                Trento and CNR. As part of this project 12 3D hydrodynamic
                models where built and calibrated, Sentinel 2 products were
                calibrated and the web platform was developed.
              </p>
              <div className="project-info">
                <a className="link" href="https://alplakes.eawag.ch">
                  https://alplakes.eawag.ch
                </a>
                <div className="parameter">
                  <div className="circle">
                    <span className="circle-text">$</span>
                  </div>
                  <div className="text">European Space Agency</div>
                </div>
                <div className="parameter">
                  <div className="circle">
                    <span className="circle-text">PI</span>
                  </div>
                  <div className="text">Damien Bouffard</div>
                </div>
              </div>

              <h3>Simstrat</h3>
              <p>
                Simstrat is a one-dimensional physical lake model for the
                simulation of stratification and mixing in deep stratified
                lakes. The model is under continuous development at Eawag. This
                project is developed jointly by the Aquatic Physics and Applied
                System Analysis groups in the Department Surface Waters -
                Research & Management (SURF).
              </p>
              <div className="project-info">
                <a
                  className="link"
                  href="https://github.com/Eawag-AppliedSystemAnalysis/Simstrat"
                >
                  https://github.com/Eawag-AppliedSystemAnalysis/Simstrat
                </a>
                <div className="parameter">
                  <div className="circle">
                    <span className="circle-text">$</span>
                  </div>
                  <div className="text">Eawag</div>
                </div>
                <div className="parameter">
                  <div className="circle">
                    <span className="circle-text">PI</span>
                  </div>
                  <div className="text">Martin Schmid</div>
                </div>
              </div>

              <h3>Sencast</h3>
              <p>
                Sencast is a toolbox to download and derive water quality
                parameters from satellite images. It acts as a framework for the
                use a variety of processors such as Idepix, Polymer, Sen2Cor and
                Acolite. It supports ESA satellites Sentinel 2 and Sentinel 3
                and USGS satellite Landsat 8. It is developed and maintained by
                the SURF Remote Sensing group at Eawag.
              </p>
              <div className="project-info">
                <a
                  className="link"
                  href="https://github.com/eawag-surface-waters-research/sencast"
                >
                  https://github.com/eawag-surface-waters-research/sencast
                </a>
                <div className="parameter">
                  <div className="circle">
                    <span className="circle-text">$</span>
                  </div>
                  <div className="text">Eawag</div>
                </div>
                <div className="parameter">
                  <div className="circle">
                    <span className="circle-text">PI</span>
                  </div>
                  <div className="text">Daniel Odermatt</div>
                </div>
              </div>

              <h3>Meteolakes</h3>
              <p>
                Meteolakes is a web application that shares some results of 3D
                coupled hydrodynamic-biological simulations performed daily with
                4.5 days forecasts for several Swiss lakes using real-time
                atmospheric, rivers and WWTPs data. Additionally it provides
                measurements from a field station and satellite observations
                downloaded in real-time. With direct impacts at scientific and
                community level, this combination also aims at assisting
                stakeholders in evidence-based decision-making and towards the
                sustainable management of our lakes. This product was developed
                by Theo Baracchini as part of his PhD thesis. It has been
                superceeded by the Alplakes platform.{" "}
              </p>
              <div className="project-info">
                <div className="parameter">
                  <div className="circle">
                    <span className="circle-text">$</span>
                  </div>
                  <div className="text">European Space Agency</div>
                </div>
                <div className="parameter">
                  <div className="circle">
                    <span className="circle-text">PI</span>
                  </div>
                  <div className="text">Damien Bouffard</div>
                </div>
              </div>
            </div>
            <div ref={this.people} className="section">
              <h2>Contributing people</h2>
              <h3>2024</h3>
              <p>
                Amadori Marina, Bärenbold Fabian, Bouffard Damien, Brescani
                Mariano , Giardino Claudia, Irani Rahaghi Abolfazl, Odermatt,
                Daniel, Runnalls James, Schmid Martin, Toffolon Marco, Werther
                Mortimer
              </p>
              <h3>2020 - 2023</h3>
              <p>
                Amadori Marina, Bärenbold Fabian, Bouffard Damien, Cruz Hugo,
                Irani Rahaghi Abolfazl, Odermatt, Daniel, Runnalls James, Schmid
                Martin, Šukys Jonas, Toffolon Marco, Werther Mortimer
              </p>
              <h3>2016 - 2019</h3>
              <p>
                Anneville Orlane, Baracchini Theo, Bouffard Damien, Gaudard
                Adrien, Schmid Martin, Soulignac Frédéric, Odermatt, Daniel
              </p>
            </div>
            <div ref={this.opensource} className="section">
              <h2>Open source</h2>
              <p>
                All the code and simulations that power Alplakes are made
                available for the community to use and contribute to.
              </p>
              <h3>3D Models</h3>
              <a
                className="repo"
                href="https://github.com/eawag-surface-waters-research/alplakes-simulations"
              >
                https://github.com/eawag-surface-waters-research/alplakes-simulations
              </a>
              <h3>1D Models</h3>
              <a
                className="repo"
                href="https://github.com/Eawag-AppliedSystemAnalysis/operational-simstrat"
              >
                https://github.com/Eawag-AppliedSystemAnalysis/operational-simstrat
              </a>
              <h3>Remote Sensing Products</h3>
              <a
                className="repo"
                href="https://github.com/eawag-surface-waters-research/sencast"
              >
                https://github.com/eawag-surface-waters-research/sencast
              </a>
              <h3>Alplakes</h3>
              <h4>Website</h4>
              <a
                className="repo"
                href="https://github.com/eawag-surface-waters-research/alplakes-react"
              >
                https://github.com/eawag-surface-waters-research/alplakes-react
              </a>
              <h4>API</h4>
              <a
                className="repo"
                href="https://github.com/eawag-surface-waters-research/alplakes-fastapi"
              >
                https://github.com/eawag-surface-waters-research/alplakes-fastapi
              </a>
              <h4>Orchestrator</h4>
              <a
                className="repo"
                href="https://github.com/eawag-surface-waters-research/airflow"
              >
                https://github.com/eawag-surface-waters-research/airflow
              </a>
            </div>
            <div ref={this.publications} className="section">
              <h2>Related publications</h2>
              <h3>Model development</h3>
              <p>
                Irani Rahaghi, A., Odermatt, D., Anneville, O., Sepúlveda
                Steiner, O., Reiss, R. S., Amadori, M., ... & Bouffard, D.
                (2024). Combined Earth observations reveal the sequence of
                conditions leading to a large algal bloom in Lake Geneva.
                Communications Earth & Environment, 5(1), 229.
                https://doi.org/10.1038/s43247-024-01351-5
              </p>
              <p>
                Tian, W., Zhang, Z., Bouffard, D., Wu, H., Xin, K., Gu, X., &
                Liao, Z. (2024). Enhancing interpretability and generalizability
                of deep learning-based emulator in three-dimensional lake
                hydrodynamics using Koopman operator and transfer learning:
                Demonstrated on the example of lake Zurich. Water Research, 249,
                120996. https://doi.org/10.1016/j.watres.2023.120996
              </p>
              <p>
                Safin, A., Bouffard, D., Ozdemir, F., Ramón, C. L., Runnalls,
                J., Georgatos, F., ... & Šukys, J. (2022). A Bayesian data
                assimilation framework for lake 3D hydrodynamic models with a
                physics-preserving particle filtering method using SPUX-MITgcm
                v1. Geoscientific Model Development, 15(20), 7715-7730.
                https://doi.org/10.5194/gmd-15-7715-2022
              </p>
              <p>
                Li, C., Odermatt, D., Bouffard, D., Wüest, A., & Kohn, T.
                (2022). Coupling remote sensing and particle tracking to
                estimate trajectories in large water bodies. International
                Journal of Applied Earth Observation and Geoinformation, 110,
                102809. https://doi.org/10.1016/j.jag.2022.102809
              </p>
              <p>
                Baracchini, T., Hummel, S., Verlaan, M., Cimatoribus, A., Wüest,
                A., & Bouffard, D. (2020). An automated calibration framework
                and open source tools for 3D lake hydrodynamic models.
                Environmental Modelling & Software, 134, 104787
                https://doi.org/10.1016/j.envsoft.2020.104787
              </p>
              <p>
                Baracchini, T., Wüest, A., & Bouffard, D. (2020). Meteolakes: An
                operational online three-dimensional forecasting platform for
                lake hydrodynamics. Water research, 172,
                115529.https://doi.org/10.1016/j.watres.2020.115529
              </p>
              <p>
                Baracchini, T., Chu, P. Y., Šukys, J., Lieberherr, G., Wunderle,
                S., Wüest, A., & Bouffard, D. (2020). Data assimilation of in
                situ and satellite remote sensing data to 3D hydrodynamic lake
                models: a case study using Delft3D-FLOW v4. 03 and OpenDA v2. 4.
                Geoscientific Model Development, 13(3), 1267-1284.
                https://doi.org/10.5194/gmd-13-1267-2020
              </p>
              <p>
                Gaudard, A., Råman Vinnå, L., Bärenbold, F., Schmid, M., &
                Bouffard, D. (2019). Toward an open access to high-frequency
                lake modeling and statistics data for scientists and
                practitioners–the case of Swiss lakes using Simstrat v2. 1.
                Geoscientific Model Development, 12(9), 3955-3974.
              </p>
              <p>
                Baracchini, T., Bärenzung, K., Bouffard, D., & Wüest, A. J.
                (2019). Le Lac de Zurich en Ligne-Prévisions hydrodynamiques 3D
                en temps-réel sur meteolakes. ch. Aqua & Gas-Fachzeitschrift für
                Gas, Wasser und Abwasser. Aqua & Gas, 12, 24-29.
              </p>
              <p>
                Goudsmit, G. H., Burchard, H., Peeters, F., & Wüest, A. (2002).
                Application of k‐ϵ turbulence models to enclosed basins: The
                role of internal seiches. Journal of Geophysical Research:
                Oceans, 107(C12), 23-1.
              </p>
              <h3>Remote sensing development</h3>
              <p>
                Soomets, T., Kutser, T., Wüest, A., & Bouffard, D. (2019).
                Spatial and temporal changes of primary production in a deep
                peri-alpine lake. Inland Waters, 9(1), 49-60.
                https://doi.org/10.1080/20442041.2018.1530529
              </p>
              <h3>Framework use</h3>
              <p>
                Sepúlveda Steiner, O., Forrest, A. L., McInerney, J. B.,
                Fernández Castro, B., Lavanchy, S., Wüest, A., & Bouffard, D.
                (2023). Spatial variability of turbulent mixing from an
                underwater glider in a large, deep, stratified lake. Journal of
                Geophysical Research: Oceans, 128(6), e2022JC018913.
                https://doi.org/10.1029/2022JC018913
              </p>
              <p>
                Perolo, P., Fernández Castro, B., Escoffier, N., Lambert, T.,
                Bouffard, D., & Perga, M. E. (2021). Accounting for surface
                waves improves gas flux estimation at high wind speed in a large
                lake. Earth System Dynamics, 12(4), 1169-1189.
                https://doi.org/10.5194/esd-12-1169-2021
              </p>
              <p>
                Råman Vinnå, L., Bouffard, D., Wüest, A., Girardclos, S., &
                Dubois, N. (2020). Assessing subaquatic mass movement hazards:
                an integrated observational and hydrodynamic modelling approach.
                Water Resources Management, 34(13), 4133-4146.
                https://doi.org/10.1007/s11269-020-02660-y
              </p>
              <p>
                Nouchi, V., Kutser, T., Wüest, A., Müller, B., Odermatt, D.,
                Baracchini, T., & Bouffard, D. (2019). Resolving biogeochemical
                processes in lakes using remote sensing. Aquatic Sciences, 81,
                1-13. https://doi.org/10.1007/s00027-019-0626-3
              </p>
              <p>
                Bouffard, D., Kiefer, I., Wüest, A., Wunderle, S., & Odermatt,
                D. (2018). Are surface temperature and chlorophyll in a large
                deep lake related? An analysis based on satellite observations
                in synergy with hydrodynamic modelling and in-situ data. Remote
                sensing of environment, 209, 510-523.
                https://doi.org/10.1016/j.rse.2018.02.056
              </p>
              <p>
                Råman Vinnå, L., Wüest, A., & Bouffard, D. (2017). Physical
                effects of thermal pollution in lakes. Water Resources Research,
                53(5), 3968-3987. https://doi.org/10.1002/2016WR019686
              </p>
            </div>
          </div>
          <div className="sidebar">
            <div className="sidebar-inner">
              <h3>Contents</h3>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.vision)}
              >
                Vision
              </div>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.contact)}
              >
                Contact us
              </div>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.projects)}
              >
                Contributing projects
              </div>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.people)}
              >
                Contributing people
              </div>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.opensource)}
              >
                Open source
              </div>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.publications)}
              >
                Related publications
              </div>
            </div>
          </div>
        </div>
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default About;
