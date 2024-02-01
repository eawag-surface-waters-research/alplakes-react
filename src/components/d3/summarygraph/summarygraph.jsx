import React, { Component } from "react";
import * as d3 from "d3";

class SummaryGraph extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
  };
  plot = () => {
    var { graphid } = this.state;
    var { dt, value, dtMin, dtMax } = this.props;
    var stroke = "rgba(68,188,167,255)";
    var stroke_width = 2;
    try {
      d3.select(`#summarygraph_svg_${graphid}`).remove();
    } catch (e) {
      console.log(e);
    }
    var div = d3.select(`#summarygraph_${graphid}`);
    var margin = { top: 5, right: 0, bottom: 5, left: -5 };
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

    yMin = yMin - (yMax - yMin) / 2;

    if (dtMin) xMin = dtMin;
    if (dtMax) xMax = dtMax;

    var x = d3.scaleTime().range([0, this.width]);
    var y = d3.scaleLinear().range([this.height, 0]);

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    this.svg
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(yMin))
      .attr("x2", 0)
      .attr("y2", y(yMax))
      .selectAll("stop")
      .data([
        { offset: "0%", color: "rgba(68,188,167,0)" },
        { offset: "100%", color: "rgba(68,188,167,0.5)" },
      ])
      .enter()
      .append("stop")
      .attr("offset", function (d) {
        return d.offset;
      })
      .attr("stop-color", function (d) {
        return d.color;
      });

    this.svg
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
            return y(d.y) + 4;
          })
          .curve(d3.curveNatural)
      )
      .attr("fill", "url(#area-gradient)")
      .attr("stroke", stroke)
      .attr("stroke-width", 0);

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
