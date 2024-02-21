import React, { Component } from "react";
import * as d3 from "d3";
import Translations from "../../../translations.json";
import "./yearlygraph.css";

class YearlyGraph extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
  };
  plot = () => {
    var { graphid } = this.state;
    var { data, unit, language } = this.props;
    var stroke = "rgba(68,188,167,255)";
    var stroke_width = 2;
    try {
      d3.select(`#yearlygraph_svg_${graphid}`).remove();
    } catch (e) {
      console.log(e);
    }
    var div = d3.select(`#yearlygraph_${graphid}`);
    var margin = { top: 10, right: 0, bottom: 25, left: 0 };
    this.width =
      div.node().getBoundingClientRect().width - margin.left - margin.right;
    this.height =
      div.node().getBoundingClientRect().height - margin.top - margin.bottom;

    this.svg = d3
      .select(`#yearlygraph_${graphid}`)
      .append("svg")
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom)
      .attr("id", `yearlygraph_svg_${graphid}`)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var series = [
      {
        x: 0,
        y_min: data.min[11],
        y_mean: data.mean[11],
        y_max: data.max[11],
      },
    ];
    for (var i = 0; i < data.month.length; i++) {
      series.push({
        x: data.month[i],
        y_min: data.min[i],
        y_mean: data.mean[i],
        y_max: data.max[i],
      });
    }
    series.push({
      x: 13,
      y_min: data.min[0],
      y_mean: data.mean[0],
      y_max: data.max[0],
    });
    var xMin = 0.5;
    var xMax = 12.5;
    var yMin = d3.min(data.min);
    var yMax = d3.max(data.max);

    var x = d3.scaleLinear().range([0, this.width]);
    var y = d3.scaleLinear().range([this.height, 0]);

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    this.svg
      .append("path")
      .datum(series)
      .attr("class", "area")
      .attr(
        "d",
        d3
          .area()
          .x(function (d) {
            return x(d.x);
          })
          .y0(function (d) {
            return y(d.y_min);
          })
          .y1(function (d) {
            return y(d.y_max);
          })
          .curve(d3.curveNatural)
      )
      .attr("fill", "rgba(68,188,167,0.2)")
      .attr("stroke", stroke)
      .attr("stroke-width", 0);

    this.svg
      .append("path")
      .datum(series)
      .attr("class", "line")
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.x);
          })
          .y(function (d) {
            return y(d.y_mean);
          })
          .curve(d3.curveNatural)
      )
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-width", stroke_width);

    var months = Translations.axis[language].shortMonths;
    var month = new Date().getMonth() + 1;

    const dot = this.svg
      .append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", x(month))
      .attr("cy", y(data.mean[month - 1]))
      .attr("fill", "#daf2ed")
      .attr("stroke", stroke)
      .attr("stroke-width", 2)
      .style("opacity", 1);

    const tooltip = this.svg.append("g").attr("class", "tooltip");

    tooltip
      .append("text")
      .attr(
        "transform",
        `translate(${x(month)}, ${y(data.mean[month - 1]) - 10})`
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", stroke)
      .text(parseInt(data.mean[month - 1] * 10) / 10 + " " + unit);

    const tooltip_min = this.svg.append("g").attr("class", "tooltip");

    tooltip_min
      .append("text")
      .attr(
        "transform",
        `translate(${x(month)}, ${y(data.min[month - 1]) + 2})`
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", stroke)
      .text(Math.floor(data.min[month - 1]));

    const tooltip_max = this.svg.append("g").attr("class", "tooltip");

    tooltip_max
      .append("text")
      .attr(
        "transform",
        `translate(${x(month)}, ${y(data.max[month - 1]) + 2})`
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", stroke)
      .text(Math.ceil(data.max[month - 1]));

    const tooltip_date = this.svg.append("g").attr("class", "tooltip");

    tooltip_date
      .append("text")
      .attr("transform", `translate(${x(month)}, ${this.height + 20})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", stroke)
      .text(months[month - 1]);

    this.svg.on("mousemove", updateTooltip);

    function updateTooltip(event) {
      const mouseX = x.invert(d3.pointer(event)[0]);
      const bisect = d3.bisector((d) => d.x).left;
      const index = bisect(series, mouseX, 1);
      const closestDataPoint = series[index];

      dot
        .attr("cx", x(closestDataPoint.x))
        .attr("cy", y(closestDataPoint.y_mean));

      tooltip
        .attr(
          "transform",
          `translate(${x(closestDataPoint.x) - 50}, ${
            y(closestDataPoint.y_mean) - 40
          })`
        )
        .select("text")
        .text(`${parseInt(closestDataPoint.y_mean * 10) / 10} ${unit}`);

      tooltip_min
        .attr(
          "transform",
          `translate(${x(closestDataPoint.x) - 50}, ${
            y(closestDataPoint.y_min) - 65
          })`
        )
        .select("text")
        .text(`${parseInt(closestDataPoint.y_min)}`);

      tooltip_max
        .attr(
          "transform",
          `translate(${x(closestDataPoint.x) - 50}, ${y(
            closestDataPoint.y_max
          )})`
        )
        .select("text")
        .text(`${parseInt(closestDataPoint.y_max)}`);

      tooltip_date
        .attr("transform", `translate(${x(closestDataPoint.x) - 50}, ${0})`)
        .select("text")
        .text(months[index - 1]);
    }
  };

  componentDidMount() {
    this.plot();
    window.addEventListener("resize", this.plot, false);
  }

  componentDidUpdate() {
    this.plot();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plot, false);
  }

  render() {
    var { graphid } = this.state;
    return <div id={`yearlygraph_${graphid}`} className="yearlygraph"></div>;
  }
}

export default YearlyGraph;
