import re
import requests

def make_bounds(shape, shape2, key):
    s = next((d for d in shape["features"] if "key" in d["properties"]
              and d["properties"]["key"] == key), None)
    if s is None:
        s = next((d for d in shape2["features"] if "key" in d["properties"]
                  and d["properties"]["key"] == key), None)
    coordinates = s["geometry"]["coordinates"][0]
    min_lon = min(coord[0] for coord in coordinates)
    max_lon = max(coord[0] for coord in coordinates)
    min_lat = min(coord[1] for coord in coordinates)
    max_lat = max(coord[1] for coord in coordinates)
    return [[min_lat, min_lon],[max_lat, max_lon]]

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
                    "end": end,
                    "source": "Datalakes"
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
                    "url": "https://www.datalakes-eawag.ch/lakemorphology?{}_{}".format(url_safe(p["name"]), p["id"]),
                    "source": "Datalakes",
                    "format": "Hypsometric curve - JSON",
                    "name": "Vector25",
                    "id": p["name"]
                })

    if "swiss_bathy" in data:
        bathymetry.append({
            "name": "swissBATHY3D",
            "url": "https://www.swisstopo.admin.ch/en/height-model-swissbathy3d#swissBATHY3D---Download",
            "source": "Swisstopo",
            "format": "Bathymetry - XYZ"
        })
    return bathymetry

