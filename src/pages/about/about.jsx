import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import NumberIncreaser from "../../components/numberincreaser/numberincreaser";
import threed_icon from "../../img/threed-icon.png";
import oned_icon from "../../img/oned-icon.png";
import satellite_icon from "../../img/satellite.png";
import live_icon from "../../img/live.png";
import insitu_icon from "../../img/insitu.png";
import runnallja from "../../img/runnalja.jpg";
import bouffada from "../../img/bouffada.jpg";
import odermada from "../../img/odermada.jpg";
import schmidma from "../../img/schmidma.jpg";
import "./about.css";

class Promos extends Component {
  render() {
    var { types } = this.props;
    return (
      <React.Fragment>
        <div className="promos">
          {types.map((t) => (
            <div className="promo" key={t["id"]}>
              <div className="number">
                <NumberIncreaser targetValue={t["value"]} />
              </div>
              <div className="text">
                <div className="upper">lakes with</div>
                <div className="parameter">{t["long_name"]}</div>
                <div className="dates">{t["dates"]}</div>
              </div>
              <img src={t["icon"]} alt={t["long_name"]} />
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class About extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  render() {
    document.title = "About | Alplakes";
    var end = new Date().getFullYear();
    var products = [
      {
        id: "3D",
        short_name: "3D",
        long_name: "3D models",
        icon: threed_icon,
        start: "2019",
        end: end,
        value: 12,
      },
      {
        id: "1D",
        short_name: "1D",
        long_name: "1D models",
        icon: oned_icon,
        start: "1981",
        end: end,
        value: 85,
      },
      {
        id: "live",
        short_name: "Live",
        long_name: "live data",
        icon: live_icon,
        start: "2019",
        end: end,
        value: 5,
      },
      {
        id: "satellite",
        short_name: "Satellite",
        long_name: "satellite products",
        icon: satellite_icon,
        start: "2015",
        end: end,
        value: 12,
      },
      {
        id: "insitu",
        short_name: "Insitu",
        long_name: "insitu data",
        icon: insitu_icon,
        start: "2019",
        end: end,
        value: 27,
      },
    ];
    return (
      <div className="main">
        <NavBar {...this.props} relative={true}/>
        <div className="about">
          <div className="section-content">
            <div className="header">
              Forecasting and monitoring alpine lakes.
            </div>
            <div className="intro">
              Alplakes is an interactive web application offering public access
              to operational simulations and remote sensing products for lakes
              across the European alpine region. This platform consolidates
              outputs from several research projects, providing a comprehensive
              digital twin for each lake. Alplakes is designed to be
              user-friendly, allowing a diverse group of users to easily access
              the latest lake models and remote sensing products produced by the
              research community.
            </div>
            <div className="intro-promos">
              <Promos types={products} />
            </div>
          </div>
          <div className="section-title">Get in touch</div>
          <div className="section-content">
            <div>
              We encourage the use of our products. Please do not hesitate to
              contact us in case you have feedback or are interested in
              collaborating.
            </div>
            <div className="person">
              <img src={runnallja} alt="James" />
              <div className="job">Software Engineer</div>
              <div className="email">james.runnalls@eawag.ch</div>
              <div className="contact-head">Talk to me about:</div>
              <div className="contact">Bug reports, new features</div>
            </div>
            <div className="person">
              <img src={bouffada} alt="Damien" />
              <div className="job">Group Leader</div>
              <div className="email">damien.bouffard@eawag.ch</div>
              <div className="contact-head">Talk to me about:</div>
              <div className="contact">3D models, particle tracking</div>
            </div>
            <div className="person">
              <img src={odermada} alt="Dani" />
              <div className="job">Group Leader</div>
              <div className="email">daniel.odermatt@eawag.ch</div>
              <div className="contact-head">Talk to me about:</div>
              <div className="contact">Remote sensing products</div>
            </div>
            <div className="person">
              <img src={schmidma} alt="Martin" />
              <div className="job">Group Leader</div>
              <div className="email">martin.schmid@eawag.ch</div>
              <div className="contact-head">Talk to me about:</div>
              <div className="contact">1D models</div>
            </div>
          </div>
          <div className="section-content"></div>
          <div className="section-title">Projects</div>
          <div className="section-content">
            <div className="sub-header">Alplakes</div>
            <div className="projects">
              Alplakes is an open-source esa funded research project aimed at
              providing operational products based on a combination of remote
              sensing and hydrodynamic models for a number of European lakes.
              The project is a collaboration between Eawag, Università di Trento
              and CNR. As part of this project 12 3D hydrodynamic models where
              built and calibrated, Sentinel 2 products were calibrated and the
              web platform was developed.
            </div>
            <div className="sub-header">Simstrat</div>
            <div className="projects">
              The aquatic research institute Eawag is working with the 1D lake
              model Simstrat for a better understanding of lake dynamics. This
              project is developed jointly by the Aquatic Physics and Applied
              System Analysis groups in the Department Surface Waters - Research
              & Management (SURF)
            </div>
            <div className="sub-header">SenCast</div>
            <div className="projects">
              Sencast is a toolbox to download and derive water quality
              parameters from satellite images. It acts as a framework for the
              use a variety of processors such as Idepix, Polymer, Sen2Cor and
              Acolite. It supports ESA satellites Sentinel 2 and Sentinel 3 and
              USGS satellite Landsat 8. It is developed and maintained by the
              SURF Remote Sensing group at Eawag.
            </div>
            <div className="sub-header">Meteolakes</div>
            <div className="projects">
              Meteolakes is a web application that shares some results of 3D
              coupled hydrodynamic-biological simulations performed daily with
              4.5 days forecasts for several Swiss lakes using real-time
              atmospheric, rivers and WWTPs data. Additionally it provides
              measurements from a field station and satellite observations
              downloaded in real-time. With direct impacts at scientific and
              community level, this combination also aims at assisting
              stakeholders in evidence-based decision-making and towards the
              sustainable management of our lakes. This product was developed by
              Theo Baracchini as part of his PhD thesis. It has been superceeded
              by the Alplakes platform.
            </div>
          </div>
          <div className="section-title">Related Publications</div>
          <div className="section-content">
            <div className="sub-header">Model development</div>
            <p>
              Safin, A., Bouffard, D., Ozdemir, F., Ramón, C. L., Runnalls, J.,
              Georgatos, F., ... & Šukys, J. (2022). A Bayesian data
              assimilation framework for lake 3D hydrodynamic models with a
              physics-preserving particle filtering method using SPUX-MITgcm
              v1. Geoscientific Model Development, 15(20), 7715-7730.
            </p>
            <p>
              Li, C., Odermatt, D., Bouffard, D., Wüest, A., & Kohn, T. (2022).
              Coupling remote sensing and particle tracking to estimate
              trajectories in large water bodies. International Journal of
              Applied Earth Observation and Geoinformation, 110, 102809.
            </p>
            <p>
              Baracchini, T., Hummel, S., Verlaan, M., Cimatoribus, A., Wüest,
              A., & Bouffard, D. (2020). An automated calibration framework and
              open source tools for 3D lake hydrodynamic models. Environmental
              Modelling & Software, 134, 104787
            </p>
            <p>
              Baracchini, T., Wüest, A., & Bouffard, D. (2020). Meteolakes: An
              operational online three-dimensional forecasting platform for lake
              hydrodynamics. Water research, 172, 115529.
            </p>
            <p>
              Baracchini, T., Chu, P. Y., Šukys, J., Lieberherr, G., Wunderle,
              S., Wüest, A., & Bouffard, D. (2020). Data assimilation of in situ
              and satellite remote sensing data to 3D hydrodynamic lake models:
              a case study using Delft3D-FLOW v4. 03 and OpenDA v2.
              4. Geoscientific Model Development, 13(3), 1267-1284.
            </p>
            <div className="sub-header">Remote sensing development</div>
            <p>
              Sepúlveda Steiner, O., Forrest, A. L., McInerney, J. B., Fernández
              Castro, B., Lavanchy, S., Wüest, A., & Bouffard, D. (2023).
              Spatial variability of turbulent mixing from an underwater glider
              in a large, deep, stratified lake. Journal of Geophysical
              Research: Oceans, 128(6), e2022JC018913.
            </p>
            <p>
              Perolo, P., Fernández Castro, B., Escoffier, N., Lambert, T.,
              Bouffard, D., & Perga, M. E. (2021). Accounting for surface waves
              improves gas flux estimation at high wind speed in a large
              lake. Earth System Dynamics, 12(4), 1169-1189.
            </p>
            <p>
              Råman Vinnå, L., Bouffard, D., Wüest, A., Girardclos, S., &
              Dubois, N. (2020). Assessing subaquatic mass movement hazards: an
              integrated observational and hydrodynamic modelling
              approach. Water Resources Management, 34(13), 4133-4146.
            </p>
            <p>
              Nouchi, V., Kutser, T., Wüest, A., Müller, B., Odermatt, D.,
              Baracchini, T., & Bouffard, D. (2019). Resolving biogeochemical
              processes in lakes using remote sensing. Aquatic Sciences, 81,
              1-13.
            </p>
            <p>
              Soomets, T., Kutser, T., Wüest, A., & Bouffard, D. (2019). Spatial
              and temporal changes of primary production in a deep peri-alpine
              lake. Inland Waters, 9(1), 49-60.
            </p>
            <p>
              Baracchini, T., Bärenzung, K., Bouffard, D., & Wüest, A. J.
              (2019). Le Lac de Zurich en Ligne-Prévisions hydrodynamiques 3D en
              temps-réel sur meteolakes. ch. Aqua & Gas-Fachzeitschrift für Gas,
              Wasser und Abwasser. Aqua & Gas, 12, 24-29.
            </p>
            <p>
              Bouffard, D., Kiefer, I., Wüest, A., Wunderle, S., & Odermatt, D.
              (2018). Are surface temperature and chlorophyll in a large deep
              lake related? An analysis based on satellite observations in
              synergy with hydrodynamic modelling and in-situ data. Remote
              sensing of environment, 209, 510-523.
            </p>
            <p>
              Råman Vinnå, L., Wüest, A., & Bouffard, D. (2017). Physical
              effects of thermal pollution in lakes. Water Resources
              Research, 53(5), 3968-3987.
            </p>
          </div>
        </div>
        <Footer {...this.props} />
      </div>
    );
  }
}

export default About;
