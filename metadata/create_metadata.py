import json
import boto3
import requests
import functions as func

upload = True
bucket_folder = "static/website/metadata/master"

# Load Metadata
with open("metadata.json") as f:
    metadata = json.load(f)
with open("lakes.geojson") as f:
    shape = json.load(f)

# Load Satellite Data
response = requests.get("https://eawagrs.s3.eu-central-1.amazonaws.com/metadata/metadata.json")
satellite = response.json()

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

s3 = boto3.client('s3')

# Create files
home_list = []
for lake in metadata:
    sat = False
    threed = False
    oned = False
    home = {"key": lake["key"],
            "name": lake["name"],
            "area": lake["area"],
            "elevation": lake["elevation"],
            "max_depth": lake["max_depth"],
            "latitude": lake["latitude"],
            "longitude": lake["longitude"],
            "filters": []
            }
    data = {"metadata": lake.copy()}
    key = lake["key"]
    if 'alplakes' in data["metadata"]:
        home["filters"].append("3D")
        threed = True
        del data["metadata"]['alplakes']
    if 'simstrat' in data["metadata"]:
        del data["metadata"]['simstrat']
    if "simstrat" not in lake:
        lake["simstrat"] = [key]
    if lake["simstrat"] != False:
        oned = True
        home["filters"].append("1D")
    satellite_data = False
    if key in satellite and "sentinel3" in satellite[key]:
        home["filters"].append("satellite")
        satellite_data = satellite[key]
        sat = True
    if "insitu" not in data["metadata"] and "datalakes_id" in data["metadata"]:
        data["metadata"]["insitu"] = func.make_insitu(data["metadata"]["datalakes_id"], datalakes_datasets, datalakes_parameters)
    data["metadata"]["bounds"] = func.make_bounds(shape, key)
    data["metadata"]["bathymetry"] = func.make_bathymetry(lake, datalakes_lakes)
    data["metadata"]["available"] = func.make_available(sat, threed, oned)
    data["modules"] = func.make_modules(lake, satellite_data)
    data["layers"] = func.make_layers(lake, satellite_data)
    data["datasets"] = func.make_datasets(lake, simstrat)

    if "insitu" in data["metadata"] and len(data["metadata"]["insitu"]) > 0:
        home["filters"].append("insitu")
        live = False
        for i in range(len(data["metadata"]["insitu"])):
            if data["metadata"]["insitu"][i]["live"]:
                live = True
        if live:
            home["filters"].append("live")

    with open('files/{}.json'.format(key), 'w') as json_file:
        json_file.write(json.dumps(data, separators=(',', ':'), ensure_ascii=False))
    if upload:
        s3.upload_file(
            'files/{}.json'.format(key),
            'alplakes-eawag',
            '{}/{}.json'.format(bucket_folder, key),
            ExtraArgs={
                'ContentType': 'application/json',
            },
        )
    home_list.append(home)

with open('files/list.json', 'w') as json_file:
    json_file.write(json.dumps(home_list, separators=(',', ':'), ensure_ascii=False))
if upload:
    s3.upload_file(
        'files/list.json',
        'alplakes-eawag',
        '{}/list.json'.format(bucket_folder),
        ExtraArgs={
            'ContentType': 'application/json',
        },
    )
