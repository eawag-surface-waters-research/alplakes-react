import io
import json
import math
import os
import struct
import time
import zipfile
from datetime import datetime, timedelta, timezone

import boto3
import requests

upload = True
bucket_folder = "static/website/metadata/master"
bucket = "https://alplakes-eawag.s3.eu-central-1.amazonaws.com"

CMR_GRANULES_URL = "https://cmr.earthdata.nasa.gov/search/granules.json"
WATER_LEVEL_URL = ("https://alplakes-eawag.s3.eu-central-1.amazonaws.com/"
                   "insitu/summary/water_level.geojson")
LAKESP_SHORT_NAME = "SWOT_L2_HR_LakeSP_prior_D"
GRANULE_CACHE = ".cache/swot_granules"

# National vertical datums as EPSG vertical CRS codes, preferred realisation first.
NATIONAL_DATUMS = {
    "CH": [("LN02", 5728), ("LHN95", 5729)],
    "FR": [("NGF-IGN69", 5720)],
    "DE": [("DHHN2016", 7837)],
    "AT": [("GHA", 5778), ("EVRF2000-Austria", 9274)],
    "IT": [("Genova1942", 5214)],
    "SI": [("SVS2010", 8690)],
}
VALIDATED_DATUMS = {"LN02"}

MAX_MATCH_DISTANCE_KM = 25.0
MAX_AREA_RATIO = 3.0
# Alpine national datums all sit within a couple of metres of EGM2008; anything beyond this is
# a null transformation rather than a real separation.
MAX_DATUM_DIFFERENCE_M = 3.0
MIN_PLAUSIBLE_SEPARATION_M = 1.0
PROBE_HEIGHT_M = 500.0
RETRY_FAILED_AFTER_DAYS = 30


def read_dbf(blob):
    """Minimal dBase III reader. Only the shapefile attributes are needed, not geometry."""
    n_records, header_length, record_length = struct.unpack("<IHH", blob[4:12])

    fields = []
    offset = 32
    while blob[offset] != 0x0D:
        name = blob[offset:offset + 11].split(b"\0")[0].decode("latin1")
        fields.append((name, blob[offset + 16]))
        offset += 32

    records = []
    for index in range(n_records):
        start = header_length + index * record_length
        row = blob[start:start + record_length]
        if not row or row[:1] == b"*":  # deleted record
            continue
        position = 1
        record = {}
        for name, length in fields:
            record[name] = row[position:position + length].decode("latin1").strip()
            position += length
        records.append(record)
    return records


def haversine_km(lat1, lon1, lat2, lon2):
    radius = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = phi2 - phi1
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


def cmr_granules(bbox, days=180, page_size=100):
    """Prior lake granules intersecting a bounding box, oldest first.

    CMR's granule geometry is the whole pass footprint rather than the observed swath, so a
    hit does not mean the lake was seen -- a granule returned for Lake Bled turned out to hold
    23199 lakes spanning latitudes 36-71 with none closer than 1092 km. Granules are therefore
    unioned into one index rather than trusted individually.
    """
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    params = {
        "short_name": LAKESP_SHORT_NAME,
        "bounding_box": "{},{},{},{}".format(*bbox),
        "temporal": "{},{}".format(start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                                   end.strftime("%Y-%m-%dT%H:%M:%SZ")),
        "page_size": page_size,
    }
    for attempt in range(3):
        try:
            response = requests.get(CMR_GRANULES_URL, params=params, timeout=120)
            response.raise_for_status()
            break
        except requests.RequestException:
            if attempt == 2:
                raise
            time.sleep(5 * (attempt + 1))

    granules = []
    for entry in response.json()["feed"]["entry"]:
        links = [link["href"] for link in entry.get("links", [])
                 if link.get("rel", "").endswith("/data#") and link["href"].endswith(".zip")]
        if links:
            granules.append({"title": entry["title"], "url": links[0],
                             "size": float(entry.get("granule_size", 0))})
    return granules


