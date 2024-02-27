import "./style.css";
import mapObj from "./js/map";
import Draw, { createBox } from "ol/interaction/Draw";
import {
  lineSource,
  lineVector,
  squareSource,
  squareVector,
  polygonSource,
  polygonVector,
  markerSource,
  markerVector,
} from "./js/shapes";
import GeoJSON from "ol/format/GeoJSON";
import LayerGroup from 'ol/layer/Group';
import KML from "ol/format/KML";
import { downloadKml, downloadgeoJson } from "./js/downloader";


function checkLayers(value, checked) {
  mapObj.getLayers().array_.forEach((elm) => {
    let subLayerName = elm.get("name");

    if (subLayerName !== "Basemap") {
      if (checked && subLayerName === value) {
        elm.setVisible(true);
      } else if (value === subLayerName) {
        elm.setVisible(false);
      } else {
        console.log("Layer not present");
      }
    }
  });
}

const temp = document.querySelector("#temp");
const selectedLayer = document.querySelector("select");

selectedLayer.addEventListener("change", (e) => {
  let value = e.target.value;

  mapObj.getLayers().array_.forEach((elm, index) => {
    let subLayerName = elm.get("name");
    let isLayerVisible = elm.getVisible();
    if (subLayerName !== "Basemap") {
      if (value !== "sublayer") {
        if (subLayerName === value) {
          temp.innerHTML = `
          <tr>
              <th>1</th>
              <th>${subLayerName}</th>
              <th >${isLayerVisible ? "active" : "Inactive"}</th>
            </tr>
          `;
        }
      } else {
        let val = mapObj.getLayers().array_.map((elm, index) => {

          return `
            <tr>
            <th>${index}</th>
            <th>${elm.get("name")}</th>
            <th> ${elm.getVisible() ? "active" : "Inactive"} </th>
          </tr>
            `;
        });

        temp.innerHTML = val.slice(2,4).join('')
      }
    }
  });
});

const sublayers = document.querySelectorAll("input[name='sublayer']");

for (let index = 0; index < sublayers.length; index++) {
  sublayers[index].addEventListener("click", (e) => {
    let checked = e.target.checked;
    let value = e.target.value;

    if (value === "sublayer" && checked === true) {
      for (let j = 1; j < sublayers.length; j++) {
        let value = sublayers[j].value;
        if (value !== "sublayer1") {
          sublayers[j].checked = true;
          let checked = sublayers[j].checked;
          checkLayers(value, checked);
        }
      }
    } else if (value === "sublayer" && checked === false) {
      for (let j = 1; j < sublayers.length; j++) {
        let value = sublayers[j].value;
        if (value !== "sublayer1") {
          sublayers[j].checked = false;
          let checked = sublayers[j].checked;
          checkLayers(value, checked);
        }
      }
    }

    checkLayers(value, checked);
  });
}

// layer switcher

const layers = document.querySelector("#layers");

layers.addEventListener("change", (e) => {
  let value = e.target.value;

  //window.alllayers = mapObj.getAllLayers()

  mapObj.getLayers().array_.forEach((elm) => {
    if (elm instanceof LayerGroup) {
      elm.values_.layers.array_.forEach((layerGroupItem) => {
        const layerName1 = layerGroupItem.get("name");
        layerGroupItem.setVisible(layerName1 === value);
      });
    }
  });
});

// draw shapes

window.source = markerSource;

const shapes = document.querySelector("#shapes");
let lineDraw, markerDraw, squareDraw, polygonDraw;

shapes.addEventListener("change", (e) => {
  mapObj.removeInteraction(lineDraw);
  mapObj.removeInteraction(markerDraw);
  mapObj.removeInteraction(squareDraw);
  mapObj.removeInteraction(polygonDraw);
  let type = e.target.value;

  switch (type) {
    case "line":
      type = "LineString";

      lineDraw = new Draw({
        source: lineSource,
        type: type,
        stopClick: false,
      });
      mapObj.addInteraction(lineDraw);

      lineDraw.on("drawend", (e) => {
        lineDraw.setActive(false);
      });

      break;
    case "square":
      type = "Circle";

      squareDraw = new Draw({
        source: squareSource,
        type: type,
        stopClick: false,
        geometryFunction: createBox(),
      });
      mapObj.addInteraction(squareDraw);

      squareDraw.on("drawend", (e) => {
        squareDraw.setActive(false);
      });

      break;

    case "polygon":
      type = "Polygon";
      polygonDraw = new Draw({
        source: polygonSource,
        type: type,
        stopClick: false,
      });

      mapObj.addInteraction(polygonDraw);
      polygonDraw.on("drawend", (e) => {
        polygonDraw.setActive(false);
      });
      break;

    case "point":
      type = "Point";
      markerDraw = new Draw({
        source: markerSource,
        type: type,
        stopClick: false,
      });
      mapObj.addInteraction(markerDraw);
      markerDraw.on("drawend", (e) => {
        markerDraw.setActive(false);
      });

      break;

    default:
      console.log(" Not in option ");
      break;
  }

  e.target.checked = false;
});

// download data

const getKML = (features) => {
  const formatKml = new KML();
  const kml = formatKml.writeFeatures(features, {
    featureProjection: "EPSG:3857",
  });
  return kml;
};

const getGeoJson = (features) => {
  const formatGeojson = new GeoJSON();
  const geojson = formatGeojson.writeFeatures(features, {
    featureProjection: "EPSG:3857",
  });
  const parseJson = JSON.parse(geojson);
  const f = parseJson.features;
  for (const i of f) {
    i.properties = {};
  }
  return JSON.stringify(parseJson);
};

const getAllfeatures = (lineVal, squareVal, polygonVal, markerVal) => {
  let features = [];

  lineVal.forEach((l) => {
    features.push(l);
  });
  squareVal.forEach((l) => {
    features.push(l);
  });
  polygonVal.forEach((l) => {
    features.push(l);
  });
  markerVal.forEach((l) => {
    features.push(l);
  });

  return features;
};

const format = document.querySelector("#format");

format.addEventListener("change", (e) => {
  const lineVal = lineSource.getFeatures();
  const squareVal = squareSource.getFeatures();
  const polygonVal = polygonSource.getFeatures();
  const markerVal = markerSource.getFeatures();
  const allFeatures = getAllfeatures(lineVal, squareVal, polygonVal, markerVal);

  const value = e.target.value;
  switch (value) {
    case "kml":
      const kml = getKML(allFeatures);
      downloadKml(kml);
      break;

    case "geojson":
      const geojson = getGeoJson(allFeatures);
      downloadgeoJson(geojson);
      break;

    default:
      console.log("value error");
      break;
  }
});
