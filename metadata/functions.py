import re
import requests


def make_bounds(shape, key):
    s = next((d for d in shape["features"] if "key" in d["properties"]
              and d["properties"]["key"] == key), None)
    coordinates = s["geometry"]["coordinates"][0]
    min_lon = min(coord[0] for coord in coordinates)
    max_lon = max(coord[0] for coord in coordinates)
    min_lat = min(coord[1] for coord in coordinates)
    max_lat = max(coord[1] for coord in coordinates)
    return {
        "southWest": [min_lat, min_lon],
        "northEast": [max_lat, max_lon]
    }


def url_safe(string):
    clean = [
        {'b': "ä", 'a': "a"},
        {'b': "ö", 'a': "o"},
        {'b': "ü", 'a': "u"},
        {'b': "è", 'a': "e"},
        {'b': "é", 'a': "e"},
        {'b': "à", 'a': "a"},
        {'b': "ù", 'a': "u"},
        {'b': "â", 'a': "a"},
        {'b': "ê", 'a': "e"},
        {'b': "î", 'a': "i"},
        {'b': "ô", 'a': "o"},
        {'b': "û", 'a': "u"},
        {'b': "ç", 'a': "c"},
        {'b': "ë", 'a': "e"},
        {'b': "ï", 'a': "i"},
        {'b': "ü", 'a': "u"},
        {'b': "ì", 'a': "i"},
        {'b': "ò", 'a': "o"},
        {'b': "ó", 'a': "o"},
    ]
    for edit in clean:
        string = string.replace(edit['b'], edit['a'])

    return re.sub(r'[^a-zA-Z]', '', string).lower()


def make_insitu(datalakes_ids, datasets, datalakes_parameters):
    insitu = []
    if not isinstance(datalakes_ids, list):
        datalakes_ids = [datalakes_ids]
    for datalakes_id in datalakes_ids:
        ds = [d for d in datasets if d["lakes_id"] == datalakes_id and d["mapplotfunction"] == "gitPlot"][:5]
        for d in ds:
            end = d["maxdatetime"][:4]
            if isinstance(d["monitor"], (int, float)):
                end = "Now"
            response = requests.get("https://api.datalakes-eawag.ch/datasetparameters/{}".format(d["id"]))
            parameters = []
            for parameter in response.json():
                if parameter["parameters_id"] not in [1, 2, 3, 4, 10, 27, 28, 29, 30]:
                    p = [d for d in datalakes_parameters if d["id"] == parameter["parameters_id"]][0]
                    parameters.append(p["name"])
            parameters = list(dict.fromkeys(parameters))
            insitu.append(
                {
                    "url": "https://www.datalakes-eawag.ch/datadetail/{}".format(d["id"]),
                    "name": d["title"],
                    "live": isinstance(d["monitor"], (int, float)),
                    "parameters": parameters,
                    "start": d["mindatetime"][:4],
                    "end": end
                })
    return insitu


def make_bathymetry(data, datalakes_lakes):
    bathymetry = []
    if "datalakes_id" in data:
        if isinstance(data["datalakes_id"], list):
            datalakes_ids = data["datalakes_id"]
        else:
            datalakes_ids = [data["datalakes_id"]]
        for i in datalakes_ids:
            p = next(
                (d for d in datalakes_lakes if "id" in d and d["id"] == i), None)
            if p["morphology"]:
                bathymetry.append({
                    "type": "1D",
                    "url": "https://www.datalakes-eawag.ch/lakemorphology?{}_{}".format(url_safe(p["name"]), p["id"]),
                    "source": "Swisstopo Vector25",
                    "format": "JSON",
                    "name": p["name"]
                })

    if "swiss_bathy" in data:
        bathymetry.append({
            "type": "3D",
            "url": "https://www.swisstopo.admin.ch/en/height-model-swissbathy3d#swissBATHY3D---Download",
            "source": "Swisstopo swissBATHY3D",
            "format": "XYZ"
        })
    return bathymetry