def download_granule(session, url):
    """Fetch a granule, caching it locally. Auth comes from ~/.netrc via requests."""
    os.makedirs(GRANULE_CACHE, exist_ok=True)
    path = os.path.join(GRANULE_CACHE, url.rsplit("/", 1)[-1])
    if os.path.exists(path):
        with open(path, "rb") as file:
            return file.read()

    response = session.get(url, timeout=600)
    if response.status_code in (401, 403):
        raise RuntimeError("PO.DAAC refused the download. Resolving SWOT lake ids needs a "
                           "'machine urs.earthdata.nasa.gov' entry in ~/.netrc "
                           "(free account at https://urs.earthdata.nasa.gov).")
    response.raise_for_status()
    with open(path, "wb") as file:
        file.write(response.content)
    return response.content


def granule_records(session, url):
    """The prior lake attribute records held in one granule."""
    blob = download_granule(session, url)
    archive = zipfile.ZipFile(io.BytesIO(blob))
    name = next(n for n in archive.namelist() if n.lower().endswith(".dbf"))
    return read_dbf(archive.read(name))


def build_prior_index(session, lakes, days=180, max_granules=40):
    """Union prior lakes from granules over the region until every lake is matched.

    One granule covers the whole of Europe, so a handful of passes usually resolves
    everything; downloading stops as soon as nothing is left unmatched.
    """
    bbox = (min(l["longitude"] for l in lakes) - 0.2,
            min(l["latitude"] for l in lakes) - 0.2,
            max(l["longitude"] for l in lakes) + 0.2,
            max(l["latitude"] for l in lakes) + 0.2)
    granules = cmr_granules(bbox, days=days)
    print("  {} granules cover the region".format(len(granules)))

    index = {}
    matches = {}
    for number, granule in enumerate(granules[:max_granules], start=1):
        try:
            records = granule_records(session, granule["url"])
        except Exception as error:
            print("  granule {} failed, {}".format(granule["title"][:48], error))
            continue
        for record in records:
            index.setdefault(record.get("lake_id"), record)

        for lake in lakes:
            if lake["key"] in matches:
                continue
            found = match_prior_lake(index.values(), lake["latitude"], lake["longitude"],
                                     lake.get("area"))
            if found:
                matches[lake["key"]] = found
        print("  granule {}/{}: {} prior lakes indexed, {}/{} lakes matched".format(
            number, min(len(granules), max_granules), len(index), len(matches), len(lakes)))
        if len(matches) == len(lakes):
            break
    return matches


def match_prior_lake(records, latitude, longitude, area):
    """The prior lake nearest the lake centre whose area is comparable.

    Alplakes coordinates are lake centres, so nearest-centroid matching works directly. Area
    agreement is what stops a small pond next to a large lake being picked.
    """
    best = None
    for record in records:
        try:
            record_lat = float(record["p_lat"])
            record_lon = float(record["p_lon"])
            record_area = float(record["p_ref_area"])
        except (KeyError, ValueError):
            continue
        distance = haversine_km(latitude, longitude, record_lat, record_lon)
        if distance > MAX_MATCH_DISTANCE_KM or record_area <= 0:
            continue
        if area and area > 0:
            ratio = record_area / area
            if ratio > MAX_AREA_RATIO or ratio < 1.0 / MAX_AREA_RATIO:
                continue
        if best is None or distance < best["match_dist_km"]:
            best = {
                "lake_id": record["lake_id"],
                # lake_name is a ';'-separated list of every named feature merged into the
                # prior lake, in no useful order, so it is kept whole.
                "lake_name": record.get("lake_name", ""),
                "p_lat": record_lat,
                "p_lon": record_lon,
                "p_ref_area": round(record_area, 4),
                "match_dist_km": round(distance, 2),
            }
    return best


def enable_proj_network():
    """The vertical grids are fetched from the PROJ CDN, so networking must be on."""
    os.environ.setdefault("PROJ_NETWORK", "ON")
    import pyproj
    pyproj.network.set_network_enabled(True)


