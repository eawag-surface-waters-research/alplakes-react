import L from "leaflet";
import * as d3 from "d3";

L.Streamlines = (L.Layer ? L.Layer : L.Class).extend({
  options: {
    paths: 800,
    streamlinesColor: "white",
    width: 0.5,
    fade: 0.97,
    duration: 10,
    maxAge: 50,
    velocityScale: 0.01,
    opacity: 1,
    nCols: 200,
    nRows: 200,
    zIndex: 3,
    radiusFactor: 2,
    parameter: "",
    unit: "",
  },
  initialize: function (geometry, data, options) {
    L.Util.setOptions(this, options);
    this._dataWidth = geometry[0].length / 2;
    this._dataHeight = geometry.length;
    var { bounds, transformationMatrix } =
      this._generateTransformationMatrix(geometry);
    this._data = data;
    this.timer = null;

    this._xMin = bounds.xMin;
    this._yMin = bounds.yMin;
    this._xSize = bounds.xSize;
    this._ySize = bounds.ySize;
    this._transformationMatrix = transformationMatrix;
  },

  onAdd: function (map) {
    this._map = map;

    if (!this._canvas) {
      this._initCanvas();
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas);
    } else {
      map._panes.overlayPane.appendChild(this._canvas);
    }
    map.on("click", this._onClick, this);
    map.on("moveend", this._reset, this);
    map.on("movestart", this._stopAnimation, this);
    map.on("mousemove", this._onMousemove, this);
    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
    }
    this._reset();
  },
  _createAndFillTwoDArray: function ({ rows, columns, defaultValue }) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => defaultValue)
    );
  },
  _generateTransformationMatrix: function (geometry) {
    var quadtreedata = [];
    var x_array = [];
    var y_array = [];
    for (let i = 0; i < this._dataHeight; i++) {
      for (let j = 0; j < this._dataWidth; j++) {
        if (!isNaN(geometry[i][j])) {
          y_array.push(geometry[i][j]);
          x_array.push(geometry[i][j + this._dataWidth]);
          quadtreedata.push([
            geometry[i][j + this._dataWidth],
            geometry[i][j],
            i,
            j,
          ]);
        }
      }
    }
    let xMin = Math.min(...x_array);
    let yMin = Math.min(...y_array);
    let xMax = Math.max(...x_array);
    let yMax = Math.max(...y_array);
    var nCols = this.options.nCols;
    var nRows = this.options.nRows;
    let xSize = (xMax - xMin) / nCols;
    let ySize = (yMax - yMin) / nRows;
    var radius = Math.max(xSize, ySize) * this.options.radiusFactor;
    let quadtree = d3
      .quadtree()
      .extent([
        [xMin, yMin],
        [xMax, yMax],
      ])
      .addAll(quadtreedata);
    var transformationMatrix = this._createAndFillTwoDArray({
      rows: nRows + 1,
      columns: nCols + 1,
      defaultValue: null,
    });
    var x, y;
    for (let i = 0; i < nRows + 1; i++) {
      y = yMax - i * ySize;
      for (let j = 0; j < nCols + 1; j++) {
        x = xMin + j * xSize;
        let f = quadtree.find(x, y, radius);
        if (f !== undefined) {
          transformationMatrix[i][j] = [f[2], f[3]];
        }
      }
    }
    var bounds = { xMin, xMax, yMin, yMax, xSize, ySize };
    return { bounds, transformationMatrix };
  },
  update: function (data, options) {
    var reset = false;
    if (options.paths !== this.options.paths) {
      reset = true;
    }
    L.Util.setOptions(this, options);
    this._canvas.style.opacity = this.options.opacity;
    this._canvas.style.zIndex = this.options.zIndex + 100;
    this._data = data;
    if (reset) this._reset();
  },
  _reset: function (event) {
    this._stopAnimation();
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._width = size.x;
    this._height = size.y;
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._drawLayer();
  },

  _clear: function (event) {
    this._stopAnimation();
    this._ctx.clearRect(0, 0, this._width, this._height);
  },

  onRemove: function (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }
    map.off("click", this._onClick, this);
    map.off("moveend", this._reset, this);
    map.off("movestart", this._stopAnimation, this);
    map.off("mousemove", this._onMousemove, this);
    if (map.options.zoomAnimation) {
      map.off("zoomanim", this._animateZoom, this);
    }
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  _initCanvas: function () {
    var canvas = (this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-streamlines-layer leaflet-layer"
    ));

    var originProp = L.DomUtil.testProp([
      "transformOrigin",
      "WebkitTransformOrigin",
      "msTransformOrigin",
    ]);
    canvas.style[originProp] = "50% 50%";
    canvas.style.opacity = this.options.opacity;
    canvas.style.zIndex = this.options.zIndex + 100;

    var size = this._map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(
      canvas,
      "leaflet-zoom-" + (animated ? "animated" : "hide")
    );

    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._width = canvas.width;
    this._height = canvas.height;
  },

  _drawLayer: function () {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this._paths = this._prepareParticlePaths();
    let self = this;
    this.timer = d3.timer(function () {
      self._moveParticles();
      self._drawParticles();
    }, this.options.duration);
  },

  _moveParticles: function () {
    let self = this;
    this._paths.forEach(function (par) {
      if (par.age > self.options.maxAge) {
        self._randomPosition(par);
        par.age = 0;
      }
      let xt = par.x + par.u * self.options.velocityScale;
      let yt = par.y + par.v * self.options.velocityScale;
      let index = self._getIndexAtPoint(xt, yt);
      if (index === null) {
        self._randomPosition(par);
        par.age = 0;
      } else {
        let t = self._transformationMatrix[index[0]][index[1]];
        par.xt = xt;
        par.yt = yt;
        par.ut = self._data[t[0]][t[1]];
        par.vt = self._data[t[0]][t[1] + self._dataWidth];
      }

      par.age += 1;
    });
  },

  _drawParticles: function () {
    // Previous paths...
    let ctx = this._ctx;
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "source-over";
    //ctx.globalCompositeOperation = prev;

    // fading paths...
    ctx.fillStyle = `rgba(0, 0, 0, ${this.options.fade})`;
    ctx.lineWidth = this.options.width;
    ctx.strokeStyle = this.options.streamlinesColor;

    // New paths
    let self = this;
    this._paths.forEach(function (par) {
      self._drawParticle(ctx, par);
    });
  },

  _drawParticle: function (ctx, par) {
    if (par.age <= this.options.maxAge && par !== null && par.xt) {
      let sourcelatlng = [par.y, par.x];
      let targetlatlng = [par.yt, par.xt];
      let source = new L.latLng(sourcelatlng[0], sourcelatlng[1]);
      let target = new L.latLng(targetlatlng[0], targetlatlng[1]);

      try {
        let pA = this._map.latLngToContainerPoint(source);
        let pB = this._map.latLngToContainerPoint(target);

        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);

        // next-step movement
        par.x = par.xt;
        par.y = par.yt;
        par.u = par.ut;
        par.v = par.vt;

        // colormap vs. simple color
        let color = this.options.streamlinesColor;
        if (typeof color === "function") {
          let mag = Math.sqrt(par.u ** 2 + par.v ** 2);
          ctx.strokeStyle = color(mag);
        }

        let width = this.options.width;
        if (typeof width === "function") {
          let mag = Math.sqrt(par.u ** 2 + par.v ** 2);
          ctx.lineWidth = width(mag);
        }

        ctx.stroke();
      } catch (e) {
        this._stopAnimation();
      }
    }
  },

  _getIndexAtPoint(x, y) {
    var i = this.options.nRows - Math.round((y - this._yMin) / this._ySize);
    var j = Math.round((x - this._xMin) / this._xSize);
    if (i > -1 && i < this.options.nRows && j > -1 && j < this.options.nCols) {
      let t = this._transformationMatrix[i][j];
      if (t !== null && !isNaN(this._data[t[0]][t[1]])) {
        return [i, j];
      } else {
        return null;
      }
    } else {
      return null;
    }
  },

  _prepareParticlePaths: function () {
    let paths = [];
    for (var i = 0; i < this.options.paths; i++) {
      let p = this._randomPosition();
      if (p !== null) {
        p.age = this._randomAge();
        paths.push(p);
      }
    }
    return paths;
  },

  _randomAge: function () {
    return Math.floor(Math.random() * this.options.maxAge);
  },

  _randomPosition: function (o = {}) {
    delete o.xt;
    delete o.yt;
    delete o.ut;
    delete o.vt;

    for (var k = 0; k < this.options.paths; k++) {
      let i = Math.ceil(Math.random() * this.options.nRows) - 1;
      let j = Math.ceil(Math.random() * this.options.nCols) - 1;
      let t = this._transformationMatrix[i][j];
      if (t !== null && !isNaN(this._data[t[0]][t[1]])) {
        o.x =
          this._xMin +
          j * this._xSize +
          this._xSize * Math.random() -
          this._xSize / 2;
        o.y =
          this._yMin +
          (this.options.nRows - i) * this._ySize +
          this._ySize * Math.random() -
          this._ySize / 2;
        o.u = this._data[t[0]][t[1]];
        o.v = this._data[t[0]][t[1] + this._dataWidth];
        return o;
      }
    }
    return null;
  },

  _stopAnimation: function () {
    if (this.timer) {
      this.timer.stop();
    }
  },

  _animateZoom: function (e) {
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map
        ._getCenterOffset(e.center)
        ._multiplyBy(-scale)
        .subtract(this._map._getMapPanePos());
    if (L.DomUtil.setTransform) {
      L.DomUtil.setTransform(this._canvas, offset, scale);
    } else {
      this._canvas.style[L.DomUtil.TRANSFORM] =
        L.DomUtil.getTranslateString(offset) + " scale(" + scale + ")";
    }
  },

  _onMousemove: function (t) {
    try {
      var e = this._queryValue(t);
      this.fire("mousemove", e);
    } catch (e) {
      console.error("Leaflet streamlines mousemove event failed.", e);
    }
  },

  getLatLng: function () {
    return false;
  },

  _onClick: function (t) {
    try {
      var e = this._queryValue(t);
      this.fire("click", e);
    } catch (e) {
      console.error("Leaflet streamlines click event failed.", e);
    }
  },

  _queryValue: function (click) {
    let index = this._getIndexAtPoint(click.latlng.lng, click.latlng.lat);
    if (index === null) {
      click["value"] = { u: null, v: null };
    } else {
      let t = this._transformationMatrix[index[0]][index[1]];
      click["value"] = {
        u: this._data[t[0]][t[1]],
        v: this._data[t[0]][t[1] + this._dataWidth],
      };
    }
    return click;
  },

  getFeatureValue: function (e) {
    let index = this._getIndexAtPoint(e.latlng.lng, e.latlng.lat);
    if (index === null) {
      return null;
    } else {
      let t = this._transformationMatrix[index[0]][index[1]];
      var u = this._data[t[0]][t[1]];
      var v = this._data[t[0]][t[1] + this._dataWidth];
      if (isNaN(u) || isNaN(v)) {
        return `0${this.options.unit}`;
      }
      var magnitude = Math.abs(Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2)));
      let deg = Math.round(
        (Math.atan2(u / magnitude, v / magnitude) * 180) / Math.PI
      );
      if (deg < 0) deg = 360 + deg;
      return `${this._round(magnitude, this.options.decimal)}${this.options.unit} ${deg}°`;
    }
  },
});

L.streamlines = function (data, options) {
  return new L.Streamlines(data, options);
};