def make_available(satellite, threed, oned):
    available = []
    if threed:
        available.append({
            "url": "https://medium.com/@runnalls.james/operational-3d-lake-modeling-with-delft3d-2f164859e753",
            "name": "Delft3D Model",
            "live": True,
            "parameters": ["Water Temperature", "Current", "Thermocline"],
            "start": 2019,
            "end": "5 day forecast",
            "type": "alplakes_hydrodynamic"
        })
    if oned:
        available.append({
            "url": "https://medium.com/@runnalls.james/operational-1d-lake-modeling-with-simstrat-dc34964bfe08",
            "name": "Simstrat 1D Model",
            "live": True,
            "parameters": ["Water Temperature", "Oyxgen", "Ice Cover"],
            "start": 1981,
            "end": "5 day forecast",
            "type": "simstrat"
        })
    if satellite:
        available.append({
            "url": "https://medium.com/@runnalls.james/water-quality-products-from-remote-sensing-data-using-sencast-e48449bd6aa8",
            "name": "Sentinel Satellite Products",
            "live": True,
            "parameters": ["Chlorophyll A", "Secchi Depth", "Turbidity"],
            "start": 2016,
            "end": "Now",
            "type": "sencast_tiff"
        })
    return available


def make_modules(data, sd):
    modules = []
    if "alplakes" in data:
        modules.append({
            "id": "threed_map",
            "title": {
                "EN": "Temperature and Currents",
                "DE": "Temperatur und Strömungen",
                "FR": "Température et courants",
                "IT": "Temperature e Correnti"
            },
            "subtitle": {
                "EN": "3D Model",
                "DE": "3D-Modell",
                "FR": "modèle 3D",
                "IT": "Modello 3D"
            },
            "component": "map",
            "labels": {
                "topRight": "forecast5"
            },
            "defaults": ["3D_currents", "3D_temperature"]
        })
    if "simstrat" not in data or data["simstrat"] != False:
        modules.append({
            "id": "graph_conditions",
            "title": {
                "EN": "Average surface temperature",
                "DE": "Durchschnittliche Oberflächentemperatur",
                "FR": "Température moyenne de surface",
                "IT": "Temperatura superficiale media"
            },
            "subtitle": {
                "EN": "1D Model",
                "DE": "1D-Modell",
                "FR": "modèle 1D",
                "IT": "Modello 1D"
            },
            "component": "graph",
            "labels": {
                "topLeft": "simstratAverage",
                "topRight": "forecast5"
            },
            "defaults": ["temperature_linegraph"]
        })
    if sd and "sentinel3" in sd and "chla" in sd["sentinel3"] and data["key"] != "mondsee":
        modules.append({
            "id": "satellite_chla",
            "title": {
                "EN": "Chlorophyll A",
                "DE": "Chlorophyll A",
                "FR": "Chlorophylle A",
                "IT": "Clorofilla A"
            },
            "subtitle": {
                "EN": "Remote Sensing Product",
                "DE": "Fernerkundungsprodukt",
                "FR": "Produit de télédétection",
                "IT": "Prodotto di telerilevamento"
            },
            "component": "map",
            "labels": {
                "topRight": "satelliteDatetime",
                "topLeft": "satelliteAverage"
            },
            "defaults": ["satellite_chlorophyll"]
        })
    if sd and ("sentinel3" in sd and "Zsd_lee" in sd["sentinel3"]) and data["key"] != "mondsee":
        # or ("sentinel2" in sd and "Z490" in sd["sentinel2"])
        modules.append({
            "id": "satellite_secchi",
            "title": {
                "EN": "Secchi Depth",
                "DE": "Secchi Tiefe",
                "FR": "Profondeur de Secchi",
                "IT": "Profondità Secchi"
            },
            "subtitle": {
                "EN": "Remote Sensing Product",
                "DE": "Fernerkundungsprodukt",
                "FR": "Produit de télédétection",
                "IT": "Prodotto di telerilevamento"
            },
            "component": "map",
            "labels": {
                "topRight": "satelliteDatetime",
                "topLeft": "satelliteAverage"
            },
            "defaults": ["satellite_secchi"]
        })
    if sd and ("sentinel3" in sd and "tsm_binding754" in sd["sentinel3"]) and data["key"] != "mondsee":
        # or ("sentinel2" in sd and "tsm_dogliotti665" in sd["sentinel2"])
        modules.append({
            "id": "satellite_turbidity",
            "title": {
                "EN": "Turbidity",
                "DE": "Trübung",
                "FR": "Turbidité",
                "IT": "Torbidità"
            },
            "subtitle": {
                "EN": "Remote Sensing Product",
                "DE": "Fernerkundungsprodukt",
                "FR": "Produit de télédétection",
                "IT": "Prodotto di telerilevamento"
            },
            "component": "map",
            "labels": {
                "topRight": "satelliteDatetime",
                "topLeft": "satelliteAverage"
            },
            "defaults": ["satellite_turbidity"]
        })
    if sd and ("collection" in sd and "ST" in sd["collection"]):
        modules.append({
            "id": "satellite_temperature",
            "title": {
                "EN": "Surface Temperature",
                "DE": "Oberflächentemperatur",
                "FR": "Température de surface",
                "IT": "Temperatura superficiale"
            },
            "subtitle": {
                "EN": "Remote Sensing Product",
                "DE": "Fernerkundungsprodukt",
                "FR": "Produit de télédétection",
                "IT": "Prodotto di telerilevamento"
            },
            "component": "map",
            "labels": {
                "topRight": "satelliteDatetime",
                "topLeft": "satelliteAverage"
            },
            "defaults": ["satellite_temperature"]
        })
    if "alplakes" in data:
        modules.append({
            "id": "threed_thermocline",
            "title": {
                "EN": "Thermocline",
                "DE": "Thermokline",
                "FR": "Thermocline",
                "IT": "Termoclino"
            },
            "subtitle": {
                "EN": "3D Model",
                "DE": "3D-Modell",
                "FR": "modèle 3D",
                "IT": "Modello 3D"
            },
            "component": "map",
            "labels": {
                "topRight": "forecast5"
            },
            "defaults": ["3D_thermocline"]
        })
    if "simstrat" not in data or data["simstrat"] != False:
        modules.append({
            "id": "graph_depthtime",
            "title": {
                "EN": "Average Temperature",
                "DE": "Durchschnittstemperatur",
                "FR": "Température moyenne",
                "IT": "Temperatura media"
            },
            "subtitle": {
                "EN": "1D Model",
                "DE": "1D-Modell",
                "FR": "modèle 1D",
                "IT": "Modello 1D"
            },
            "component": "graph",
            "defaults": ["temperature_heatmap"]
        })
        modules.append({
            "id": "graph_historic",
            "title": {
                "EN": "Surface annual course",
                "DE": "Oberflächenjahresverlauf",
                "FR": "Cours annuel de surface",
                "IT": "Corso annuale di superficie"
            },
            "subtitle": {
                "EN": "1D Model",
                "DE": "1D-Modell",
                "FR": "modèle 1D",
                "IT": "Modello 1D"
            },
            "component": "graph",
            "defaults": ["temperature_doy"]
        })
    if "current_temperature" in data:
        modules.insert(1, {
            "id": "current_temperature_points",
            "title": {
                "EN": "Current Temperature",
                "DE": "Aktuelle Temperatur",
                "FR": "Température actuelle",
                "IT": "Temperatura attuale"
            },
            "subtitle": {
                "EN": "Measurements",
                "DE": "Messungen",
                "FR": "Des mesures",
                "IT": "Misure"
            },
            "component": "map",
            "defaults": ["current_temperature"]
        })
    return modules