def egm2008_undulation(latitude, longitude):
    from pyproj import Transformer
    transformer = Transformer.from_pipeline(
        "+proj=pipeline +step +proj=vgridshift +grids=us_nga_egm08_25.tif +multiplier=1")
    _, _, undulation = transformer.transform(longitude, latitude, 0.0)
    return undulation


def national_separation(latitude, longitude, epsg):
    """Ellipsoidal to national datum separation, or None if PROJ has no real grid for it."""
    from pyproj import CRS
    from pyproj.transformer import TransformerGroup
    try:
        group = TransformerGroup(CRS("EPSG:4979"), CRS("EPSG:4326+{}".format(epsg)),
                                 always_xy=True)
    except Exception:
        return None
    for transformer in group.transformers:
        try:
            _, _, height = transformer.transform(longitude, latitude, PROBE_HEIGHT_M)
        except Exception:
            continue
        if height is None or height != height:  # NaN
            continue
        separation = PROBE_HEIGHT_M - height
        # A null transformation returns the height unchanged, i.e. a separation of zero.
        if abs(separation) < MIN_PLAUSIBLE_SEPARATION_M:
            continue
        return separation
    return None


def datum_offsets(latitude, longitude, countries):
    """Per-country conversion from SWOT wse to a national height.

    Two numbers are stored per country:

      separation_m  H_national = wse + geoid_hght - separation_m     (exact, preferred)
      offset_m      H_national = wse + offset_m                      (convenient constant)

    The DAG stores geoid_hght with every pass, so the first form should be used: SWOT's own
    geoid_hght is an area-weighted mean over the observed pixels and differs from the gridded
    EGM2008 value at the centroid by up to ~0.07 m on Lac Leman, which is exactly the error
    the constant form carries.

    Everything is evaluated at the lake centroid, so a country whose grid does not reach it
    gets null rather than a value borrowed from elsewhere. Bodensee's centroid lies in
    German/Swiss water, so Austria has no offset there.
    """
    undulation = egm2008_undulation(latitude, longitude)
    offsets = {}
    for country in countries:
        entry = {"datum": None, "separation_m": None, "offset_m": None, "validated": False,
                 "note": "no PROJ grid covering this lake for this datum"}
        for name, epsg in NATIONAL_DATUMS.get(country.upper(), []):
            separation = national_separation(latitude, longitude, epsg)
            if separation is None:
                continue
            if abs(undulation - separation) > MAX_DATUM_DIFFERENCE_M:
                continue  # a null or ballpark transformation slipped through
            entry = {
                "datum": name,
                "epsg": epsg,
                "separation_m": round(separation, 4),
                "offset_m": round(undulation - separation, 4),
                "validated": name in VALIDATED_DATUMS,
                "note": None,
            }
            break
        offsets[country.upper()] = entry
    return round(undulation, 4), offsets


def load_cache(local_path, url):
    """The existing cache, preferring the local copy over the published one."""
    if os.path.exists(local_path):
        try:
            with open(local_path) as file:
                return json.load(file)
        except (ValueError, OSError):
            pass
    try:
        response = requests.get(url, timeout=60)
        if response.status_code == 200:
            return response.json()
    except (requests.RequestException, ValueError):
        pass
    return {}


def needs_resolving(entry, countries):
    """Whether a cached lake should be attempted again."""
    if entry is None:
        return True
    if entry.get("lake_id") is None:
        # Unresolvable lakes are retried occasionally rather than every run.
        try:
            attempted = datetime.fromisoformat(entry["resolved"].replace("Z", "+00:00"))
        except (KeyError, AttributeError, ValueError):
            return True
        age = datetime.now(timezone.utc) - attempted
        return age > timedelta(days=RETRY_FAILED_AFTER_DAYS)
    if sorted(entry.get("offsets", {}).keys()) != sorted(c.upper() for c in countries):
        return True  # the lake's countries changed since it was resolved
    return False


