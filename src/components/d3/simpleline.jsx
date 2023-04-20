import React, { Component } from "react";
import Translate from "../../translations.json";
import * as d3 from "d3";
import "./simpleline.css";

class SimpleLine extends Component {
  state = {
    color: "black",
    background_color: "#f2f2f2",
    dark_color: "white",
    dark_background_color: "#272727",
    thickness: 2,
  };
  plot = () => {
    try {
      d3.select(`#simpleline_svg`).remove();
    } catch (e) {
      console.log(e);
    }
    var { dark, language } = this.props;
    var {
      color,
      thickness,
      background_color,
      dark_color,
      dark_background_color,
    } = this.state;
    var data = [
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ];
    d3.timeFormatDefaultLocale(Translate.axis[language]);
    var div = d3.select("#simpleline");
    var margin = { top: 10, right: 10, bottom: 20, left: 40 };
    this.width =
      div.node().getBoundingClientRect().width - margin.left - margin.right;
    this.height =
      div.node().getBoundingClientRect().height - margin.top - margin.bottom;

    this.svg = d3
      .select("#simpleline")
      .append("svg")
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom)
      .attr("id", "simpleline_svg")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime().range([0, this.width]);
    var y = d3.scaleLinear().range([this.height, 0]);

    x.domain([0, 2]);
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
      .attr("stroke", dark ? dark_color : color)
      .attr("stroke-width", thickness);

    this.tooltipDot = this.svg
      .append("circle")
      .attr("r", 5)
      .attr("fill", dark ? dark_background_color : background_color)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .style("pointer-events", "none")
      .attr("cx", x(1))
      .attr("cy", y(1));

    this.x = x;
    this.y = y;
  };

  update(reset) {
    try {
      d3.select(`#simpleline_tooltip`).remove();
    } catch (e) {
      console.log(e);
    }
    var {
      simpleline,
      datetime,
      temperature,
      formatDate,
      formatTime,
      language,
      dark,
    } = this.props;
    var { color, thickness, dark_color } = this.state;
    var data = [];
    for (var i = 0; i < simpleline.x.length; i++) {
      data.push({ x: simpleline.x[i], y: simpleline.y[i] });
    }

    var { x, y, tooltipDot, closestIndex } = this;

    var xMin = d3.min(simpleline.x);
    var xMax = d3.max(simpleline.x);
    var yMin = d3.min(simpleline.y);
    var yMax = d3.max(simpleline.y);
    var yAve = (yMin + yMax) / 2;

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    this.yAxis = this.svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(2)
          .tickFormat((d) => d + "°C")
      )
      .call((g) => g.select(".domain").remove());

    this.xAxis = this.svg
      .append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat("%a %d")))
      .call((g) => g.select(".domain").remove());

    var index = this.closestIndex(datetime, simpleline.x);

    this.svg
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("id", "simpleline_tooltip")
      .style("opacity", 0)
      .on("touchmouse mousemove", function (event) {
        const mousePos = d3.pointer(event, this);
        var indexHover = closestIndex(x.invert(mousePos[0]), simpleline.x);
        tooltipDot
          .attr("cy", y(simpleline.y[indexHover]))
          .attr("cx", x(simpleline.x[indexHover]));
        document.getElementById("temperature_value").innerHTML = (
          Math.round(simpleline.y[indexHover] * 10) / 10
        ).toFixed(1);
        document.getElementById("time_value").innerHTML = formatTime(
          simpleline.x[indexHover]
        );
        document.getElementById("date_value").innerHTML = formatDate(
          simpleline.x[indexHover],
          Translate.month[language]
        );
      })
      .on("mouseleave", function (event) {
        tooltipDot
          .attr("cy", y(simpleline.y[index]))
          .attr("cx", x(simpleline.x[index]));
        document.getElementById("temperature_value").innerHTML =
          temperature.toFixed(1);
        document.getElementById("time_value").innerHTML = formatTime(datetime);
        document.getElementById("date_value").innerHTML = formatDate(
          datetime,
          Translate.month[language]
        );
      });

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
        .duration(500)
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
        .attr("stroke", dark ? dark_color : color)
        .attr("stroke-width", thickness);
    }

    tooltipDot
      .attr("cy", y(yAve))
      .transition()
      .duration(500)
      .attr("cx", x(simpleline.x[index]));

    let line = this.svg.selectAll(".lineTest").data([data], function (d) {
      return d.x;
    });

    line
      .enter()
      .append("path")
      .attr("class", "lineTest")
      .merge(line)
      .transition()
      .delay(500)
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
      .attr("stroke", dark ? dark_color : color)
      .attr("stroke-width", thickness);

    tooltipDot
      .transition()
      .delay(500)
      .duration(1000)
      .attr("cy", y(simpleline.y[index]));
  }

  updateTooltipDot = () => {
    var { datetime, simpleline } = this.props;
    var index = this.closestIndex(datetime, simpleline.x);
    this.tooltipDot
      .attr("cy", this.y(simpleline.y[index]))
      .attr("cx", this.x(simpleline.x[index]));
  };

  closestIndex = (num, arr) => {
    let curr = arr[0],
      diff = Math.abs(num - curr);
    let index = 0;
    for (let val = 0; val < arr.length; val++) {
      let newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        curr = arr[val];
        index = val;
      }
    }
    return index;
  };

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
    } else if (prevProps.datetime !== this.props.datetime) {
      this.updateTooltipDot();
    } else if (prevProps.dark !== this.props.dark) {
      this.plot();
      this.update(true);
    } else if (prevProps.language !== this.props.language) {
      this.plot();
      this.update(true);
    }
  }

  render() {
    return <div id="simpleline"></div>;
  }
}

export default SimpleLine;
