import React, { Component } from "react";
import * as d3 from "d3";

class SummaryGraph extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
  };
  plot = () => {
    var { graphid } = this.state;
    var { dt, value } = this.props;
    var stroke = "red";
    var stroke_width = 2;
    try {
      d3.select(`#summarygraph_svg_${graphid}`).remove();
    } catch (e) {
      console.log(e);
    }
    var div = d3.select(`#summarygraph_${graphid}`);
    var margin = { top: 5, right: 0, bottom: 5, left: 0 };
    this.width =
      div.node().getBoundingClientRect().width - margin.left - margin.right;
    this.height =
      div.node().getBoundingClientRect().height - margin.top - margin.bottom;

    this.svg = d3
      .select(`#summarygraph_${graphid}`)
      .append("svg")
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom)
      .attr("id", `summarygraph_svg_${graphid}`)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = [];
    for (var i = 0; i < dt.length; i++) {
      data.push({ x: dt[i], y: value[i] });
    }

    var xMin = d3.min(dt);
    var xMax = d3.max(dt);
    var yMin = d3.min(value);
    var yMax = d3.max(value);

    var x = d3.scaleTime().range([0, this.width]);
    var y = d3.scaleLinear().range([this.height, 0]);

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    /*this.svg
      .append("path")
      .datum(data)
      .attr("class", "area")
      .attr(
        "d",
        d3
          .area()
          .x(function (d) {
            return x(d.x);
          })
          .y0(this.height)
          .y1(function (d) {
            return y(d.y);
          })
          .curve(d3.curveNatural)
      )
      .attr("fill", "#ffffff33")
      .attr("stroke", stroke)
      .attr("stroke-width", 0);*/

    this.svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.x);
          })
          .y(function (d) {
            return y(d.y);
          })
          .curve(d3.curveNatural)
      )
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-width", stroke_width);
  };

  componentDidMount() {
    this.plot();
    window.addEventListener("resize", this.plot, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plot, false);
  }

  render() {
    var { graphid } = this.state;
    return <div id={`summarygraph_${graphid}`} className="summarygraph"></div>;
  }
}

export default SummaryGraph;