def build(lakes, local_path="files/swot.json",
          published_url="https://alplakes-eawag.s3.eu-central-1.amazonaws.com/"
                        "swot/metadata.json"):
    """Update the SWOT lake cache for a list of Alplakes lakes.

    lakes: iterable of dicts with key, latitude, longitude, area and countries.
    Returns the cache dict, which the caller writes and uploads.
    """
    cache = load_cache(local_path, published_url)
    keys = {lake["key"] for lake in lakes}
    cache = {key: entry for key, entry in cache.items() if key in keys}

    pending = [lake for lake in lakes
               if needs_resolving(cache.get(lake["key"]), lake.get("countries", []))]
    if not pending:
        print("SWOT cache up to date ({} lakes)".format(len(cache)))
        return cache

    try:
        enable_proj_network()
    except ImportError:
        print("SWOT cache: pyproj unavailable, keeping the existing cache unchanged. "
              "Run create_metadata.py from an environment with pyproj to resolve "
              "{} new lake(s).".format(len(pending)))
        return cache

    print("SWOT cache: resolving {} lake(s), this is slow the first time".format(len(pending)))
    session = requests.Session()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    matches = build_prior_index(session, pending)

    for lake in pending:
        key = lake["key"]
        countries = [c.upper() for c in lake.get("countries", [])]
        try:
            match = matches.get(key)
            if not match:
                cache[key] = {"lake_id": None, "offsets": {}, "resolved": now,
                              "note": "no SWOT prior lake matched this location"}
                print("  {}: no prior lake matched".format(key))
                continue

            undulation, offsets = datum_offsets(match["p_lat"], match["p_lon"], countries)
            match["egm2008_undulation_m"] = undulation
            match["offsets"] = offsets
            match["resolved"] = now
            cache[key] = match
            summary = "  ".join(
                "{}:{:+.3f}".format(country, values["offset_m"])
                if values["offset_m"] is not None else "{}:none".format(country)
                for country, values in offsets.items())
            print("  {}: {} ({:.1f} km2, {} km away)  {}".format(
                key, match["lake_id"], match["p_ref_area"], match["match_dist_km"], summary))
        except Exception as error:
            # One bad lake must not abandon the rest of the run.
            print("  {}: failed, {}".format(key, error))

    return cache


def load_lakes():
    """The lake list, preferring a local create_metadata.py run over the published copy."""
    if os.path.exists("files/list.json"):
        with open("files/list.json") as file:
            return json.load(file)
    response = requests.get("{}/{}/list.json".format(bucket, bucket_folder), timeout=60)
    if response.status_code != 200:
        raise ValueError("Unable to access {}/{}/list.json".format(bucket, bucket_folder))
    return response.json()


def insitu_water_level_lakes():
    """Lakes with in situ water level measurements, which have no need for SWOT."""
    response = requests.get(WATER_LEVEL_URL, timeout=60)
    if response.status_code != 200:
        raise ValueError("Unable to access {}".format(WATER_LEVEL_URL))
    return {feature["properties"]["lake"] for feature in response.json()["features"]}


if __name__ == "__main__":
    lakes = load_lakes()
    water_levels = insitu_water_level_lakes()
    lakes = [lake for lake in lakes if lake["key"] not in water_levels]
    print("{} lakes, in situ water level data covers the rest".format(len(lakes)))
    swot = build(lakes)

    with open('files/swot.json', 'w') as json_file:
        json_file.write(json.dumps(swot, separators=(',', ':'), ensure_ascii=False))

    resolved = len([lake for lake in swot.values() if lake.get("lake_id")])
    print("{} of {} lakes resolved to a SWOT prior lake".format(resolved, len(swot)))

    if upload:
        s3 = boto3.client('s3')
        s3.upload_file(
            'files/swot.json',
            'alplakes-eawag',
            'swot/metadata.json',
            ExtraArgs={
                'ContentType': 'application/json',
            },
        )
        print("Uploaded to {}/swot/metadata.json".format(bucket))
