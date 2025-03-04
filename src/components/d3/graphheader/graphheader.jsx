import React, { Component } from "react";
import downloadIcon from "../../../img/download.png";
import heatIcon from "../../../img/heat.png";
import contourIcon from "../../../img/contour.png";
import xgraphIcon from "../../../img/xgraph.png";
import ygraphIcon from "../../../img/ygraph.png";
import shrinkIcon from "../../../img/shrink.png";
import brushIcon from "../../../img/brush.png";
import fontsizeIcon from "../../../img/fontsize.png";
import fullscreenIcon from "../../../img/full.png";
import "./graphheader.css";

class GraphHeader extends Component {
  state = {
    download: false,
    font: false,
  };

  toggleDownload = () => {
    var { download, font } = this.state;
    if (!download) font = false;
    this.setState({ download: !download, font });
  };

  toggleFont = () => {
    var { download, font } = this.state;
    if (!font) download = false;
    this.setState({ font: !font, download });
  };

  editFontSize = (event) => {
    this.props.editFontSize(event);
    this.setState({ font: false });
  };

  componentDidMount() {
    window.addEventListener("keydown", this.exitFullscreen, false);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.exitFullscreen, false);
  }

  exitFullscreen = (e) => {
    var { fullscreen, toggleFullscreen } = this.props;
    if (e.key === "Escape" && fullscreen) {
      toggleFullscreen();
    }
  };

  render() {
    var {
      id,
      title,
      display,
      fontSize,
      fullscreen,
      clearPlot,
      toggleXgraph,
      toggleFullscreen,
      toggleYgraph,
      toggleDisplay,
      downloadJSON,
      downloadCSV,
    } = this.props;
    var { font, download } = this.state;
    var fulllabel = "Fullscreen";
    var fullicon = fullscreenIcon;
    if (fullscreen) {
      fulllabel = "Shrink Map";
      fullicon = shrinkIcon;
    }
    var displaylabel = "View as heat map";
    var displayicon = heatIcon;
    if (display === "heatmap") {
      displaylabel = "View as contour map";
      displayicon = contourIcon;
    }
    return (
      <React.Fragment>
        <div className="vis-header" id={"vis-header" + id}>
          <div className="title">{title}</div>
          {clearPlot && (
            <div className="icon">
              <img
                src={brushIcon}
                alt="brushIcon"
                onClick={clearPlot}
                title="Remove lines"
              />
            </div>
          )}
          {toggleYgraph && (
            <div className="icon">
              <img
                src={ygraphIcon}
                alt="ygraph"
                onClick={toggleYgraph}
                title="Toggle y Graph"
              />
            </div>
          )}
          {toggleXgraph && (
            <div className="icon">
              <img
                src={xgraphIcon}
                alt="xgraph"
                onClick={toggleXgraph}
                title="Toggle X Graph"
              />
            </div>
          )}
          {display && (
            <div className="icon">
              <img
                src={displayicon}
                alt="heatmap"
                onClick={toggleDisplay}
                title={displaylabel}
              />
            </div>
          )}
          {fontSize && (
            <div className="icon">
              <img
                src={fontsizeIcon}
                alt="Font size"
                title="Font Size"
                onClick={this.toggleFont}
              />
              <select
                className={
                  font ? "fontsize-dropdown show" : "fontsize-dropdown"
                }
                onChange={this.editFontSize}
                value={fontSize}
              >
                {[8, 10, 12, 14, 16, 18, 20, 22, 24].map((item) => (
                  <option value={item} key={"fontsize" + item}>
                    {item}px
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="icon">
            <img
              src={downloadIcon}
              alt="download"
              onClick={this.toggleDownload}
              title="Download"
            />
          </div>
          <div className="icon">
            <img
              src={fullicon}
              alt="Toggle fullscreen"
              onClick={toggleFullscreen}
              title={fulllabel}
            />
          </div>

          <div
            className={download ? "downloadbar" : "downloadbar hide"}
            onClick={this.toggleDownload}
          >
            <button id={"png" + id} title="Download PNG">
              PNG
            </button>
            <button
              className="blue"
              onClick={downloadJSON}
              title="Download as JSON"
            >
              JSON
            </button>
            <button
              className="red"
              onClick={downloadCSV}
              title="Download as CSV"
            >
              CSV
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default GraphHeader;