def model_layers(key):
    return [
    {
      "id": "3D_temperature",
      "type": "threed",
      "playControls": True,
      "depth": True,
      "name": "temperature",
      "parameter": "temperature",
      "unit": "°C",
      "display": "raster",
      "source": "alplakes_delft3d",
      "summaryGraph": "threed_linegraph",
      "displayOptions": {
        "raster": True,
        "profile": True,
        "transect": True,
        "paletteName": "vik",
        "zIndex": 1,
        "interpolate": True
      },
      "sources": {
        "alplakes_delft3d": {
          "model": "delft3d-flow",
          "key": key,
          "description": {
            "EN": "Water temperatures are hindcasted and forecasted using the 3D hydrodynamic model Delft3D-flow. On sunny afternoons, shoreline temperatures can typically be 1-2°C warmer than model predictions due to lake models' large horizontal grid size. Meteorological forcing data is produced from Meteoswiss products, hindcasts use the ICON 1-day deterministic product and forecasts use the ICON 5-day ensemble forecast. Where river inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measurements collected by several 3rd parties.",
            "DE": "Die Wassertemperaturen werden mit dem 3D-hydrodynamischen Modell Delft3D-flow rückwärts berechnet und prognostiziert. An sonnigen Nachmittagen können die Temperaturen an der Küste aufgrund der großen horizontalen Rastergröße der Seemodelle typischerweise 1-2 °C wärmer sein als in den Modellvorhersagen. Meteorologische Antriebsdaten werden aus Meteoswiss-Produkten erzeugt, Rückprognosen verwenden das deterministische 1-Tages-Produkt ICON und Prognosen verwenden die 5-Tages-Ensembleprognose ICON. Wo Flusseingänge verwendet werden, stammen diese Daten von Bafu. Dieses Modell wird mithilfe von vor Ort durchgeführten Messungen kalibriert, die von mehreren Drittanbietern durchgeführt werden.",
            "FR": "Les températures de l'eau sont calculées et prévues à l'aide du modèle hydrodynamique 3D Delft3D-flow. Lors des après-midi ensoleillés, les températures du littoral peuvent généralement être de 1 à 2 °C plus élevées que les prévisions du modèle en raison de la grande taille de la grille horizontale des modèles de lacs. Les données de forçage météorologique sont produites à partir des produits Meteoswiss, les prévisions rétrospectives utilisent le produit déterministe ICON sur 1 jour et les prévisions utilisent la prévision d'ensemble ICON sur 5 jours. Lorsque des données fluviales sont utilisées, ces données proviennent de Bafu. Ce modèle est calibré à l'aide de mesures in situ collectées par plusieurs tiers.",
            "IT": "Le temperature dell'acqua sono retrospettive e previste utilizzando il modello idrodinamico 3D Delft3D-flow. Nei pomeriggi soleggiati, le temperature della costa possono essere in genere più calde di 1-2 °C rispetto alle previsioni del modello a causa delle grandi dimensioni della griglia orizzontale dei modelli lacustri. I dati di forzatura meteorologica sono prodotti da prodotti Meteoswiss, le retrospettive utilizzano il prodotto deterministico ICON a 1 giorno e le previsioni utilizzano la previsione d'insieme ICON a 5 giorni. Laddove vengono utilizzati input fluviali, questi dati provengono da Bafu. Questo modello è calibrato utilizzando misurazioni in situ raccolte da diverse terze parti."
          }
        }
      }
    },
    {
      "id": "3D_currents",
      "type": "threed",
      "playControls": True,
      "depth": True,
      "name": "velocity",
      "parameter": "velocity",
      "unit": "m/s",
      "display": "current",
      "source": "alplakes_delft3d",
      "displayOptions": {
        "raster": False,
        "streamlines": False,
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
          "model": "delft3d-flow",
          "key": key,
          "description": {
            "EN": "Lake currents are hindcasted and forecasted using the 3D hydrodynamic model Delft3D-flow. Meteorological forcing data is produced from Meteoswiss products, hindcasts use the ICON 1-day deterministic product and forecasts use the ICON 5-day ensemble forecast. Where river inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measurements collected by several 3rd parties.",
            "DE": "Seeströmungen werden mit dem 3D-hydrodynamischen Modell Delft3D-flow rückwärts und vorhergesagt. Meteorologische Antriebsdaten werden aus Meteoswiss-Produkten erzeugt, Rückwärtsprognosen verwenden das deterministische 1-Tages-Produkt ICON und Prognosen verwenden die 5-Tages-Ensembleprognose ICON. Wo Flusseingänge verwendet werden, stammen diese Daten vom Bafu. Dieses Modell wird mithilfe von In-situ-Messungen kalibriert, die von mehreren Drittparteien durchgeführt werden.",
            "FR": "Les courants lacustres sont anticipés et prévus à l'aide du modèle hydrodynamique 3D Delft3D-flow. Les données de forçage météorologique sont produites à partir des produits Meteoswiss, les prévisions rétrospectives utilisent le produit déterministe ICON sur 1 jour et les prévisions utilisent la prévision d'ensemble ICON sur 5 jours. Lorsque des données fluviales sont utilisées, ces données proviennent de Bafu. Ce modèle est calibré à l'aide de mesures in situ collectées par plusieurs tiers.",
            "IT": "Le correnti del lago sono hindcast e previste utilizzando il modello idrodinamico 3D Delft3D-flow. I dati di forzatura meteorologica sono prodotti da prodotti Meteoswiss, gli hindcast utilizzano il prodotto deterministico ICON a 1 giorno e le previsioni utilizzano la previsione d'insieme ICON a 5 giorni. Laddove vengono utilizzati input fluviali, questi dati provengono da Bafu. Questo modello è calibrato utilizzando misurazioni in situ raccolte da diverse terze parti."
          }
        }
      }
    },
    {
      "id": "3D_thermocline",
      "type": "threed",
      "playControls": True,
      "depth": False,
      "name": "thermocline",
      "parameter": "thermocline",
      "unit": "m",
      "display": "raster",
      "source": "alplakes_delft3d",
      "displayOptions": {
        "raster": True,
        "paletteName": "navia",
        "zIndex": 2,
        "interpolate": True
      },
      "sources": {
        "alplakes_delft3d": {
          "model": "delft3d-flow",
          "key": key,
          "description": {
            "EN": "Thermocline depth is calculated using Pylake and the 3D hydrodynamic model Delft3D-flow. Meteorological forcing data is produced from Meteoswiss products, hindcasts use the ICON  1-day deterministic product and forecasts use the ICON 5-day ensemble forecast. Where river inputs are used this data is sourced from Bafu. This model is calibrated using in-situ measurements collected by several 3rd parties.",
            "DE": "Die Thermoklinentiefe wird mit Pylake und dem 3D-hydrodynamischen Modell Delft3D-flow berechnet. Meteorologische Antriebsdaten werden aus Meteoswiss-Produkten erzeugt, Rückprognosen verwenden das deterministische 1-Tages-Produkt von ICON und Prognosen verwenden die 5-Tages-Ensembleprognose von ICON. Wo Flusseingänge verwendet werden, stammen diese Daten von Bafu. Dieses Modell wird mithilfe von In-situ-Messungen kalibriert, die von mehreren Drittanbietern durchgeführt werden.",
            "FR": "La profondeur de la thermocline est calculée à l'aide de Pylake et du modèle hydrodynamique 3D Delft3D-flow. Les données de forçage météorologique sont produites à partir des produits Meteoswiss, les prévisions rétrospectives utilisent le produit déterministe ICON à 1 jour et les prévisions utilisent les prévisions d'ensemble ICON à 5 jours. Lorsque des données fluviales sont utilisées, ces données proviennent de Bafu. Ce modèle est calibré à l'aide de mesures in situ collectées par plusieurs tiers.",
            "IT": "La profondità della termoclina è calcolata utilizzando Pylake e il modello idrodinamico 3D Delft3D-flow. I dati di forzatura meteorologica sono prodotti da prodotti Meteoswiss, gli hindcast utilizzano il prodotto deterministico ICON a 1 giorno e le previsioni utilizzano la previsione ensemble ICON a 5 giorni. Laddove vengono utilizzati input fluviali, questi dati provengono da Bafu. Questo modello è calibrato utilizzando misurazioni in situ raccolte da diverse terze parti."
          }
        }
      }
    },
    {
      "id": "3D_particles",
      "type": "threed",
      "playControls": True,
      "depth": True,
      "name": "particles",
      "parameter": "velocity",
      "unit": "m/s",
      "display": "particles",
      "source": "alplakes_delft3d",
      "displayOptions": {
        "paths": 10,
        "spread": 1500,
        "zIndex": 4,
        "particles": True
      },
      "sources": {
        "alplakes_delft3d": {
          "model": "delft3d-flow",
          "key": key,
          "description": {
            "EN": "Track particles using the Alplakes 3D hydrodynamic model. Click the particles button (top left) to add some particles. Press play to see where the particles go.",
            "DE": "Verfolgen Sie Partikel mithilfe des hydrodynamischen 3D-Modells von Alplakes. Klicken Sie auf die Schaltfläche „Partikel“ (oben links), um einige Partikel hinzuzufügen. Drücken Sie die Wiedergabetaste, um zu sehen, wohin die Partikel gehen.",
            "FR": "Suivez les particules à l'aide du modèle hydrodynamique 3D Alplakes. Cliquez sur le bouton Particules (en haut à gauche) pour ajouter des particules. Appuyez sur Lecture pour voir où vont les particules.",
            "IT": "Traccia le particelle usando il modello idrodinamico 3D di Alplakes. Fai clic sul pulsante delle particelle (in alto a sinistra) per aggiungere alcune particelle. Premi play per vedere dove vanno le particelle."
          }
        }
      }
    }]