def make_layers(data, sd):
    layers = []
    if "alplakes" in data:
        layers = layers + [
            {
                "id": "3D_temperature",
                "type": "threed",
                "playControls": True,
                "depth": True,
                "parameter": "temperature",
                "unit": "°C",
                "display": "raster",
                "source": "alplakes_delft3d",
                "summaryGraph": "threed_linegraph",
                "displayOptions": {
                    "paletteName": "vik",
                    "zIndex": 1,
                    "labels": True,
                    "interpolate": True
                },
                "sources": {
                    "alplakes_delft3d": {
                        "type": "alplakes_hydrodynamic",
                        "model": "delft3d-flow",
                        "start": -7,
                        "description": "Water temperatures are hindcasted and forecasted using the 3D hydrodynamic model Delft3D-flow. On sunny afternoons, shoreline temperatures can typically be 1-2°C warmer than model predictions due to the large horizontal grid size used in lake models. Meteorological forcing data is produced from Meteoswiss products, hincasts use the Cosmo-1e 1 day deterministic product (VNXQ34) and forecasts use the Cosmo-2e 5 day ensemble forecast (VNXZ32). Where rivers inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measuresuments collected by a number of 3rd parties.",
                        "learnMore": "https://medium.com/@runnalls.james/operational-3d-lake-modeling-with-delft3d-2f164859e753",
                        "tags": ["5 day forecast", "2019 - Now"]
                    }
                },
                "labels": data["alplakes"]["3D_temperature"]
            },
            {
                "id": "3D_currents",
                "type": "threed",
                "playControls": True,
                "depth": True,
                "parameter": "velocity",
                "unit": "m/s",
                "display": "current",
                "source": "alplakes_delft3d",
                "displayOptions": {
                    "raster": False,
                    "streamlines": False,
                    "arrows": True,
                    "vector": True,
                    "paths": 5000,
                    "streamlinesColor": "#ffffff",
                    "arrowsColor": "#000000",
                    "width": 0.5,
                    "fade": 0.97,
                    "duration": 10,
                    "maxAge": 80,
                    "velocityScale": 0.01,
                    "opacity": 0.8,
                    "zIndex": 3,
                    "paletteName": "Thermal"
                },
                "sources": {
                    "alplakes_delft3d": {
                        "type": "alplakes_hydrodynamic",
                        "model": "delft3d-flow",
                        "start": -7,
                        "description": "Lake currents are hindcasted and forecasted using the 3D hydrodynamic model Delft3D-flow. Meteorological forcing data is produced from Meteoswiss products, hincasts use the Cosmo-1e 1 day deterministic product (VNXQ34) and forecasts use the Cosmo-2e 5 day ensemble forecast (VNXZ32). Where rivers inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measuresuments collected by a number of 3rd parties.",
                        "learnMore": "https://medium.com/@runnalls.james/operational-3d-lake-modeling-with-delft3d-2f164859e753",
                        "tags": ["5 day forecast", "2019 - Now"]
                    }
                }
            },
            {
                "id": "3D_thermocline",
                "type": "threed",
                "playControls": True,
                "depth": False,
                "parameter": "thermocline",
                "unit": "m",
                "display": "raster",
                "source": "alplakes_delft3d",
                "summaryGraph": "threed_linegraph",
                "displayOptions": {
                    "paletteName": "navia",
                    "zIndex": 2,
                    "labels": True,
                    "interpolate": True
                },
                "sources": {
                    "alplakes_delft3d": {
                        "type": "alplakes_hydrodynamic",
                        "model": "delft3d-flow",
                        "start": -7,
                        "description": "Thermocline depth calculated using Pylake and the 3D hydrodynamic model Delft3D-flow. Meteorological forcing data is produced from Meteoswiss products, hincasts use the Cosmo-1e 1 day deterministic product (VNXQ34) and forecasts use the Cosmo-2e 5 day ensemble forecast (VNXZ32). Where rivers inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measuresuments collected by a number of 3rd parties.",
                        "learnMore": "https://medium.com/@runnalls.james/operational-3d-lake-modeling-with-delft3d-2f164859e753",
                        "tags": ["5 day forecast", "2019 - Now"]
                    }
                },
                "labels": data["alplakes"]["3D_thermocline"]
            },
            {
                "id": "3D_particles",
                "type": "threed",
                "playControls": True,
                "depth": True,
                "parameter": "particles",
                "unit": "m/s",
                "display": "particles",
                "source": "alplakes_delft3d",
                "displayOptions": {
                    "paths": 10,
                    "spread": 1500,
                    "zIndex": 4
                },
                "sources": {
                    "alplakes_delft3d": {
                        "type": "alplakes_particles",
                        "model": "delft3d-flow",
                        "start": -7,
                        "description": "Track particles using the alplakes 3D hydrodynamic model. Click the particles button (top left) to add some particles. Press play to see where the particles go.",
                        "learnMore": "https://medium.com/@runnalls.james/operational-3d-lake-modeling-with-delft3d-2f164859e753",
                        "tags": ["Interactive", "2019 - Now"]
                    }
                }
            },
            {
                "id": "3D_transect",
                "type": "threed",
                "playControls": False,
                "depth": False,
                "parameter": "transect",
                "unit": "°C",
                "display": "transect",
                "source": "alplakes_delft3d",
                "summaryGraph": "transect_plot",
                "displayOptions": {
                    "paletteName": "vik",
                    "zIndex": 11,
                    "variable": "temperature",
                    "thresholdStep": 200
                },
                "sources": {
                    "alplakes_delft3d": {
                        "type": "alplakes_transect",
                        "model": "delft3d-flow",
                        "variables": ["temperature", "u", "v"],
                        "description": "Explore the inner workings of the lake. The transect tool allows you to cut a slice through the lake and visualise the spatial variations.",
                        "learnMore": "https://medium.com/@runnalls.james/operational-3d-lake-modeling-with-delft3d-2f164859e753",
                        "tags": ["Interactive", "2019 - Now"]
                    }
                }
            },
            {
                "id": "3D_profile",
                "type": "threed",
                "playControls": False,
                "depth": False,
                "parameter": "profile",
                "unit": "°C",
                "display": "profile",
                "source": "alplakes_delft3d",
                "summaryGraph": "profile_plot",
                "displayOptions": {
                    "paletteName": "vik",
                    "zIndex": 11,
                    "variable": "temperature",
                    "thresholdStep": 200
                },
                "sources": {
                    "alplakes_delft3d": {
                        "type": "alplakes_profile",
                        "model": "delft3d-flow",
                        "variables": ["temperature", "u", "v"],
                        "description": "Explore the inner workings of the lake. The profile tool allows you to visualise the temporal variations at a user selected point.",
                        "learnMore": "https://medium.com/@runnalls.james/operational-3d-lake-modeling-with-delft3d-2f164859e753",
                        "tags": ["Interactive", "2019 - Now"]
                    }
                }
            }
        ]
    if "current_temperature" in data:
        layers.append({
            "id": "current_temperature",
            "type": "measurements",
            "playControls": False,
            "depth": False,
            "parameter": "temperature",
            "unit": "°C",
            "display": "points",
            "source": "various",
            "displayOptions": {
                "paletteName": "Bafu Continuous",
                "zIndex": 5,
                "opacity": 1,
                "min": 5,
                "max": 25,
            },
            "sources": {
                "various": {
                    "type": "current_temperature_points",
                    "url": "https://alplakes-eawag.s3.eu-central-1.amazonaws.com/insitu/summary/water_temperature.geojson",
                    "description": "Assorted near real-time temperature measurements from around Switzerland, sourced from Bafu, Kanton Zurich, Kanton Thurgau and Datalakes.",
                    "learnMore": "",
                    "onActivate": True,
                    "tags": ["Measurement", "Now"]
                }
            }
        })
    if sd and "sentinel3" in sd and "chla" in sd["sentinel3"] and data["key"] != "mondsee":
        layers.append({
            "id": "satellite_chlorophyll",
            "type": "satellite",
            "playControls": False,
            "depth": False,
            "parameter": "chla",
            "unit": "mg m-3",
            "display": "tiff",
            "source": "sencast",
            "summaryGraph": "satellite_timeseries",
            "displayOptions": {
                "paletteName": "bamako",
                "zIndex": 2,
                "opacity": 1,
                "convolve": 2,
                "wms": False,
                "min": 0,
                "max": 12,
                "dataMin": 0,
                "dataMax": 12,
                "coverage": 10
            },
            "sources": {
                "sencast": {
                    "type": "sencast_tiff",
                    "models": [
                        {
                            "model": "Sentinel3",
                            "metadata": "/alplakes/metadata/sentinel3/{lake}/chla.json"
                        }
                    ],
                    "bucket": "/alplakes/metadata/sentinel3/{lake}/chla_latest.json",
                    "description": "Surface chlorophyll concentration processed from satellite data using the Sencast python package.",
                    "learnMore": "https://medium.com/@runnalls.james/water-quality-products-from-remote-sensing-data-using-sencast-e48449bd6aa8",
                    "onActivate": True,
                    "tags": ["Sentinel 3", "2016 - Now"]
                }
            }
        })
    if sd and (
            ("sentinel3" in sd and "Zsd_lee" in sd["sentinel3"]) or ("sentinel2" in sd and "Z490" in sd["sentinel2"])) and data["key"] != "mondsee":
        models = []
        bucket = False
        if ("sentinel3" in sd and "Zsd_lee" in sd["sentinel3"]):
            models.append({
                "model": "Sentinel3",
                "metadata": "/alplakes/metadata/sentinel3/{lake}/Zsd_lee.json"
            }
            )
            bucket = "/alplakes/metadata/sentinel3/{lake}/Zsd_lee_latest.json"
        if ("sentinel2" in sd and "Z490" in sd["sentinel2"]):
            models.append({
                "model": "Sentinel2",
                "metadata": "/alplakes/metadata/sentinel2/{lake}/Z490.json"
            })
            if bucket == False:
                bucket = "/alplakes/metadata/sentinel2/{lake}/Z490_latest.json"

        layers.append({
            "id": "satellite_secchi",
            "type": "satellite",
            "playControls": False,
            "depth": False,
            "parameter": "secchi",
            "unit": "m",
            "display": "tiff",
            "source": "sencast",
            "summaryGraph": "satellite_timeseries",
            "displayOptions": {
                "paletteName": "oslo",
                "zIndex": 2,
                "opacity": 1,
                "convolve": 2,
                "wms": False,
                "min": 0,
                "max": 12,
                "dataMin": 0,
                "dataMax": 12,
                "coverage": 10
            },
            "sources": {
                "sencast": {
                    "type": "sencast_tiff",
                    "models": models,
                    "bucket": bucket,
                    "description": "Secchi depth processed from satellite data using the Sencast python package.",
                    "learnMore": "https://medium.com/@runnalls.james/water-quality-products-from-remote-sensing-data-using-sencast-e48449bd6aa8",
                    "onActivate": True,
                    "tags": ["Sentinel 3", "Sentinel 2", "2016 - Now"]
                }
            }
        })
    if sd and (("sentinel3" in sd and "tsm_binding754" in sd["sentinel3"]) or (
            "sentinel2" in sd and "tsm_dogliotti665" in sd["sentinel2"])) and data["key"] != "mondsee":
        models = []
        bucket = False
        if "sentinel3" in sd and "tsm_binding754" in sd["sentinel3"]:
            models.append({
                "model": "Sentinel3",
                "metadata": "/alplakes/metadata/sentinel3/{lake}/tsm_binding754.json"
            })
            bucket = "/alplakes/metadata/sentinel3/{lake}/tsm_binding754_latest.json"
        if "sentinel2" in sd and "tsm_dogliotti665" in sd["sentinel2"]:
            models.append({
                "model": "Sentinel2",
                "metadata": "/alplakes/metadata/sentinel2/{lake}/tsm_dogliotti665.json"
            })
            if bucket == False:
                bucket = "/alplakes/metadata/sentinel2/{lake}/tsm_dogliotti665_latest.json"

        layers.append({
            "id": "satellite_turbidity",
            "type": "satellite",
            "playControls": False,
            "depth": False,
            "parameter": "tsm",
            "unit": "FNU",
            "display": "tiff",
            "source": "sencast",
            "summaryGraph": "satellite_timeseries",
            "displayOptions": {
                "paletteName": "bamako",
                "zIndex": 2,
                "opacity": 1,
                "convolve": 2,
                "wms": False,
                "min": 0,
                "max": 3,
                "dataMin": 0,
                "dataMax": 3,
                "coverage": 10
            },
            "sources": {
                "sencast": {
                    "type": "sencast_tiff",
                    "models": models,
                    "bucket": bucket,
                    "description": "Surface total suspended matter processed from satellite data using the Sencast python package.",
                    "learnMore": "https://medium.com/@runnalls.james/water-quality-products-from-remote-sensing-data-using-sencast-e48449bd6aa8",
                    "onActivate": True,
                    "tags": ["Sentinel 3", "Sentinel 2", "2016 - Now"]
                }
            }
        })
    if sd and "sentinel3" in sd and "forel_ule" in sd["sentinel3"] and data["key"] != "mondsee":
        layers.append({
            "id": "satellite_forelule",
            "type": "satellite",
            "playControls": False,
            "depth": False,
            "parameter": "forelule",
            "unit": "",
            "display": "tiff",
            "source": "sencast",
            "summaryGraph": "satellite_timeseries",
            "displayOptions": {
                "paletteName": "Forel Ule",
                "zIndex": 2,
                "opacity": 1,
                "convolve": 2,
                "wms": False,
                "min": 1,
                "max": 21,
                "dataMin": 1,
                "dataMax": 21,
                "coverage": 10
            },
            "sources": {
                "sencast": {
                    "type": "sencast_tiff",
                    "models": [
                        {
                            "model": "Sentinel3",
                            "metadata": "/alplakes/metadata/sentinel3/{lake}/forel_ule.json"
                        }
                    ],
                    "bucket": "/alplakes/metadata/sentinel3/{lake}/forel_ule_latest.json",
                    "description": "Water color on the Forel Ule scale processed from satellite data using the Sencast python package.",
                    "learnMore": "https://medium.com/@runnalls.james/water-quality-products-from-remote-sensing-data-using-sencast-e48449bd6aa8",
                    "onActivate": True,
                    "tags": ["Sentinel 3", "2024 - Now"]
                }
            }
        })
    if sd and "collection" in sd and "ST" in sd["collection"]:
        layers.append({
            "id": "satellite_temperature",
            "type": "satellite",
            "playControls": False,
            "depth": False,
            "parameter": "temperature",
            "unit": "°C",
            "display": "tiff",
            "source": "sencast",
            "summaryGraph": "satellite_timeseries",
            "displayOptions": {
                "paletteName": "vik",
                "zIndex": 2,
                "opacity": 1,
                "convolve": 2,
                "wms": False,
                "min": 0,
                "max": 30,
                "dataMin": 0,
                "dataMax": 40,
                "coverage": 10
            },
            "sources": {
                "sencast": {
                    "type": "sencast_tiff",
                    "models": [
                        {
                            "model": "Collection",
                            "metadata": "/alplakes/metadata/collection/{lake}/ST.json"
                        }
                    ],
                    "bucket": "/alplakes/metadata/collection/{lake}/ST_latest.json",
                    "description": "Landsat Collection 2 Surface Temperature product produced by USGS from Landsat 8 & 9. See the models page for more information.",
                    "learnMore": "https://medium.com/@runnalls.james/water-quality-products-from-remote-sensing-data-using-sencast-e48449bd6aa8",
                    "onActivate": True,
                    "tags": ["Landsat 8/9", "2013 - Now"]
                }
            }
        })
    return layers


