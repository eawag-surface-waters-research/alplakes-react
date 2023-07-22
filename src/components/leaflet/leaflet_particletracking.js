import L from "leaflet";
import * as d3 from "d3";

L.Control.ParticleTracking = L.Control.extend({
  options: {
    position: "topright", // location of control button
    paths: 10, // number of paths to add with each click
    spread: 100, // spread of the added paths
    opacity: 1, // opacity of the canvas
    zIndex: 300, // z-index of the canvas
    nCols: 200, // number of columns in interpolated velocity grid
    nRows: 200, // number of rows in inperpolated velcity grid
    radiusFactor: 2, // search radius for quadtree search
    dt: 3, // number of compuation timesteps between each data timestep
  },
  initialize: function (geometry, data, datetime, options) {
    L.Util.setOptions(this, options);
    this._points = [];
    this._dataWidth = geometry[0].length / 2;
    this._dataHeight = geometry.length;
    var { bounds, transformationMatrix } =
      this._generateTransformationMatrix(geometry);
    this._xMin = bounds.xMin;
    this._yMin = bounds.yMin;
    this._xSize = bounds.xSize;
    this._ySize = bounds.ySize;
    this._data = data;
    this._datetime = parseFloat(datetime);
    this._transformationMatrix = transformationMatrix;
    this._interpolateTimeseries();
  },
  _interpolateTimeseries: function () {
    var times = Object.keys(this._data).map((d) => parseFloat(d));
    times.sort(function (a, b) {
      return a - b;
    });
    var interpolated_times = [];
    for (let i = 1; i < times.length; i++) {
      var timestep = (times[i] - times[i - 1]) / this.options.dt;
      for (let j = 0; j < this.options.dt; j++) {
        interpolated_times.push(times[i - 1] + timestep * j);
      }
    }
    this._times = times;
    this._interpolated_times = interpolated_times;
    this._time_index = this._findClosestIndex(
      this._interpolated_times,
      this._datetime
    );
  },
  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-draw-toolbar"
    );

    var button = L.DomUtil.create("a", "leaflet-draw", this._container);
    var label = L.DomUtil.create("div", "leaflet-draw-label", this._container);
    button.href = "#";
    button.title = "Seed Particles";

    // Create an SVG icon
    var svgIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" version="1.1" viewBox="0 0 135.415 135.594" > <g transform="translate(103.567 -32.553)"> <g strokeWidth="0.265" transform="translate(339.415 -596.72)"> <path fill="#96deac" d="M-380.225 764.62c.258-.068.615-.064.794.01.18.072-.032.126-.468.121-.437-.005-.583-.065-.326-.132zm9.652.007c.182-.073.48-.073.662 0 .182.074.033.134-.33.134-.365 0-.513-.06-.332-.134zm-12.418-.27c.19-.076.419-.067.507.02.088.089-.069.151-.348.14-.308-.013-.37-.076-.16-.16zm-2.117-.265c.19-.076.42-.067.507.021.088.088-.068.15-.347.14-.308-.013-.371-.076-.16-.16zm53.963-10.065c.476-.059 1.19-.057 1.588.003.397.06.008.109-.865.107-.873-.002-1.198-.05-.723-.11zm9.057-3.38c.342-.364.681-.661.754-.661.073 0-.147.297-.49.661-.34.364-.68.662-.753.662-.073 0 .148-.298.49-.662zm-97.135-1.918c-.33-.42-.32-.43.1-.1.254.2.462.408.462.463 0 .218-.217.078-.562-.363zm-2.877-2.58c-.643-.655-1.11-1.19-1.036-1.19.072 0 .658.535 1.3 1.19.643.655 1.11 1.19 1.037 1.19-.073 0-.658-.535-1.301-1.19zm-2.526-2.58l-1.046-1.124 1.124 1.046c1.046.973 1.247 1.203 1.046 1.203-.043 0-.549-.506-1.124-1.124zm106.06-1.389c.002-.873.05-1.198.11-.722.059.475.057 1.19-.003 1.587-.06.398-.109.008-.107-.865zm-108.066-.86c-.329-.42-.32-.428.1-.1.255.2.463.409.463.464 0 .217-.217.077-.563-.363zm-2.381-2.91c-.33-.42-.32-.429.1-.1.254.2.463.408.463.463 0 .218-.217.078-.563-.363zm-12.645-27.472c.012-.309.075-.371.16-.16.076.19.066.419-.021.507-.088.088-.15-.069-.14-.347zm-.265-1.323c.013-.309.075-.371.16-.16.076.19.067.419-.021.507-.088.088-.15-.068-.139-.347zm-.265-1.588c.013-.308.076-.37.16-.16.077.191.067.42-.02.507-.089.088-.151-.068-.14-.347zm-.264-1.587c.013-.309.075-.371.16-.16.076.19.067.419-.021.507-.088.088-.15-.068-.14-.347zm134.408-1.588c.013-.308.076-.37.16-.16.076.191.067.42-.02.507-.089.088-.151-.068-.14-.347zm-134.652-.64c0-.363.06-.512.134-.33.073.182.073.48 0 .662-.074.181-.134.033-.134-.331zm134.938-2.116c0-.364.06-.513.133-.33.073.181.073.479 0 .66-.073.183-.133.034-.133-.33zm-135.169-1.455c.002-.728.054-.994.115-.592.06.402.059.998-.004 1.323-.063.326-.113-.004-.111-.731zm0-7.408c.002-.728.054-.994.115-.592.06.402.059.997-.004 1.323-.063.325-.113-.004-.111-.731zm135.169-1.191c0-.364.06-.513.133-.33.073.181.073.479 0 .66-.073.183-.133.034-.133-.33zm-134.938-2.117c0-.364.06-.512.134-.33.073.181.073.48 0 .661-.074.182-.134.033-.134-.33zm.244-2.27c.013-.309.075-.372.16-.16.076.19.067.419-.021.507-.088.087-.15-.069-.14-.348zm.264-1.853c.013-.308.076-.37.16-.16.077.191.067.42-.02.507-.089.088-.151-.068-.14-.347zm118.744-32.323c-.33-.42-.32-.43.1-.1.254.2.463.408.463.463 0 .218-.218.078-.563-.363zm-103.286-.595c.263-.291.538-.53.61-.53.074 0-.082.239-.346.53-.263.29-.538.529-.611.529-.073 0 .083-.238.347-.53zm101.183-1.786l-.642-.728.728.642c.4.352.728.68.728.727 0 .208-.215.039-.814-.641zm-97.876-1.786c.937-.946 1.764-1.72 1.837-1.72.073 0-.635.774-1.572 1.72-.938.946-1.765 1.72-1.837 1.72-.073 0 .634-.774 1.572-1.72zm93.907-2.183l-.641-.728.727.642c.4.353.728.68.728.727 0 .208-.215.039-.814-.641zm-90.07-1.39c.263-.29.538-.528.61-.528.073 0-.083.238-.346.529-.263.29-.538.529-.611.529-.073 0 .083-.238.346-.53zm2.513-1.951c0-.055.208-.263.463-.463.42-.33.429-.32.1.1-.346.44-.563.58-.563.363zm29.054-13.31c.191-.077.42-.067.508.02.088.089-.069.151-.348.14-.308-.013-.37-.076-.16-.16zm1.588-.265c.191-.076.42-.067.507.021.088.088-.068.15-.347.14-.308-.014-.371-.076-.16-.16zm1.587-.264c.191-.077.42-.067.508.02.088.089-.069.151-.348.14-.308-.013-.37-.076-.16-.16zm2.1-.26c.183-.073.48-.073.662 0 .182.074.033.134-.33.134-.364 0-.513-.06-.331-.133zm3.047-.279c.402-.06.997-.059 1.323.004.325.063-.004.113-.731.111-.728-.002-.994-.053-.592-.114zm9.406.01c.19-.077.419-.068.507.02.088.088-.069.15-.348.14-.308-.013-.37-.076-.16-.16z" ></path> <path fill="#7de680" d="M-381.487 764.504c-14.914-1.418-29.905-8.175-40.046-18.05-2.43-2.366-4.73-4.78-4.359-4.573.185.103 8.274-7.754 20.097-19.52l19.788-19.693-.487-1.543c-1.411-4.471-.362-8.879 2.888-12.129 2-2 5.437-3.569 7.821-3.569.51 0 .516.51.516 39.688v39.687l-1.918-.035a69.232 69.232 0 01-4.3-.263zm-61.494-65.473c.012-.308.075-.37.16-.16.076.192.067.42-.021.508-.088.088-.15-.069-.14-.348z" ></path> <path fill="#5ac87e" d="M-371.63 764.627c.181-.073.479-.073.66 0 .182.074.034.134-.33.134s-.513-.06-.33-.134zm37.275-11.31c-3.993-1.441-6.355-4.052-7.433-8.215-1.406-5.432 1.277-11.043 6.434-13.456 3.043-1.424 7.605-1.303 10.75.284 1.996 1.008 4.137 3.348 5.048 5.517.688 1.639.765 2.117.763 4.734-.003 3.351-.474 4.9-2.175 7.137-2.255 2.968-5.097 4.397-9.057 4.555-2.168.086-2.764.01-4.33-.556zm-92.138-12.124c-2.463-2.655-5.65-7.218-7.997-11.448-7.886-14.216-10.326-31.34-6.764-47.493 3.736-16.946 14.173-32.04 28.811-41.667 10.328-6.793 21.145-10.283 34.462-11.121l2.712-.17V685.426h.934c1.303 0 3.91.925 5.518 1.957 1.893 1.214 3.235 2.8 4.358 5.153.92 1.926.964 2.147.964 4.797s-.044 2.87-.964 4.796c-1.123 2.353-2.465 3.94-4.358 5.154-1.608 1.032-4.215 1.956-5.518 1.956h-.934v-23.884l-1.124.157c-.619.087-1.512.237-1.985.334l-.86.176v-24.408l-.727.006c-.4.003-1.74.231-2.977.507-13.55 3.02-24.248 13.718-27.268 27.269-.276 1.236-.504 2.576-.507 2.976l-.006.728h24.291l-.401 1.521c-.39 1.478-.352 4.344.076 5.82l.172.596H-410.724v.644c0 1.033.748 4.34 1.499 6.632 1.154 3.521 4.438 9.604 5.793 10.728.362.301 1.517-.742 8.82-7.969 4.62-4.573 3.406-3.344-2.7 2.731-6.107 6.076-11.207 11.047-11.334 11.047-.482 0-3.722-4.758-5.225-7.673-2.366-4.589-4.015-9.81-4.659-14.75l-.18-1.39h-16.128l.169 1.522c.641 5.773 1.912 11.252 3.684 15.889 2.02 5.284 5.7 11.685 9.234 16.059.823 1.019 1.497 1.914 1.5 1.99.001.074-1.222 1.357-2.719 2.848l-2.721 2.712zm7.964-49.482c2.57-19.741 18.16-35.331 37.902-37.902l1.39-.181V637.813l-1.257.143c-12.248 1.402-21.585 5.034-30.892 12.017-3.389 2.543-8.7 7.855-11.243 11.244-6.944 9.254-10.698 18.877-11.998 30.759l-.123 1.124h16.04zm110.77 9.327c0-.364.06-.513.134-.33.073.181.073.479 0 .66-.073.183-.133.034-.133-.33zm-.02-8.092c.012-.308.075-.37.16-.16.076.191.067.42-.021.507-.088.088-.15-.068-.14-.347zm-41.164-12.019c-7.823-1.184-12.255-9.619-8.867-16.87 2.935-6.283 11.343-8.391 17.407-4.366 3.556 2.36 5.557 7.09 4.828 11.414-1.098 6.506-6.937 10.797-13.368 9.823zm21.421-31.814l-1.313-1.389 1.39 1.313c1.29 1.22 1.51 1.465 1.312 1.465-.041 0-.666-.625-1.389-1.389zm-43.828-19.693c.191-.077.42-.067.507.02.088.088-.068.151-.347.14-.308-.013-.37-.076-.16-.16z" ></path> <path fill="#54a376" d="M-342.175 740.306c.013-.308.075-.37.16-.16.076.192.067.42-.021.508-.088.088-.15-.069-.14-.348zm-78.371-4.277c-.33-.42-.32-.429.1-.1.254.2.463.408.463.463 0 .218-.218.078-.563-.363zm6.119-5.225c2.98-2.984 5.478-5.424 5.551-5.424.073 0-2.306 2.44-5.287 5.424-2.98 2.983-5.478 5.423-5.551 5.423-.073 0 2.306-2.44 5.287-5.423zm-7.442 3.638c-.33-.42-.32-.43.1-.1.44.345.58.563.363.563-.055 0-.264-.209-.463-.463zm82.98-.596c.264-.29.539-.529.611-.529.073 0-.083.238-.346.53-.264.29-.539.528-.611.528-.073 0 .083-.238.346-.529zm7.744-3.367c.476-.058 1.19-.057 1.588.003.397.06.008.109-.865.108-.873-.002-1.198-.051-.723-.11zm-78.024-5.827c-.33-.42-.32-.429.1-.1.44.346.58.563.363.563-.055 0-.264-.208-.463-.463zm-24.817-16.89c.013-.308.076-.37.16-.16.077.192.067.42-.02.508-.088.088-.151-.068-.14-.347zm-.264-1.587c.013-.308.075-.37.16-.16.076.191.067.42-.021.507-.088.088-.15-.068-.14-.347zm16.14-.264c.012-.309.075-.371.16-.16.076.19.066.419-.022.507-.087.088-.15-.068-.139-.347zm-.265-1.323c.013-.309.075-.371.16-.16.076.19.067.42-.021.507-.088.088-.15-.068-.14-.347zm-16.119-.375c0-.364.06-.513.134-.33.073.181.073.479 0 .66-.074.183-.134.034-.134-.33zm15.875-1.323c0-.364.06-.513.134-.33.073.181.073.479 0 .66-.074.183-.134.034-.134-.33zm7.917-.419c.013-.308.075-.37.16-.16.076.191.067.42-.021.507-.088.088-.15-.068-.14-.347zm-24.047-.772c.005-.436.065-.583.132-.325.067.257.063.614-.01.793-.072.18-.127-.031-.122-.468zm24.047-10.076c.013-.308.075-.37.16-.16.076.191.067.42-.021.507-.088.088-.15-.068-.14-.347zm-7.917-.375c0-.363.06-.512.134-.33.073.181.073.48 0 .661-.074.182-.134.033-.134-.33zm-15.875-.793c0-.364.06-.513.134-.331.073.182.073.48 0 .661-.074.182-.134.033-.134-.33zm16.119-.949c.013-.308.075-.37.16-.16.076.192.067.42-.021.508-.088.088-.15-.069-.14-.348zm-15.875-1.058c.013-.308.075-.37.16-.16.076.191.067.42-.021.507-.088.088-.15-.068-.14-.347zm16.14-.264c.012-.309.075-.371.16-.16.076.19.066.419-.022.507-.087.088-.15-.069-.139-.347zm-15.876-1.323c.013-.309.076-.371.16-.16.077.19.067.419-.02.507-.088.088-.151-.068-.14-.347zm85.374-5.842c.182-.073.48-.073.661 0 .182.073.033.133-.33.133-.364 0-.513-.06-.331-.133zm2.117 0c.181-.073.48-.073.661 0 .182.073.033.133-.33.133-.365 0-.513-.06-.331-.133zm-8.7-2.934c-.328-.42-.32-.429.1-.1.441.346.581.563.364.563-.055 0-.264-.208-.463-.463zm-1.058-1.058c-.329-.42-.32-.429.1-.1.255.2.463.408.463.463 0 .218-.217.078-.563-.363zm-47.062-2.283c0-.055.209-.263.463-.463.42-.329.43-.32.1.1-.345.44-.563.581-.563.363zm2.635-2.876c1.096-1.169 1.334-1.379 1.334-1.18 0 .043-.566.608-1.257 1.257l-1.257 1.18zm65.12-1.147c.012-.308.075-.37.16-.16.076.191.066.42-.022.507-.087.088-.15-.068-.139-.347zm-23.528-.375c0-.364.06-.512.134-.33.073.181.073.48 0 .661-.073.182-.134.033-.134-.33zm-50.312-.629c0-.055.208-.263.463-.463.42-.329.429-.32.1.1-.346.44-.563.58-.563.363zm11.112 0c0-.055.209-.263.463-.463.42-.329.43-.32.1.1-.345.44-.563.58-.563.363zm39.2-1.487c0-.364.06-.513.134-.331.073.182.073.48 0 .661-.073.182-.134.033-.134-.33zm-48.99-.073c0-.04.923-.963 2.051-2.05l2.05-1.979-1.977 2.051c-1.837 1.904-2.123 2.171-2.123 1.978zm72.517-.346c.013-.309.076-.371.16-.16.077.19.067.419-.02.507-.088.088-.151-.069-.14-.347zm-67.754-4.18c0-.054.209-.263.463-.462.42-.33.43-.32.1.1-.345.44-.563.58-.563.363zm22.44-1.932c.191-.077.42-.067.507.02.088.089-.068.151-.347.14-.308-.013-.37-.076-.16-.16zm-39.902-2.862c.342-.364.68-.662.753-.662.073 0-.147.298-.489.662-.341.364-.68.661-.753.661-.073 0 .147-.297.489-.661zm73.09-1.373c.256-.067.672-.067.927 0 .255.066.046.12-.463.12-.51 0-.718-.054-.463-.12zm-69.783-2.199c1.157-1.164 2.164-2.117 2.237-2.117.072 0-.815.953-1.972 2.117-1.158 1.164-2.164 2.117-2.237 2.117-.073 0 .815-.953 1.972-2.117zm33.156-.975c.19-.076.419-.067.507.021.088.088-.069.15-.347.14-.309-.013-.371-.076-.16-.16zm1.323-.264c.19-.077.419-.067.507.02.088.089-.069.151-.348.14-.308-.013-.37-.076-.16-.16zm1.57-.26c.182-.073.48-.073.662 0 .182.074.033.134-.33.134-.365 0-.513-.06-.331-.133zm-32.345-1.94c.264-.292.539-.53.611-.53.073 0-.083.238-.346.53-.264.29-.539.529-.611.529-.073 0 .083-.239.346-.53zm2.25-1.688c0-.055.208-.263.462-.463.42-.33.43-.32.1.1-.346.44-.563.58-.563.363zm22.968-10.929c.191-.076.42-.067.507.021.088.088-.068.15-.347.14-.308-.014-.37-.076-.16-.16zm2.646-.529c.191-.076.42-.067.507.02.088.089-.068.151-.347.14-.308-.013-.37-.075-.16-.16zm1.588-.265c.19-.076.419-.067.507.021.088.088-.069.15-.347.14-.309-.013-.371-.076-.16-.16zm1.835-.259c.182-.073.48-.073.662 0 .182.074.033.134-.331.134s-.513-.06-.33-.134zm2.663-.27c.19-.076.419-.067.507.021.088.088-.069.15-.348.14-.308-.014-.37-.076-.16-.16z" ></path> <path fill="#49686d" d="M-342.409 742.18c.005-.436.065-.583.132-.325.067.257.062.615-.01.794-.073.179-.128-.032-.122-.468zm-79.391-7.913c-5.393-6.787-9.484-15.203-11.394-23.44-.608-2.623-1.342-7.451-1.342-8.83v-.96h15.875v.952c0 1.548 1.017 6.12 2.023 9.103 1.219 3.61 3.6 8.201 5.953 11.476l1.877 2.611-5.52 5.524c-3.035 3.039-5.607 5.524-5.716 5.524-.109 0-.899-.882-1.756-1.96zm17.229-16.891c-1.565-2.27-3.431-5.923-4.395-8.603-.595-1.656-1.757-6.58-1.757-7.446 0-.205 3.509-.29 12.045-.29h12.045l.271.714c.262.688-.02 1.004-8.14 9.128-4.627 4.628-8.488 8.415-8.58 8.415-.092 0-.762-.863-1.49-1.918zm37.769-11.708c.342-.364.68-.661.753-.661.073 0-.147.297-.489.661-.341.364-.68.662-.753.662-.073 0 .147-.298.489-.662zm-67.734-13.261c0-1.357.822-6.36 1.494-9.096a59.675 59.675 0 0149.34-44.832c1.547-.227 3.184-.412 3.638-.412h.826v15.61h-.95c-1.429 0-6.017.989-8.707 1.876-3.384 1.116-8.833 3.886-11.774 5.987-3.228 2.305-7.84 6.922-10.121 10.13-2.164 3.042-4.93 8.5-6.015 11.862-.91 2.82-1.856 7.214-1.856 8.618v.95h-15.875zm23.813.404c0-.159.24-1.467.533-2.906 2.824-13.855 13.902-24.933 27.757-27.757 1.44-.293 2.747-.533 2.906-.533.205 0 .29 3.561.288 12.237v12.237l-1.223.503c-1.65.678-4.357 3.263-5.292 5.053l-.76 1.454h-12.104c-8.58.001-12.105-.083-12.105-.288zm43.772-4.01l-.777-.86.86.777c.801.725.981.943.777.943-.046 0-.433-.387-.86-.86zm18.355-31.335c.191-.077.42-.067.508.02.087.088-.069.15-.348.14-.308-.013-.37-.076-.16-.16zm2.382 0c.19-.077.419-.067.507.02.088.088-.069.15-.347.14-.309-.013-.371-.076-.16-.16z" ></path> <path fill="#00a95d" d="M-375.269 737.09v-27.776l1.39-.16c.763-.087 1.656-.237 1.984-.332l.595-.173v23.907l1.257-.182c3.95-.57 9.073-2.347 12.448-4.317 9.577-5.594 15.935-14.92 17.65-25.895l.177-1.124h-12.09c-11.413 0-12.08-.026-11.895-.463.424-1.003.457-4.737.054-6.113l-.4-1.362h24.331l-.176-1.124c-.532-3.4-1.485-6.525-3.144-10.31l-.431-.985 1.521-.732c.869-.418 2.242-1.443 3.2-2.39.923-.91 1.709-1.657 1.746-1.657.208 0 2.6 5.519 3.282 7.576.828 2.49 1.893 7.466 1.893 8.842v.78h15.875v-.992c0-.545-.234-2.42-.52-4.167-3.134-19.19-15.287-35.575-32.685-44.068-6.214-3.034-13.916-5.255-19.779-5.706l-2.314-.178v15.688h.78c1.355 0 6.294 1.052 8.824 1.878 1.339.438 3.701 1.397 5.25 2.132l2.814 1.337-1.78 1.758c-1.125 1.113-2.04 2.318-2.491 3.281-.685 1.46-.737 1.507-1.3 1.152-1.82-1.146-7.404-2.913-10.973-3.47l-1.124-.177v12.223c0 11.3-.033 12.21-.441 12.053-.243-.093-1.136-.242-1.985-.33l-1.543-.162v-56.08l3.109.184c10.461.62 19.417 3.047 28.267 7.662 12.067 6.293 22.285 16.515 28.587 28.598 3.83 7.345 6.065 14.54 7.272 23.416.502 3.695.43 12.9-.132 16.8-1.476 10.243-4.919 19.572-10.276 27.85l-1.585 2.448-.73-1.01c-1-1.378-2.805-2.882-4.268-3.554l-1.217-.558 1.437-2.27c2.891-4.564 5.725-11.094 7.086-16.327.82-3.15 1.717-8.488 1.717-10.216v-1.257h-15.875v.78c0 1.354-1.058 6.33-1.88 8.843-1.105 3.377-3.873 8.83-5.99 11.804-2.288 3.212-6.914 7.838-10.126 10.126-3.023 2.152-8.488 4.928-11.823 6.003-2.55.822-7.49 1.867-8.824 1.867h-.78v16.14h1.06c1.613 0 6.154-.733 9.259-1.495 5.677-1.392 11.74-3.931 16.772-7.023 1.713-1.052 2.683-1.51 2.754-1.298.323.967 2.48 3.726 3.66 4.681l1.357 1.099-2.151 1.416c-2.891 1.904-9.973 5.438-13.395 6.684-5.88 2.14-13.3 3.62-20.176 4.02l-3.109.18z" ></path> <path fill="#364848" d="M-371.238 748.61l.07-7.99 2.514-.35c11.974-1.666 23.398-9.097 30.213-19.653 2.983-4.62 5.383-10.833 6.184-16.007.248-1.6.49-3.06.539-3.241.068-.255 1.875-.331 7.902-.331h7.814v1.09c0 1.94-.796 6.627-1.746 10.287-1.5 5.779-3.922 11.395-7.133 16.547-1.145 1.837-1.32 2.005-1.945 1.861-1.606-.37-4.757-.466-6.073-.184-4.815 1.032-8.514 4.95-9.281 9.83-.254 1.61-.134 3.296.38 5.323.164.65.02.797-2.028 2.07-2.811 1.748-7.83 4.189-11.095 5.396-4.448 1.646-12.276 3.342-15.423 3.342h-.962zm-.062-27.985v-11.898l1.496-.732c2.028-.994 4.27-3.268 5.233-5.31l.776-1.647h11.99c6.595 0 11.99.07 11.99.157 0 .813-1.234 5.856-1.884 7.698-3.565 10.106-11.64 18.18-21.746 21.746-1.842.65-6.885 1.884-7.698 1.884-.087 0-.157-5.354-.157-11.898zm6.593-28.908c-.832-1.797-3.163-4.112-5.077-5.04l-1.516-.737v-24.312l.86.143c3.932.654 8.009 1.883 10.605 3.197.997.504 1.237.746 1.09 1.095-.105.246-.248 1.41-.318 2.588-.21 3.51.81 6.268 3.274 8.851 2.522 2.644 5.566 3.844 9.203 3.626 1.178-.07 2.33-.21 2.562-.308.899-.383 3.14 5.934 4.053 11.42l.143.86h-24.238zm32.999.92c-.072-.254-.208-1.117-.303-1.918-.424-3.583-2.227-9.37-4.054-13.007l-.993-1.975.805-1.703c.75-1.591.804-1.905.804-4.76 0-2.994-.02-3.097-.984-5.047-2.928-5.923-9.711-8.388-15.835-5.754l-1.291.555-2.455-1.193c-4.183-2.035-11.226-4.158-13.794-4.158-1.559 0-1.492.355-1.492-7.965v-7.645h.958c.527 0 2.224.185 3.77.412 23.454 3.434 42.977 20.948 48.844 43.818.882 3.439 1.726 8.317 1.726 9.977v.826h-7.788c-7.19 0-7.797-.035-7.918-.463z" ></path> </g> </g> </svg>';
    button.innerHTML = svgIcon;

    label.id = "leaflet-draw-label-particles";
    label.innerHTML = "Click here to start adding particles.";

    L.DomEvent.on(button, "click", this._toggleAdding, this);

    if (!this._canvas) {
      this._initCanvas();
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas);
    } else {
      map._panes.overlayPane.appendChild(this._canvas);
    }
    map.on("moveend", this._reset, this);
    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
    }

    return this._container;
  },
  onRemove: function (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }
    L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
    document.getElementById("map").style.removeProperty("cursor");
    map.off("moveend", this._reset, this);
    if (map.options.zoomAnimation) {
      map.off("zoomanim", this._animateZoom, this);
    }
    this._map.off("click", this._addPoints, this);
  },
  _initCanvas: function () {
    var canvas = (this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-particles-layer leaflet-layer"
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
  update: function (datetime, options) {
    L.Util.setOptions(this, options);
    this._canvas.style.opacity = this.options.opacity;
    this._canvas.style.zIndex = this.options.zIndex + 100;
    this._datetime = parseFloat(datetime);
    this._time_index = this._findClosestIndex(
      this._interpolated_times,
      this._datetime
    );
    this._reset();
  },
  clear: function () {
    this._points = [];
    this._reset();
  },
  _reset: function () {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._width = size.x;
    this._height = size.y;
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._plotPoints();
  },
  _toggleAdding: function (e) {
    e.preventDefault();
    if (this._isAdding) {
      this._disableDrawing();
    } else {
      e.stopPropagation();
      this._enableDrawing();
    }
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
  _createAndFillTwoDArray: function ({ rows, columns, defaultValue }) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => defaultValue)
    );
  },
  _findClosestIndex(arr, target) {
    if (!Array.isArray(arr) || arr.length === 0) {
      return false;
    }

    let closestIndex = 0;
    let closestDifference = Math.abs(target - arr[0]);

    for (let i = 1; i < arr.length; i++) {
      const difference = Math.abs(target - arr[i]);
      if (difference < closestDifference) {
        closestIndex = i;
        closestDifference = difference;
      }
    }
    return closestIndex;
  },
  _enableDrawing: function () {
    this._isAdding = true;
    L.DomUtil.addClass(this._container, "leaflet-draw-enabled");
    document.getElementById("map").style.cursor = "crosshair";
    this._map.on("click", this._addPoints, this);
    document.getElementById("leaflet-draw-label-particles").style.display =
      "none";
  },
  _disableDrawing: function () {
    this._isAdding = false;
    L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
    document.getElementById("map").style.removeProperty("cursor");
    this._map.off("click", this._addPoints, this);
  },
  _getIndexAtPoint(x, y) {
    var i = this.options.nRows - Math.round((y - this._yMin) / this._ySize);
    var j = Math.round((x - this._xMin) / this._xSize);
    if (i > -1 && i < this.options.nRows && j > -1 && j < this.options.nCols) {
      let t = this._transformationMatrix[i][j];
      if (t !== null) {
        return [i, j];
      } else {
        return null;
      }
    } else {
      return null;
    }
  },
  _getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return [r, g, b];
  },
  _addPoints: function (e) {
    var latlng = e.latlng;
    if (this._getIndexAtPoint(e.latlng.lng, e.latlng.lat) !== null) {
      var color = this._getRandomColor();
      for (var i = 0; i < this.options.paths; i++) {
        var angle = Math.random() * Math.PI * 2;
        var randomRadius = Math.random() * this.options.spread;
        var dx = randomRadius * Math.cos(angle);
        var dy = randomRadius * Math.sin(angle);
        var pointLatLng = L.latLng(
          latlng.lat + dy / 111320,
          latlng.lng + dx / (111320 * Math.cos((latlng.lat * Math.PI) / 180))
        );
        if (this._getIndexAtPoint(pointLatLng.lng, pointLatLng.lat) !== null) {
          this._points.push({
            seed: {
              latlng: pointLatLng,
              datetime: this._datetime,
              index: this._time_index,
            },
            path: this._calculatePath(pointLatLng),
            color,
          });
        }
      }
      this._plotPoints();
    }
  },
  _calculatePath: function (latlng) {
    var path = new Array(this._interpolated_times.length).fill(null);
    path[this._time_index] = {
      latlng,
      velocity: this._getVelocity(latlng, this._time_index),
    };
    for (
      let i = this._time_index + 1;
      i < this._interpolated_times.length;
      i++
    ) {
      let timestep =
        (this._interpolated_times[i] - this._interpolated_times[i - 1]) / 1000;
      let new_latlng = this._moveLocation(
        path[i - 1].latlng,
        path[i - 1].velocity,
        timestep
      );
      let new_velocity = this._getVelocity(new_latlng, i);

      if (new_velocity !== null) {
        path[i] = {
          latlng: new_latlng,
          velocity: new_velocity,
        };
      } else {
        path[i] = {
          latlng: path[i - 1].latlng,
          velocity: path[i - 1].velocity,
        };
      }
    }
    return path;
  },
  _getVelocity: function (latlng, time_index) {
    var i =
      this.options.nRows - Math.round((latlng.lat - this._yMin) / this._ySize);
    var j = Math.round((latlng.lng - this._xMin) / this._xSize);
    let t = this._transformationMatrix[i][j];
    let ti = Math.floor(
      (time_index / (this._interpolated_times.length - 1)) *
        (this._times.length - 1)
    );
    var x = this._data[String(this._times[ti])][t[0]][t[1]];
    var y = this._data[String(this._times[ti])][t[0]][t[1] + this._dataWidth];
    if (isNaN(x) || isNaN(y)) {
      return null;
    } else {
      return { x, y };
    }
  },
  _moveLocation: function (latlng, velocity, time) {
    var new_lat =
      latlng.lat + ((velocity.y * time) / 6378137) * (180 / Math.PI);
    var new_lng =
      latlng.lng +
      (((velocity.x * time) / 6378137) * (180 / Math.PI)) /
        Math.cos((latlng.lat * Math.PI) / 180);
    return L.latLng(new_lat, new_lng);
  },
  _plotPoints: function () {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this._ctx.lineWidth = 2;
    this._points.forEach(function (point) {
      if (point.path[this._time_index] !== null) {
        var idx = point.seed.index;
        var arc = this._map.latLngToContainerPoint(
          point.path[this._time_index].latlng
        );
        var start = this._map.latLngToContainerPoint(point.path[idx].latlng);
        var rgb = `${point.color[0]}, ${point.color[1]}, ${point.color[2]}`;
        this._ctx.beginPath();
        this._ctx.moveTo(start.x, start.y);
        //let path_length = this._time_index - idx;
        for (let i = idx; i < this._time_index; i++) {
          let p = this._map.latLngToContainerPoint(point.path[i].latlng);
          this._ctx.strokeStyle = `rgba(${rgb}, ${0.4})`;
          /*this._ctx.strokeStyle = `rgba(${rgb}, ${(
            (i - idx) /
            path_length
          ).toFixed(2)})`;*/
          this._ctx.lineTo(p.x, p.y);
        }
        this._ctx.lineTo(arc.x, arc.y);
        this._ctx.stroke();

        this._ctx.fillStyle = `rgb(${rgb})`;
        this._ctx.beginPath();
        this._ctx.arc(arc.x, arc.y, 4, 0, Math.PI * 2);
        this._ctx.fill();
        this._ctx.closePath();
      }
    }, this);
  },
});

L.control.particleTracking = function (geometry, data, datetime, options) {
  return new L.Control.ParticleTracking(geometry, data, datetime, options);
};