def temperature_layers(key):
    return [
        {
            "id": "current_temperature",
            "type": "measurements",
            "playControls": False,
            "depth": False,
            "name": "temperature",
            "parameter": "temperature",
            "unit": "°C",
            "display": "points",
            "source": "various",
            "displayOptions": {
                "paletteName": "Bafu Continuous",
                "zIndex": 5,
                "opacity": 1,
                "min": 5,
                "max": 25
            },
            "sources": {
                "various": {
                    "key": key,
                    "url": "https://alplakes-eawag.s3.eu-central-1.amazonaws.com/insitu/summary/water_temperature.geojson",
                    "description": {
                        "EN": "Assorted near real-time surface temperature measurements from several sources.",
                        "DE": "Verschiedene nahezu in Echtzeit durchgeführte Oberflächentemperaturmessungen aus mehreren Quellen.",
                        "FR": "Diverses mesures de température de surface en temps quasi réel provenant de plusieurs sources.",
                        "IT": "Varie misurazioni della temperatura superficiale quasi in tempo reale da diverse fonti."
                    }
                }
            }
        }
    ]

def satellite_layers(key, sd):
    layers = []
    if "sentinel3" in sd and "chla" in sd["sentinel3"]:
        layer = {
                "id": "satellite_chlorophyll",
                "type": "satellite",
                "playControls": False,
                "depth": False,
                "name": "chlorophyll",
                "parameter": "chlorophyll",
                "unit": "mg m-3",
                "display": "tiff",
                "source": "sencast",
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
                    "coverage": 0,
                },
                "sources": {
                    "sencast": {
                        "type": "sencast_tiff",
                        "models": [],
                        "description": {
                            "EN": "Surface chlorophyll concentration is processed from satellite data using the Sencast Python package.",
                            "DE": "Die Chlorophyllkonzentration an der Erdoberfläche wird mithilfe des Python-Pakets Sencast aus Satellitendaten verarbeitet.",
                            "FR": "La concentration de chlorophylle de surface est traitée à partir de données satellites à l'aide du package Python Sencast.",
                            "IT": "La concentrazione di clorofilla in superficie viene elaborata a partire dai dati satellitari utilizzando il pacchetto Python Sencast."
                        }
                    }
                }
            }
        layer["sources"][layer["source"]]["models"].append(
            {
                "model": "Sentinel3",
                "metadata": "/alplakes/metadata/sentinel3/{}/chla.json".format(key)
            }
        )
        layers.append(layer)
    if ("sentinel3" in sd and "Zsd_lee" in sd["sentinel3"]) or ("sentinel2" in sd and "Z490" in sd["sentinel2"]):
        layer = {
          "id": "satellite_secchi",
          "type": "satellite",
          "playControls": False,
          "depth": False,
          "name": "secchi",
          "parameter": "secchi",
          "unit": "m",
          "display": "tiff",
          "source": "sencast",
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
              "models": [],
              "description": {
                "EN": "Secchi depth is processed from satellite data using the Sencast Python package.",
                "DE": "Die Secchi-Tiefe wird mithilfe des Sencast-Python-Pakets aus Satellitendaten verarbeitet.",
                "FR": "La profondeur de Secchi est traitée à partir de données satellites à l'aide du package Python Sencast.",
                "IT": "La profondità di Secchi viene elaborata dai dati satellitari utilizzando il pacchetto Python Sencast."
              }
            }
          }
        }
        if "sentinel3" in sd and "Zsd_lee" in sd["sentinel3"]:
            layer["sources"][layer["source"]]["models"].append(
                {
                    "model": "Sentinel3",
                    "metadata": "/alplakes/metadata/sentinel3/{}/Zsd_lee.json".format(key)
                }
            )
        if "sentinel2" in sd and "Z490" in sd["sentinel2"]:
            layer["sources"][layer["source"]]["models"].append(
                {
                    "model": "Sentinel2",
                    "metadata": "/alplakes/metadata/sentinel2/{}/Z490.json".format(key)
                }
            )
        layers.append(layer)

    if ("sentinel3" in sd and "tsm_binding754" in sd["sentinel3"]) or ("sentinel2" in sd and "tsm_dogliotti665" in sd["sentinel2"]):
        layer = {
          "id": "satellite_turbidity",
          "type": "satellite",
          "playControls": False,
          "depth": False,
          "name": "turbidity",
          "parameter": "turbidity",
          "unit": "FNU",
          "display": "tiff",
          "source": "sencast",
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
              "models": [],
              "description": {
                "EN": "Surface total suspended matter is processed from satellite data using the Sencast Python package.",
                "DE": "Die gesamten Schwebstoffe an der Oberfläche werden mithilfe des Sencast-Python-Pakets aus Satellitendaten verarbeitet.",
                "FR": "La matière totale en suspension de surface est traitée à partir de données satellite à l'aide du package Python Sencast.",
                "IT": "La materia sospesa totale in superficie viene elaborata dai dati satellitari utilizzando il pacchetto Python Sencast."
              }
            }
          }
        }
        if "sentinel3" in sd and "tsm_binding754" in sd["sentinel3"]:
            layer["sources"][layer["source"]]["models"].append(
                {
                    "model": "Sentinel3",
                    "metadata": "/alplakes/metadata/sentinel3/{}/tsm_binding754.json".format(key)
                }
            )
        if "sentinel2" in sd and "tsm_dogliotti665" in sd["sentinel2"]:
            layer["sources"][layer["source"]]["models"].append(
                {
                    "model": "Sentinel2",
                    "metadata": "/alplakes/metadata/sentinel2/{}/tsm_dogliotti665.json".format(key)
                }
            )
        layers.append(layer)

    if ("sentinel3" in sd and "forel_ule" in sd["sentinel3"]) or ("sentinel2" in sd and "forel_ule" in sd["sentinel2"]):
        layer = {
          "id": "satellite_forelule",
          "type": "satellite",
          "playControls": False,
          "depth": False,
          "name": "forelule",
          "parameter": "forelule",
          "unit": "",
          "display": "tiff",
          "source": "sencast",
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
              "models": [],
              "description": {
                "EN": "Water color on the Forel Ule scale is processed from satellite data using the Sencast Python package.",
                "DE": "Die Wasserfarbe auf der Forel-Ule-Skala wird mithilfe des Sencast-Python-Pakets aus Satellitendaten verarbeitet.",
                "FR": "La couleur de l'eau sur l'échelle Forel Ule est traitée à partir de données satellites à l'aide du package Python Sencast.",
                "IT": "Il colore dell'acqua sulla scala Forel Ule viene elaborato dai dati satellitari utilizzando il pacchetto Python Sencast."
              }
            }
          }
        }
        if "sentinel3" in sd and "forel_ule" in sd["sentinel3"]:
            layer["sources"][layer["source"]]["models"].append(
                {
                    "model": "Sentinel3",
                    "metadata": "/alplakes/metadata/sentinel3/{}/forel_ule.json".format(key)
                }
            )
        if "sentinel2" in sd and "forel_ule" in sd["sentinel2"]:
            layer["sources"][layer["source"]]["models"].append(
                {
                    "model": "Sentinel2",
                    "metadata": "/alplakes/metadata/sentinel2/{}/forel_ule.json".format(key)
                }
            )
        layers.append(layer)
    
    if "collection" in sd and "ST" in sd["collection"]:
        layer = {
          "id": "satellite_temperature",
          "type": "satellite",
          "playControls": False,
          "depth": False,
          "name": "temperature",
          "parameter": "temperature",
          "unit": "°C",
          "display": "tiff",
          "source": "sencast",
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
              "models": [],
              "description": {
                "EN": "Landsat Collection 2 Surface Temperature product produced by USGS from Landsat 8 & 9. See the models page for more information.",
                "DE": "Oberflächentemperaturprodukt der Landsat Collection 2, erstellt vom USGS aus Landsat 8 und 9. Weitere Informationen finden Sie auf der Modellseite.",
                "FR": "Produit de température de surface de la collection Landsat 2 réalisé par l'USGS à partir de Landsat 8 et 9. Consultez la page des modèles pour plus d'informations.",
                "IT": "Prodotto della temperatura superficiale Landsat Collection 2 prodotto dall'USGS da Landsat 8 e 9. Per maggiori informazioni, consultare la pagina dei modelli."
              }
            }
          }
        }
        layer["sources"][layer["source"]]["models"].append(
            {
                "model": "Collection",
                "metadata": "/alplakes/metadata/collection/{}/ST.json".format(key)
            }
        )
        layers.append(layer)
    return layers

def simstrat_forcing_source(forcing, forecast):
    meteo_type = forcing[0]["type"]
    out = ""
    if "meteoswiss" in meteo_type.lower():
        out = "SwissMetNet, MeteoSwiss"
    elif "arso" in meteo_type.lower():
        out = "Slovenian Environment Agency"
    elif "mistral" in meteo_type.lower():
        out = "Mistral Meteo-Hub"
    elif "thredds" in meteo_type.lower():
        out = "ESPRI IPSL Thredds"
    elif "geosphere" in meteo_type.lower():
        out = "GeoSphere Austria"
    forecast_type = forecast["source"]
    if "meteoswiss" in forecast_type.lower():
        out = out + ". Forecast from MeteoSwiss ICON."
    elif "visualcrossing" in forecast_type.lower():
        out = out + ". Forecast from VisualCrossing."
    return out
