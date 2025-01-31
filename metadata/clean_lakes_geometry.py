import json

def round_coordinates(geometry, precision=4):
    if isinstance(geometry, list):
        return [round_coordinates(coord, precision) for coord in geometry]
    elif isinstance(geometry, (int, float)):
        return round(geometry, precision)
    return geometry

with open("lakes.geojson", "r") as f:
    data = json.load(f)

if "features" in data:
    for feature in data["features"]:
        if "geometry" in feature and "coordinates" in feature["geometry"]:
            feature["geometry"]["coordinates"] = round_coordinates(feature["geometry"]["coordinates"])

with open("lakes_new.geojson", "w") as f:
    json.dump(data, f, separators=(",", ":"))