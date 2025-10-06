import json
import boto3
import requests
import functions as func

upload = True
bucket_folder = "static/website/metadata/master"

# Load Metadata
with open("metadata.json") as f:
    metadata = json.load(f)
with open("catchment.json") as f:
    catchment = json.load(f)
with open("lakes.geojson") as f:
    shape = json.load(f)
with open("satellite_metadata.json") as f:
    satellite_metadata = json.load(f)

# Load Satellite Data
response = requests.get("https://eawagrs.s3.eu-central-1.amazonaws.com/alplakes/metadata/summary.json")
satellite = response.json()

response = requests.get("https://eawagrs.s3.eu-central-1.amazonaws.com/alplakes/metadata/lakes.geojson")
satellite_polygons = response.json()

# Load Datalakes Data
response = requests.get("https://api.datalakes-eawag.ch/selectiontables/lakes")
datalakes_lakes = response.json()
response = requests.get("https://api.datalakes-eawag.ch/datasets")
datalakes_datasets = response.json()
datalakes_datasets = sorted(datalakes_datasets, key=lambda d: d['maxdatetime'], reverse=True)
response = requests.get("https://api.datalakes-eawag.ch/selectiontables/parameters")
datalakes_parameters = response.json()

# Load Simstrat Data
response = requests.get("https://raw.githubusercontent.com/Eawag-AppliedSystemAnalysis/operational-simstrat/master/static/lake_parameters.json")
simstrat = response.json()

# Load Climate Data
response = requests.get("https://alplakes-eawag.s3.eu-central-1.amazonaws.com/simulations/simstrat/ch2018/summary.json")
climate = response.json()

# Load Phosphorus data
response = requests.get("https://alplakes-eawag.s3.eu-central-1.amazonaws.com/static/website/phosphorus.json")
phosphorus = response.json()

# Load water level data
response = requests.get("https://alplakes-eawag.s3.eu-central-1.amazonaws.com/insitu/summary/water_level.geojson")
wl = response.json()
water_levels = list(set([f["properties"]["lake"] for f in wl["features"]]))

s3 = boto3.client('s3')

# Create files
home_list = []
one_dimensional_list = []
three_dimensional_list = []