def simstrat_source(models, simstrat, obj):
    out = {}
    for model in models:
        s = obj.copy()
        properties = [d for d in simstrat if d["key"] == model][0]
        meteo_type = properties["forcing"][0]["type"]
        if "meteoswiss" in meteo_type.lower():
            s["meteo_source"] = "SwissMetNet, MeteoSwiss"
        elif "arso" in meteo_type.lower():
            s["meteo_source"] = "Slovenian Environment Agency"
        elif "mistral" in meteo_type.lower():
            s["meteo_source"] = "Mistral Meteo-Hub"
        elif "thredds" in meteo_type.lower():
            s["meteo_source"] = "ESPRI IPSL Thredds"
        elif "geosphere" in meteo_type.lower():
            s["meteo_source"] = "GeoSphere Austria"
        forecast_type = properties["forcing_forecast"]["source"]
        if "meteoswiss" in forecast_type.lower():
            s["meteo_source"] = s["meteo_source"] + ". Forecast from MeteoSwiss ICON."
        elif "visualcrossing" in forecast_type.lower():
            s["meteo_source"] = s["meteo_source"] + ". Forecast from VisualCrossing."
        if "inflows" in properties:
            s["hydro_source"] = "Bundesamt für Umwelt BAFU"
        if "performance" in properties:
            s["performance"] = properties["performance"]
        if "name" in properties:
            s["name"] = properties["name"]
        if "calibration_source" in properties:
            s["calibration_source"] = properties["calibration_source"]
        s["lake"] = model
        s["label"] = "Simstrat {}".format(model)
        out["simstrat_{}".format(model)] = s
    return out


