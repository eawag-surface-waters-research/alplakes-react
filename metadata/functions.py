import re


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
            "title": "Temperature and Currents",
            "subtitle": "3D Model",
            "component": "map",
            "labels": {
                "topRight": "5 day forecast"
            },
            "defaults": ["3D_currents", "3D_temperature"]
        })
    if "simstrat" not in data or data["simstrat"] != False:
        modules.append({
            "id": "graph_conditions",
            "title": "Temperature",
            "subtitle": "1D Model",
            "component": "graph",
            "defaults": ["temperature_heatmap"]
        })
    if sd and "sentinel3" in sd and "chla" in sd["sentinel3"]:
        modules.append({
            "id": "satellite_chla",
            "title": "Chlorophyll A",
            "subtitle": "Remote Sensing Product",
            "component": "map",
            "labels": {
                "topRight": "satelliteDatetime",
                "topLeft": "satelliteAverage"
            },
            "defaults": ["satellite_chlorophyll"]
        })
    if sd and (("sentinel3" in sd and "Zsd_lee" in sd["sentinel3"]) or ("sentinel2" in sd and "Z490" in sd["sentinel2"])):
        modules.append({
            "id": "satellite_secchi",
            "title": "Secchi Depth",
            "subtitle": "Remote Sensing Product",
            "component": "map",
            "labels": {
                "topRight": "satelliteDatetime",
                "topLeft": "satelliteAverage"
            },
            "defaults": ["satellite_secchi"]
        })
    if sd and (("sentinel3" in sd and "tsm_binding754" in sd["sentinel3"]) or (
            "sentinel2" in sd and "tsm_dogliotti665" in sd["sentinel2"])):
        modules.append({
            "id": "satellite_turbidity",
            "title": "Turbidity",
            "subtitle": "Remote Sensing Product",
            "component": "map",
            "labels": {
                "topRight": "satelliteDatetime",
                "topLeft": "satelliteAverage"
            },
            "defaults": ["satellite_turbidity"]
        })
    if "alplakes" in data:
        modules.append({
            "id": "threed_thermocline",
            "title": "Thermocline",
            "subtitle": "3D Model",
            "component": "map",
            "labels": {
                "topRight": "5 day forecast"
            },
            "defaults": ["3D_thermocline"]
        })
    if "simstrat" not in data or data["simstrat"] != False:
        modules.append({
            "id": "graph_historic",
            "title": "Historic Temperature Trend",
            "subtitle": "1D Model",
            "component": "graph",
            "defaults": ["temperature_doy"]
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
                    "paletteName": "Balance",
                    "zIndex": 1,
                    "labels": True,
                    "interpolate": True
                },
                "sources": {
                    "alplakes_delft3d": {
                        "type": "alplakes_hydrodynamic",
                        "model": "delft3d-flow",
                        "start": -7,
                        "end": "/simulations/metadata/delft3d-flow/{lake}",
                        "bucket": "/simulations/delft3d-flow/metadata/{lake}/metadata.json",
                        "description": "Water temperatures are hindcasted and forecasted using the 3D hydrodynamic model Delft3D-flow. Meteorological forcing data is produced from Meteoswiss products, hincasts use the Cosmo-1e 1 day deterministic product (VNXQ34) and forecasts use the Cosmo-2e 5 day ensemble forecast (VNXZ32). Where rivers inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measuresuments collected by a number of 3rd parties.",
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
                        "end": "/simulations/metadata/delft3d-flow/{lake}",
                        "bucket": "/simulations/delft3d-flow/metadata/{lake}/metadata.json",
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
                    "paletteName": "navia reverse",
                    "zIndex": 2,
                    "labels": True,
                    "interpolate": True
                },
                "sources": {
                    "alplakes_delft3d": {
                        "type": "alplakes_hydrodynamic",
                        "model": "delft3d-flow",
                        "start": -7,
                        "end": "/simulations/metadata/delft3d-flow/{lake}",
                        "bucket": "/simulations/delft3d-flow/metadata/{lake}/metadata.json",
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
                        "end": "/simulations/metadata/delft3d-flow/{lake}",
                        "bucket": "/simulations/delft3d-flow/metadata/{lake}/metadata.json",
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
                    "paletteName": "Balance",
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
                    "paletteName": "Balance",
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
    if sd and "sentinel3" in sd and "chla" in sd["sentinel3"]:
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
                "paletteName": "Rainbow",
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
                            "metadata": "/metadata/sentinel3/{lake}_chla.json"
                        }
                    ],
                    "bucket": "/metadata/sentinel3/{lake}_chla_latest.json",
                    "description": "Surface chlorophyll concentration processed from satellite data using the Sencast python package.",
                    "learnMore": "https://medium.com/@runnalls.james/water-quality-products-from-remote-sensing-data-using-sencast-e48449bd6aa8",
                    "onActivate": True,
                    "tags": ["Sentinel 3", "2016 - Now"]
                }
            }
        })
    if sd and (("sentinel3" in sd and "Zsd_lee" in sd["sentinel3"]) or ("sentinel2" in sd and "Z490" in sd["sentinel2"])):
        models = []
        bucket = False
        if ("sentinel3" in sd and "Zsd_lee" in sd["sentinel3"]):
            models.append({
                "model": "Sentinel3",
                "metadata": "/metadata/sentinel3/{lake}_Zsd_lee.json"
            }
            )
            bucket = "/metadata/sentinel3/{lake}_Zsd_lee_latest.json"
        if ("sentinel2" in sd and "Z490" in sd["sentinel2"]):
            models.append({
                "model": "Sentinel2",
                "metadata": "/metadata/sentinel2/{lake}_Z490.json"
            })
            if bucket == False:
                bucket = "/metadata/sentinel2/{lake}_Z490_latest.json"

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
                "paletteName": "navia reverse",
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
            "sentinel2" in sd and "tsm_dogliotti665" in sd["sentinel2"])):
        models = []
        bucket = False
        if "sentinel3" in sd and "tsm_binding754" in sd["sentinel3"]:
            models.append({
                "model": "Sentinel3",
                "metadata": "/metadata/sentinel3/{lake}_tsm_binding754.json"
            })
            bucket = "/metadata/sentinel3/{lake}_tsm_binding754_latest.json"
        if "sentinel2" in sd and "tsm_dogliotti665" in sd["sentinel2"]:
            models.append({
                "model": "Sentinel2",
                "metadata": "/metadata/sentinel2/{lake}_tsm_dogliotti665.json"
            })
            if bucket == False:
                bucket = "/metadata/sentinel2/{lake}_tsm_dogliotti665_latest.json"

        layers.append({
            "id": "satellite_turbidity",
            "type": "satellite",
            "playControls": False,
            "depth": False,
            "parameter": "tsm",
            "unit": "g m-3",
            "display": "tiff",
            "source": "sencast",
            "summaryGraph": "satellite_timeseries",
            "displayOptions": {
                "paletteName": "Turbid",
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
    return layers


def simstrat_source(models, obj):
    out = {}
    for model in models:
        s = obj.copy()
        s["lake"] = model
        s["label"] = "Simstrat {}".format(model)
        out["simstrat_{}".format(model)] = s
    return out


def make_datasets(data):
    datasets = []
    if data["simstrat"] != False:
        datasets = [{
            "id": "temperature_heatmap",
            "type": "heatmap",
            "parameter": "temperature",
            "unit": "°C",
            "display": "heat",
            "source": "simstrat_{}".format(data["simstrat"][0]),
            "sources": simstrat_source(data["simstrat"],
                                       {
                                           "data_access": "simstrat_heatmap",
                                           "model": "simstrat",
                                           "parameter": "T",
                                           "description": "Depth time visualisation of water temperature. Water temperatures are hindcasted and forecasted using the 1D hydrodynamic model Simstrat. Meteorological forcing data is produced from Meteoswiss products, hincasts use meteostation data and forecasts use the Cosmo-2e 5 day ensemble forecast (VNXZ32). Where rivers inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measuresuments collected by a number of 3rd parties.",
                                           "learnMore": "https://medium.com/@runnalls.james/operational-1d-lake-modeling-with-simstrat-dc34964bfe08",
                                           "tags": ["5 day forecast", "Timeseries", "Heatmap"]
                                       }),
            "displayOptions": {
                "paletteName": "Balance",
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
                "sources": simstrat_source(data["simstrat"],
                                           {
                                               "data_access": "simstrat_heatmap",
                                               "model": "simstrat",
                                               "parameter": "OxygenSat",
                                               "description": "Depth time visualisation of oxygen saturation. Oxygen values are hindcasted and forecasted using the 1D hydrodynamic model Simstrat in combination with AED2. Meteorological forcing data is produced from Meteoswiss products, hincasts use meteostation data and forecasts use the Cosmo-2e 5 day ensemble forecast (VNXZ32). Where rivers inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measuresuments collected by a number of 3rd parties.",
                                               "learnMore": "https://medium.com/@runnalls.james/operational-1d-lake-modeling-with-simstrat-dc34964bfe08",
                                               "tags": ["5 day forecast", "Timeseries", "Heatmap"]
                                           }),
                "displayOptions": {
                    "paletteName": "Balance",
                    "thresholdStep": 200
                }
            },
            {
                "id": "temperature_doy",
                "type": "doy",
                "parameter": "temperature",
                "unit": "°C",
                "display": "line",
                "source": "simstrat_{}".format(data["simstrat"][0]),
                "sources": simstrat_source(data["simstrat"],
                                           {
                                               "data_access": "simstrat_doy",
                                               "model": "simstrat",
                                               "depths": [0, data["max_depth"]],
                                               "parameter": "T",
                                               "description": "Average DOY water temperature. Water temperatures are hindcasted and forecasted using the 1D hydrodynamic model Simstrat. Meteorological forcing data is produced from Meteoswiss products, hincasts use meteostation data and forecasts use the Cosmo-2e 5 day ensemble forecast (VNXZ32). Where rivers inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measuresuments collected by a number of 3rd parties.",
                                               "learnMore": "https://medium.com/@runnalls.james/operational-1d-lake-modeling-with-simstrat-dc34964bfe08",
                                               "tags": ["Historic Trends", "DOY average"]
                                           }),
                "displayOptions": {
                    "depth": 0
                }
            }
        ]
    return datasets