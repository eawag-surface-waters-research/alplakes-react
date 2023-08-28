import React, { Component } from "react";
import downloadIcon from "../../../img/download.png";
import heatIcon from "../../../img/heat.png";
import contourIcon from "../../../img/contour.png";
import xgraphIcon from "../../../img/xgraph.png";
import ygraphIcon from "../../../img/ygraph.png";
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
      toggleXgraph,
      toggleYgraph,
      toggleDownload,
      toggleDisplay,
      downloadJSON,
      downloadCSV,
    } = this.props;
    var displaylabel = "View as heat map";
    var displayicon = heatIcon;
    if (display === "heatmap") {
      displaylabel = "View as contour map";
      displayicon = contourIcon;
    }
    return (
      <React.Fragment>
        <div className="vis-header">
          <table className="downloadtable">
            <tbody>
              <tr>
                <td className="title">{title}</td>
                {toggleYgraph && (
                  <td style={{ width: "25px" }}>
                    <img
                      src={ygraphIcon}
                      alt="ygraph"
                      onClick={toggleYgraph}
                      title="Toggle y Graph"
                    />
                  </td>
                )}
                {toggleXgraph && (
                  <td style={{ width: "25px" }}>
                    <img
                      src={xgraphIcon}
                      alt="xgraph"
                      onClick={toggleXgraph}
                      title="Toggle X Graph"
                    />
                  </td>
                )}
                {display && (
                  <td style={{ width: "25px" }}>
                    <img
                      src={displayicon}
                      alt="heatmap"
                      onClick={toggleDisplay}
                      title={displaylabel}
                    />
                  </td>
                )}
                <td id={"graphdownload" + id} style={{ width: "25px" }}>
                  <img
                    src={downloadIcon}
                    alt="download"
                    onClick={toggleDownload}
                    title="Download"
                  />
                  <div
                    className={download ? "downloadbar" : "downloadbar hide"}
                  >
                    <div>Download Graph</div>
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

export default GraphHeader;
