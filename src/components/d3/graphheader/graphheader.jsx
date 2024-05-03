import React, { Component } from "react";
import downloadIcon from "../../../img/download.png";
import heatIcon from "../../../img/heat.png";
import contourIcon from "../../../img/contour.png";
import xgraphIcon from "../../../img/xgraph.png";
import ygraphIcon from "../../../img/ygraph.png";
import shrinkIcon from "../../../img/shrink.png";
import fullscreenIcon from "../../../img/full.png";
import "./graphheader.css";

class GraphHeader extends Component {
  componentDidMount() {
    window.addEventListener("keydown", this.exitFullscreen, false);
    window.addEventListener("click", this.closeDownload, false);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.exitFullscreen, false);
    window.removeEventListener("click", this.closeDownload, false);
  }

  closeDownload = (e) => {
    var { id, download } = this.props;
    if (
      download &&
      !document.getElementById("graphdownload" + id).contains(e.target)
    ) {
      this.props.toggleDownload();
    }
  };

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
      download,
      display,
      fullscreen,
      toggleXgraph,
      toggleFullscreen,
      toggleYgraph,
      toggleDownload,
      toggleDisplay,
      downloadJSON,
      downloadCSV,
    } = this.props;
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
        <div className="vis-header">
          <div className="title">{title}</div>
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
          <div className="icon">
            <img
              src={downloadIcon}
              alt="download"
              onClick={toggleDownload}
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

          <div className={download ? "downloadbar" : "downloadbar hide"}>
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
