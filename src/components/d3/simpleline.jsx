import React, { Component } from "react";
import * as d3 from "d3";
import "./simpleline.css";

class SimpleLine extends Component {
  state = {
    color: "black",
    thickness: 2,
  };
  plot = () => {
    try {
      d3.select(`#simpleline_svg`).remove();
    } catch (e) {
      console.log(e);
    }
    var { color, thickness } = this.state;
    var simpleline = { x: [0, 1], y: [1, 1] };
    var data = [];
    for (var i = 0; i < simpleline.x.length; i++) {
      data.push({ x: simpleline.x[i], y: simpleline.y[i] });
    }
    var div = d3.select("#simpleline");
    var margin = { top: 10, right: 10, bottom: 10, left: 10 };
    var width =
      div.node().getBoundingClientRect().width - margin.left - margin.right;
    var height =
      div.node().getBoundingClientRect().height - margin.top - margin.bottom;

    this.svg = d3
      .select("#simpleline")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "simpleline_svg")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    x.domain([0, 1]);
    y.domain([0, 2]);

    this.svg
      .append("path")
      .datum(data)
      .attr("class", "lineTest")
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
      .attr("stroke", color)
      .attr("stroke-width", thickness);

    this.x = x;
    this.y = y;
  };

  update(reset) {
    var { simpleline } = this.props;
    var { color, thickness } = this.state;
    var data = [];
    for (var i = 0; i < simpleline.x.length; i++) {
      data.push({ x: simpleline.x[i], y: simpleline.y[i] });
    }
    var x = this.x;
    var y = this.y;

    var xMin = d3.min(simpleline.x);
    var xMax = d3.max(simpleline.x);
    var yMin = d3.min(simpleline.y);
    var yMax = d3.max(simpleline.y);
    var yAve = (yMin + yMax) / 2;

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    if (reset) {
      let line = this.svg.selectAll(".lineTest").data([data], function (d) {
        return d.x;
      });

      line
        .enter()
        .append("path")
        .attr("class", "lineTest")
        .merge(line)
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d.x);
            })
            .y(function (d) {
              return y(yAve);
            })
            .curve(d3.curveNatural)
        )
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", thickness);
    }

    let line = this.svg.selectAll(".lineTest").data([data], function (d) {
      return d.x;
    });

    line
      .enter()
      .append("path")
      .attr("class", "lineTest")
      .merge(line)
      .transition()
      .delay(1000)
      .duration(1000)
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
          .curve(d3.curveCatmullRom.alpha(0.5))
      )
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", thickness);
  }
  componentDidMount() {
    this.plot();
  }
  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.simpleline.x) !==
      JSON.stringify(this.props.simpleline.x)
    ) {
      this.plot();
      this.update(true);
    } else if (
      JSON.stringify(prevProps.simpleline.y) !==
      JSON.stringify(this.props.simpleline.y)
    ) {
      this.update(false);
    }
  }
  render() {
    return <div id="simpleline"></div>;
  }
}

export default SimpleLine;
