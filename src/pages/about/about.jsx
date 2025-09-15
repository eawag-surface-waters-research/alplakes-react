import React, { Component } from "react";
import { Helmet } from "react-helmet";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import runnallja from "../../img/runnalja.jpg";
import bouffada from "../../img/bouffada.jpg";
import odermada from "../../img/odermada.jpg";
import schmidma from "../../img/schmidma.jpg";
import dimark_icon from "../../img/dimark.png";
import Translations from "../../translations.json";
import "./about.css";
import ScrollUp from "../../components/scrollup/scrollup";

const Link = (url, c = "link") => {
  return (
    <a className={c} target="_blank" rel="noreferrer" href={url}>
      {url}
    </a>
  );
};

class About extends Component {
  state = {
    visibleKey: "vision",
  };
  constructor(props) {
    super(props);
    this.divRefs = {
      vision: React.createRef(),
      contact: React.createRef(),
      projects: React.createRef(),
      people: React.createRef(),
      opensource: React.createRef(),
      publications: React.createRef(),
      privacy: React.createRef(),
    };
  }
  handleScroll = () => {
    let closestDiv = null;
    let closestDistance = Infinity;
    Object.keys(this.divRefs).forEach((key) => {
      const div = this.divRefs[key].current;
      if (div) {
        const rect = div.getBoundingClientRect();
        const top = rect.top;
        const bottom = rect.bottom;
        if (top < window.innerHeight && bottom > 0) {
          const distanceFromTop = Math.abs(top);
          if (distanceFromTop < closestDistance) {
            closestDistance = distanceFromTop;
            closestDiv = key;
          }
        }
      }
    });
    if (closestDiv) {
      this.setState({ visibleKey: closestDiv });
    }
  };
  scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      window.scrollTo({
        top: sectionRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
    const query = window.location.search;
    if (query) {
      const sectionKey = query.replace("?", "");
      if (this.divRefs[sectionKey]) {
        setTimeout(() => {
          this.scrollToSection(this.divRefs[sectionKey]);
        }, 300);
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
  render() {
    const language = "EN";
    var { visibleKey } = this.state;
    return (
      <React.Fragment>
        <Helmet>
          <title>About - Alplakes</title>
          <meta
            name="description"
            content="Learn more about the Alplakes project and our partners."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="content-width about">
          <div className="content">
            <div className="header">
              <h1>{Translations.about[language]}</h1>
            </div>
            <div className="intro">
              <p>
                Alplakes is a research initiative that provides accurate
                predictions of the condition of lakes throughout the European
                Alpine region. We integrate models and remote sensing products
                developed by the research community to provide the most
                up-to-date and accurate information possible.
              </p>
            </div>
            <div id="vision" ref={this.divRefs["vision"]} className="section">
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
            <div id="contact" ref={this.divRefs["contact"]} className="section">
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
                <div className="email">
                  <a href="mailto:james.runnalls@eawag.ch">
                    james.runnalls@eawag.ch
                  </a>
                </div>
                <div className="contact-head">
                  {Translations["talk"][language]}
                </div>
                <div className="contact">Bug reports, new features</div>
              </div>
              <div className="person">
                <img src={bouffada} alt="Damien" />
                <div className="name">Damien Bouffard</div>
                <div className="job">Group Leader</div>
                <div className="email">
                  <a href="mailto:damien.bouffard@eawag.ch">
                    damien.bouffard@eawag.ch
                  </a>
                </div>
                <div className="contact-head">
                  {Translations["talk"][language]}
                </div>
                <div className="contact">3D models, particle tracking</div>
              </div>
              <div className="person">
                <img src={odermada} alt="Dani" />
                <div className="name">Daniel Odermatt</div>
                <div className="job">Group Leader</div>
                <div className="email">
                  <a href="mailto:daniel.odermatt@eawag.ch">
                    daniel.odermatt@eawag.ch
                  </a>
                </div>
                <div className="contact-head">
                  {Translations["talk"][language]}
                </div>
                <div className="contact">Remote sensing products</div>
              </div>
              <div className="person" style={{ margin: 0 }}>
                <img src={schmidma} alt="Martin" />
                <div className="name">Martin Schmid</div>
                <div className="job">Group Leader</div>
                <div className="email">
                  <a href="mailto:martin.schmid@eawag.ch">
                    martin.schmid@eawag.ch
                  </a>
                </div>
                <div className="contact-head">
                  {Translations["talk"][language]}
                </div>
                <div className="contact">1D models</div>
              </div>
            </div>
            <div
              id="projects"
              ref={this.divRefs["projects"]}
              className="section"
            >
              <h2>Contributing projects</h2>
              <p>
                The following projects have played a pivotal role in the
                development of the Alplakes platform and/or the models and
                products it offers.
              </p>

              <h3>DiMark</h3>
              <p>
                The rise in water temperatures combined with pollution will
                alter habitat conditions for many Alpine species. DiMark
                provides monitoring and early warning system solutions (by
                linking traditional and satellite observations) to mitigate
                tourism and eutrophication pressure on Alpine lakes. By creating
                an innovative monitoring of water quality and early warning
                systems, the project improves water management, as well as
                climate mitigation. This project is co-funded by the European
                Union through the Interreg Alpine Space programme.
              </p>
              <div className="project-info">
                {Link("https://www.alpine-space.eu/project/dimark/")}
                <img
                  src={dimark_icon}
                  className="project-logo"
                  alt="DiMark Icon"
                />
              </div>

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
                {Link("https://alplakes.eawag.ch")}
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
                {Link(
                  "https://github.com/Eawag-AppliedSystemAnalysis/Simstrat"
                )}
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
                {Link(
                  "https://github.com/eawag-surface-waters-research/sencast"
                )}
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
            <div id="people" ref={this.divRefs["people"]} className="section">
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
            <div
              id="opensource"
              ref={this.divRefs["opensource"]}
              className="section"
            >
              <h2>Open source</h2>
              <p>
                All the code and simulations that power Alplakes are made
                available for the community to use and contribute to.
              </p>
              <h3>3D Models</h3>
              {Link(
                "https://github.com/eawag-surface-waters-research/alplakes-simulations",
                "repo"
              )}
              <h3>1D Models</h3>
              {Link(
                "https://github.com/Eawag-AppliedSystemAnalysis/operational-simstrat",
                "repo"
              )}
              <h3>Remote Sensing Products</h3>
              {Link(
                "https://github.com/eawag-surface-waters-research/sencast",
                "repo"
              )}
              <h3>Alplakes</h3>
              <h4>Website</h4>
              {Link(
                "https://github.com/eawag-surface-waters-research/alplakes-react",
                "repo"
              )}
              <h4>API</h4>
              {Link(
                "https://github.com/eawag-surface-waters-research/alplakes-fastapi",
                "repo"
              )}
              <h4>Orchestrator</h4>
              {Link(
                "https://github.com/eawag-surface-waters-research/airflow",
                "repo"
              )}
            </div>

            <div id="privacy" ref={this.divRefs["privacy"]} className="section">
              <h2>Privacy Policy</h2>
              <p>
                <strong>Effective Date:</strong> August 19, 2025
              </p>
              <p>
                Alplakes (“we,” “our,” or “us”) respects your privacy and is
                committed to protecting the personal information you share with
                us through our app and website. This Privacy Policy explains
                what information we collect, how we use it, and your choices
                regarding your data.
              </p>

              <h3>1. Information We Collect</h3>

              <h4>1.1 Usage Data</h4>
              <p>
                We use <strong>Umami</strong>, an analytics platform, to collect
                non-identifiable usage information about how users interact with
                our app and website. This may include:
              </p>
              <ul>
                <li>Pages visited</li>
                <li>Features used</li>
                <li>Session duration</li>
                <li>Device and browser information</li>
              </ul>
              <p>
                <strong>Important:</strong> Umami does not track personal
                information such as your name, email, or IP address in a
                personally identifiable way.
              </p>

              <h4>1.2 Crash Reports</h4>
              <p>
                We use <strong>Sentry</strong> to monitor and fix errors in our
                app and website. Sentry collects technical information about
                crashes, which may include:
              </p>
              <ul>
                <li>Error messages and stack traces</li>
                <li>Device information (model, OS version)</li>
                <li>App version</li>
                <li>Anonymous identifiers</li>
              </ul>
              <p>
                Sentry may collect limited information from logs, but we do not
                intentionally collect personal data unless you provide it in an
                error message or log.
              </p>

              <h3>2. How We Use Your Data</h3>
              <p>The data we collect is used to:</p>
              <ul>
                <li>Understand how users interact with Alplakes</li>
                <li>Improve our app and website performance</li>
                <li>Identify and fix errors and crashes</li>
                <li>Make data-driven decisions to enhance user experience</li>
              </ul>
              <p>
                We <strong>do not sell or share</strong> your personal
                information with third parties for marketing purposes.
              </p>

              <h3>3. Cookies and Tracking</h3>
              <p>
                We do not use personal tracking cookies. The only analytics and
                crash reporting tools used are Umami and Sentry, which collect
                data as described above.
              </p>

              <h3>4. Data Retention</h3>
              <p>
                <strong>Umami data:</strong> Retained for 13 months to analyze
                trends and improve services.
              </p>
              <p>
                <strong>Sentry crash data:</strong> Retained for 90 days to
                diagnose and fix issues.
              </p>
              <p>
                After the retention period, data is automatically deleted or
                anonymized.
              </p>

              <h3>5. Your Rights</h3>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul>
                <li>Request access to the data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of tracking where applicable</li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <strong>james.runnalls@eawag.ch</strong>.
              </p>

              <h3>6. Security</h3>
              <p>
                We take reasonable measures to protect your data from
                unauthorized access, alteration, disclosure, or destruction.
                However, no method of electronic storage or transmission is 100%
                secure.
              </p>

              <h3>7. Third-Party Services</h3>
              <p>
                Our app and website use third-party services (Umami and Sentry)
                to provide analytics and crash reporting. These services may
                have their own privacy policies:
              </p>
              <ul>
                <li>
                  <a
                    href="https://umami.is/docs/privacy"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Umami Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://sentry.io/privacy/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Sentry Privacy Policy
                  </a>
                </li>
              </ul>
              <p>
                We encourage you to review their policies for more information.
              </p>

              <h3>8. Children’s Privacy</h3>
              <p>
                Alplakes is not intended for children under 13 (or the minimum
                age in your jurisdiction). We do not knowingly collect personal
                information from children.
              </p>

              <h3>9. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated “Effective Date.”
              </p>

              <h3>10. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy or our
                practices, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> james.runnalls@eawag.ch
              </p>
              <p>
                <strong>Address:</strong> Ueberlandstrasse 133, 8600 Dübendorf
              </p>
            </div>

            <div
              id="publications"
              ref={this.divRefs["publications"]}
              className="section"
            >
              <h2>Related publications</h2>
              <h3>Model development</h3>
              <p>
                Irani Rahaghi, A., Odermatt, D., Anneville, O., Sepúlveda
                Steiner, O., Reiss, R. S., Amadori, M., ... & Bouffard, D.
                (2024). Combined Earth observations reveal the sequence of
                conditions leading to a large algal bloom in Lake Geneva.
                Communications Earth & Environment, 5(1), 229.
                {Link("https://doi.org/10.1038/s43247-024-01351-5")}
              </p>
              <p>
                Tian, W., Zhang, Z., Bouffard, D., Wu, H., Xin, K., Gu, X., &
                Liao, Z. (2024). Enhancing interpretability and generalizability
                of deep learning-based emulator in three-dimensional lake
                hydrodynamics using Koopman operator and transfer learning:
                Demonstrated on the example of lake Zurich. Water Research, 249,
                120996.
                {Link("https://doi.org/10.1016/j.watres.2023.120996")}
              </p>
              <p>
                Safin, A., Bouffard, D., Ozdemir, F., Ramón, C. L., Runnalls,
                J., Georgatos, F., ... & Šukys, J. (2022). A Bayesian data
                assimilation framework for lake 3D hydrodynamic models with a
                physics-preserving particle filtering method using SPUX-MITgcm
                v1. Geoscientific Model Development, 15(20), 7715-7730.
                {Link("https://doi.org/10.5194/gmd-15-7715-2022")}
              </p>
              <p>
                Li, C., Odermatt, D., Bouffard, D., Wüest, A., & Kohn, T.
                (2022). Coupling remote sensing and particle tracking to
                estimate trajectories in large water bodies. International
                Journal of Applied Earth Observation and Geoinformation, 110,
                102809.
                {Link("https://doi.org/10.1016/j.jag.2022.102809")}
              </p>
              <p>
                Baracchini, T., Hummel, S., Verlaan, M., Cimatoribus, A., Wüest,
                A., & Bouffard, D. (2020). An automated calibration framework
                and open source tools for 3D lake hydrodynamic models.
                Environmental Modelling & Software, 134, 104787
                {Link("https://doi.org/10.1016/j.envsoft.2020.104787")}
              </p>
              <p>
                Baracchini, T., Wüest, A., & Bouffard, D. (2020). Meteolakes: An
                operational online three-dimensional forecasting platform for
                lake hydrodynamics. Water research, 172, 115529.
                {Link("https://doi.org/10.1016/j.watres.2020.115529")}
              </p>
              <p>
                Baracchini, T., Chu, P. Y., Šukys, J., Lieberherr, G., Wunderle,
                S., Wüest, A., & Bouffard, D. (2020). Data assimilation of in
                situ and satellite remote sensing data to 3D hydrodynamic lake
                models: a case study using Delft3D-FLOW v4. 03 and OpenDA v2. 4.
                Geoscientific Model Development, 13(3), 1267-1284.
                {Link("https://doi.org/10.5194/gmd-13-1267-2020")}
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
                {Link("https://doi.org/10.1080/20442041.2018.1530529")}
              </p>
              <h3>Framework use</h3>
              <p>
                Sepúlveda Steiner, O., Forrest, A. L., McInerney, J. B.,
                Fernández Castro, B., Lavanchy, S., Wüest, A., & Bouffard, D.
                (2023). Spatial variability of turbulent mixing from an
                underwater glider in a large, deep, stratified lake. Journal of
                Geophysical Research: Oceans, 128(6), e2022JC018913.
                {Link("https://doi.org/10.1029/2022JC018913")}
              </p>
              <p>
                Perolo, P., Fernández Castro, B., Escoffier, N., Lambert, T.,
                Bouffard, D., & Perga, M. E. (2021). Accounting for surface
                waves improves gas flux estimation at high wind speed in a large
                lake. Earth System Dynamics, 12(4), 1169-1189.
                {Link("https://doi.org/10.5194/esd-12-1169-2021")}
              </p>
              <p>
                Råman Vinnå, L., Bouffard, D., Wüest, A., Girardclos, S., &
                Dubois, N. (2020). Assessing subaquatic mass movement hazards:
                an integrated observational and hydrodynamic modelling approach.
                Water Resources Management, 34(13), 4133-4146.
                {Link("https://doi.org/10.1007/s11269-020-02660-y")}
              </p>
              <p>
                Nouchi, V., Kutser, T., Wüest, A., Müller, B., Odermatt, D.,
                Baracchini, T., & Bouffard, D. (2019). Resolving biogeochemical
                processes in lakes using remote sensing. Aquatic Sciences, 81,
                1-13.
                {Link("https://doi.org/10.1007/s00027-019-0626-3")}
              </p>
              <p>
                Bouffard, D., Kiefer, I., Wüest, A., Wunderle, S., & Odermatt,
                D. (2018). Are surface temperature and chlorophyll in a large
                deep lake related? An analysis based on satellite observations
                in synergy with hydrodynamic modelling and in-situ data. Remote
                sensing of environment, 209, 510-523.
                {Link("https://doi.org/10.1016/j.rse.2018.02.056")}
              </p>
              <p>
                Råman Vinnå, L., Wüest, A., & Bouffard, D. (2017). Physical
                effects of thermal pollution in lakes. Water Resources Research,
                53(5), 3968-3987.
                {Link("https://doi.org/10.1002/2016WR019686")}
              </p>
            </div>
          </div>
          <div className="sidebar">
            <div className="sidebar-inner">
              <h3>Contents</h3>
              <div
                className={visibleKey === "vision" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["vision"])}
              >
                Vision
              </div>
              <div
                className={visibleKey === "contact" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["contact"])}
              >
                Contact us
              </div>
              <div
                className={visibleKey === "projects" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["projects"])}
              >
                Contributing projects
              </div>
              <div
                className={visibleKey === "people" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["people"])}
              >
                Contributing people
              </div>
              <div
                className={visibleKey === "opensource" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["opensource"])}
              >
                Open source
              </div>
              <div
                className={visibleKey === "privacy" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["privacy"])}
              >
                Privacy Policy
              </div>
              <div
                className={
                  visibleKey === "publications" ? "link active" : "link"
                }
                onClick={() =>
                  this.scrollToSection(this.divRefs["publications"])
                }
              >
                Related publications
              </div>
            </div>
          </div>
        </div>
        <ScrollUp />
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default About;