def make_datasets(data, simstrat):
    datasets = []
    if data["simstrat"] != False:
        datasets = [{
            "id": "temperature_heatmap",
            "type": "heatmap",
            "parameter": "temperature",
            "unit": "°C",
            "display": "heat",
            "source": "simstrat_{}".format(data["simstrat"][0]),
            "sources": simstrat_source(data["simstrat"], simstrat,
                                       {
                                           "data_access": "simstrat_heatmap",
                                           "model": "simstrat",
                                           "parameter": "T",
                                           "description": "Depth time visualisation of water temperature. Water temperatures are hindcasted and forecasted using the 1D hydrodynamic model Simstrat.",
                                           "learnMore": "https://medium.com/@runnalls.james/operational-1d-lake-modeling-with-simstrat-dc34964bfe08",
                                           "tags": ["5 day forecast", "Timeseries", "Heatmap"]
                                       }),
            "displayOptions": {
                "paletteName": "vik",
                "thresholdStep": 200
            }
        },
            {
                "id": "oxygen_heatmap",
                "type": "heatmap",
                "parameter": "oxygensat",
                "unit": "%",
                "display": "heat",
                "source": "simstrat_{}".format(data["simstrat"][0]),
                "sources": simstrat_source(data["simstrat"], simstrat,
                                           {
                                               "data_access": "simstrat_heatmap",
                                               "model": "simstrat",
                                               "parameter": "OxygenSat",
                                               "description": "Depth time visualisation of oxygen saturation. Oxygen values are hindcasted and forecasted using the 1D hydrodynamic model Simstrat in combination with AED2. The oxygen model is a preliminary version which works reasonably well for some lakes but is clearly wrong for other lakes.",
                                               "learnMore": "https://medium.com/@runnalls.james/operational-1d-lake-modeling-with-simstrat-dc34964bfe08",
                                               "tags": ["5 day forecast", "Timeseries", "Heatmap"]
                                           }),
                "displayOptions": {
                    "paletteName": "vik",
                    "thresholdStep": 200
                }
            },
            {
                "id": "temperature_linegraph",
                "type": "linegraph",
                "parameter": "temperature",
                "unit": "°C",
                "display": "line",
                "source": "simstrat_{}".format(data["simstrat"][0]),
                "sources": simstrat_source(data["simstrat"], simstrat,
                                           {
                                               "data_access": "simstrat_linegraph",
                                               "model": "simstrat",
                                               "parameter": "T",
                                               "description": "Visualisation of water temperature. Water temperatures are hindcasted and forecasted using the 1D hydrodynamic model Simstrat.",
                                               "learnMore": "https://medium.com/@runnalls.james/operational-1d-lake-modeling-with-simstrat-dc34964bfe08",
                                               "tags": ["5 day forecast", "Timeseries"]
                                           }),
                "displayOptions": {}
            },
            {
                "id": "temperature_doy",
                "type": "doy",
                "parameter": "temperature",
                "unit": "°C",
                "display": "doy",
                "source": "simstrat_{}".format(data["simstrat"][0]),
                "sources": simstrat_source(data["simstrat"], simstrat,
                                           {
                                               "data_access": "simstrat_doy",
                                               "model": "simstrat",
                                               "depths": [0, data["max_depth"]],
                                               "parameter": "T",
                                               "description": "Surface average DOY water temperature. Water temperatures are hindcasted and forecasted using the 1D hydrodynamic model Simstrat.",
                                               "learnMore": "https://medium.com/@runnalls.james/operational-1d-lake-modeling-with-simstrat-dc34964bfe08",
                                               "tags": ["Historic Trends", "DOY average"]
                                           }),
                "displayOptions": {
                    "depth": 0
                }
            }
        ]
    return datasets