for lake in metadata:
    add = False
    home = {"key": lake["key"],
            "name": lake["name"],
            "area": lake["area"],
            "elevation": lake["elevation"],
            "max_depth": lake["max_depth"],
            "latitude": lake["latitude"],
            "longitude": lake["longitude"],
            "filters": []
            }
    key = lake["key"]
    data = {"key": key, "name": lake["name"], "properties": {"parameters": {}}}
    layers = {"key": key, "name": lake["name"], "layers": []}


    # Lake Properties
    for p in lake:
        if p in ["area", "ave_depth", "max_depth", "elevation", "type", "volume", "residence_time", "mixing_regime", "geothermal_flux", "trophic_state", "sediment_oxygen_uptake_rate"]:
            data["properties"]["parameters"][p] = lake[p]
    data["properties"]["bounds"] = func.make_bounds(shape, satellite_polygons, key)
    layers["bounds"] = data["properties"]["bounds"]
    bathymetry = func.make_bathymetry(lake, datalakes_lakes)
    if len(bathymetry) > 0:
        data["properties"]["bathymetry"] = bathymetry
    data["properties"]["latitude"] = lake["latitude"]
    data["properties"]["longitude"] = lake["longitude"]
    if "default_depth" in lake:
        data["properties"]["default_depth"] = lake["default_depth"]

    # Catchment
    if key in catchment:
        data["catchmentProperties"] = catchment[key]


    # Trends - doy and past year are added in 1D section
    if key in climate:
        add = True
        data["trends"] = {"climate": {}}
        for model in climate[key]:
            data["trends"]["climate"][model["key"]] = {
                "model": "simstrat",
                "project": "ch2018",
                "key": model["key"],
                "name": model["name"]
              }

    if key in phosphorus["lakes"]:
        if "trends" not in data:
            data["trends"] = {"phosphorus": True}
        else:
            data["trends"]["phosphorus"] = True

    # Three Dimensional Model
    if '3D' in lake:
        add = True
        home["filters"].append("3D")
        for model_id in lake["3D"]["models"].keys():
            response = requests.get("https://alplakes-api.eawag.ch/simulations/metadata/{}/{}".format(lake["3D"]["models"][model_id]["model"],lake["key"]))
            model_metadata = response.json()
            three_dimensional_list.append({
                "link": lake["key"],
                "name": lake["name"]["EN"],
                "model": lake["3D"]["models"][model_id]["name"],
                "LatLng": "{}, {}".format(lake["latitude"], lake["longitude"]),
                "area": lake["area"],
                "elevation": lake["elevation"],
                "depth": lake["max_depth"],
                "timeframe": "{}-{}".format(model_metadata["start_date"][0:4], model_metadata["end_date"][0:4]),
                "overallrmse": lake["3D"]["models"][model_id]["performance"]["rmse"]["overall"]
                })
            if model_id == lake["3D"]["default"]:
                data["forecast"] = { "3d_model": {
                    "key": key,
                    "model": lake["3D"]["models"][lake["3D"]["default"]]["model"],
                    "parameters": ["temperature", "velocity"],
                    "labels": lake["3D"]["3D_temperature"],
                    "performance": lake["3D"]["models"][lake["3D"]["default"]]["performance"]
                }}
        layers["layers"].extend(func.model_layers(lake["3D"]["default"], lake["3D"]["models"]))


    # One Dimensional Model
    if "simstrat" not in lake:
        simstrat_keys = [key]
    elif lake["simstrat"] != False:
        simstrat_keys = lake["simstrat"]
    else:
        simstrat_keys = []
    if len(simstrat_keys) > 0:
        simstrat_oxygen = True
        if "simstrat_oxygen" in lake and lake["simstrat_oxygen"] == False:
            simstrat_oxygen = False
        add = True
        if "forecast" not in data:
            data["forecast"] = {}
        if "trends" not in data:
            data["trends"] = {"doy": {}, "year": {}}
        else:
            data["trends"]["doy"] = {}
            data["trends"]["year"] = {}
        data["forecast"]["1d_model"] = []
        for k in simstrat_keys:
            simstrat_metadata = [s for s in simstrat if s["key"] == k][0]
            response = requests.get(
                "https://alplakes-api.eawag.ch/simulations/1d/metadata/simstrat/{}".format(k))
            model_metadata = response.json()
            one_dimensional_list.append(
                {"link": simstrat_metadata["key"],
                 "name": simstrat_metadata["name"],
                 "model": "Simstrat",
                 "LatLng": "{}, {}".format(simstrat_metadata["latitude"], simstrat_metadata["longitude"]),
                 "area": simstrat_metadata["surface_area"],
                 "elevation": simstrat_metadata["elevation"],
                 "depth": simstrat_metadata["max_depth"],
                 "timeframe": "{}-{}".format(model_metadata["start_date"][0:4], model_metadata["end_date"][0:4]),
                 "overallrmse": round(simstrat_metadata["performance"]["rmse"]["overall"], 2),
                 "surfacermse": round(simstrat_metadata["performance"]["rmse"]["surface"], 2),
                 "bottomrmse": round(simstrat_metadata["performance"]["rmse"]["bottom"], 2)
                 })
            simstrat_parameters = {
                "key": k,
                "model": "Simstrat",
                "name": simstrat_metadata["name"],
                "meteo_source": func.simstrat_forcing_source(simstrat_metadata["forcing"], simstrat_metadata["forcing_forecast"])
            }
            if "performance" in simstrat_metadata:
                simstrat_parameters["performance"] = simstrat_metadata["performance"]
            if "inflows" in simstrat_metadata:
                simstrat_parameters["hydro_source"] = "Bundesamt für Umwelt BAFU"
            if "calibration_source" in simstrat_metadata:
                simstrat_parameters["calibration_source"] = simstrat_metadata["calibration_source"]
            data["forecast"]["1d_model"].append({**simstrat_parameters, "parameter": "T", "unit": "°", "simstrat_oxygen": simstrat_oxygen})
            data["trends"]["doy"][k] = {
                **simstrat_parameters,
                "depths": [0],
                "parameters": [{ "key": "T", "name": "temperature", "unit": "°C" }],
                "displayOptions": {}
            }


            if simstrat_oxygen:
                sp = [
                  { "key": "T", "name": "temperature", "unit": "°C" },
                  { "key": "OxygenSat", "name": "oxygensat", "unit": "%" }
                ]
            else:
                sp = [
                    {"key": "T", "name": "temperature", "unit": "°C"}
                ]
            data["trends"]["year"][k] = {
                **simstrat_parameters,
                "parameters": sp,
                "displayOptions": { "paletteName": "vik", "thresholdStep": 200 }
            }
        home["filters"].append("1D")

    # AI summary
    if "ai_summary" in lake and lake["ai_summary"]:
        if "forecast" not in data:
            data["forecast"] = {"ai_summary": True}
        else:
            data["forecast"]["ai_summary"] = True


    # Measurement Data
    if "current_temperature" in lake and lake["current_temperature"] == True:
        add = True
        data["measurements"] = {"water_temperature": {"displayOptions": {"min": 5,"max": 25,"paletteName": "Bafu Continuous"}}}
        layers["layers"].extend(func.temperature_layers(lake["key"]))
    if key in water_levels:
        add = True
        if "measurements" not in data:
            data["measurements"] = {}
        data["measurements"]["water_levels"] = {}
    if "webcams" in lake:
        add = True
        if "measurements" not in data:
            data["measurements"] = {}
        data["measurements"]["webcams"] = lake["webcams"]
    if "insitu" in lake:
        add = True
        if "measurements" not in data:
            data["measurements"] = {}
        for i in range(len(lake["insitu"])):
            lake["insitu"][i]["source"] = "Datalakes"
        data["measurements"]["scientific"] = lake["insitu"]
        home["filters"].append("insitu")
    elif "datalakes_id" in lake:
        add = True
        insitu = func.make_insitu(lake["datalakes_id"], datalakes_datasets, datalakes_parameters)
        if len(insitu) > 0:
            if "measurements" not in data:
                data["measurements"] = {}
            data["measurements"]["scientific"] = insitu
            home["filters"].append("insitu")


    # Satellite data
    if "flags" not in lake or lake["flags"][0] != "austrian":
        if key in satellite:
            add = True
            satellite_data = []
            layers["layers"].extend(func.satellite_layers(lake["key"], satellite[key]))
            for sat in satellite_metadata:
                sm = []
                for source in sat["sources"]:
                    if source["satellite"] in satellite[key] and source["parameter"] in satellite[key][source["satellite"]]:
                        sm.append(source["link"].replace("#key#", key))
                if len(sm) > 0:
                    temp = sat.copy()
                    temp["key"] = key
                    temp["metadata"] = sm
                    satellite_data.append(temp)
            if len(satellite_data) > 0:
                home["filters"].append("satellite")
                data["satellite"] = satellite_data
    else:
        print("Not adding satellite data for ", key)
    if add:
        with open('files/{}.json'.format(key), 'w') as json_file:
            json_file.write(json.dumps(data, separators=(',', ':'), ensure_ascii=False))
        with open('files/{}_layers.json'.format(key), 'w') as json_file:
            json_file.write(json.dumps(layers, separators=(',', ':'), ensure_ascii=False))
        if upload:
            s3.upload_file(
                'files/{}.json'.format(key),
                'alplakes-eawag',
                '{}/{}.json'.format(bucket_folder, key),
                ExtraArgs={
                    'ContentType': 'application/json',
                },
            )
            s3.upload_file(
                'files/{}_layers.json'.format(key),
                'alplakes-eawag',
                '{}/{}_layers.json'.format(bucket_folder, key),
                ExtraArgs={
                    'ContentType': 'application/json',
                },
            )
        home_list.append(home)

with open('files/list.json', 'w') as json_file:
    json_file.write(json.dumps(home_list, separators=(',', ':'), ensure_ascii=False))
with open('files/one_dimensional.json', 'w') as json_file:
    json_file.write(json.dumps(one_dimensional_list, separators=(',', ':'), ensure_ascii=False))
with open('files/three_dimensional.json', 'w') as json_file:
    json_file.write(json.dumps(three_dimensional_list, separators=(',', ':'), ensure_ascii=False))
if upload:
    s3.upload_file(
        'files/list.json',
        'alplakes-eawag',
        '{}/list.json'.format(bucket_folder),
        ExtraArgs={
            'ContentType': 'application/json',
        },
    )
    s3.upload_file(
        'files/one_dimensional.json',
        'alplakes-eawag',
        '{}/one_dimensional.json'.format(bucket_folder),
        ExtraArgs={
            'ContentType': 'application/json',
        },
    )
    s3.upload_file(
        'files/three_dimensional.json',
        'alplakes-eawag',
        '{}/three_dimensional.json'.format(bucket_folder),
        ExtraArgs={
            'ContentType': 'application/json',
        },
    )
    s3.upload_file(
        'remote_sensing.json',
        'alplakes-eawag',
        '{}/remote_sensing.json'.format(bucket_folder),
        ExtraArgs={
            'ContentType': 'application/json',
        },
    )
    s3.upload_file(
        'performance.json',
        'alplakes-eawag',
        '{}/performance.json'.format(bucket_folder),
        ExtraArgs={
            'ContentType': 'application/json',
        },
    )
    s3.upload_file(
        'lakes.geojson',
        'alplakes-eawag',
        '{}/lakes.geojson'.format(bucket_folder),
        ExtraArgs={
            'ContentType': 'application/json',
        },
    )
