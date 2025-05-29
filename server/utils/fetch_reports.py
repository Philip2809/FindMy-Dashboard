import os

from utils.login import get_account_sync
from findmy import KeyPair
from findmy.reports import RemoteAnisetteProvider
import influxdb_client, os, time
from influxdb_client import Point
from influxdb_client.client.write_api import SYNCHRONOUS
from models.key import Key

token = os.getenv("INFLUXDB_TOKEN")
org = os.getenv("INFLUXDB_ORG")
url = os.getenv("INFLUXDB_URL")
bucket = os.getenv("INFLUXDB_BUCKET")
anisette_server = os.getenv("ANISETTE_SERVER")

write_client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)
write_api = write_client.write_api(write_options=SYNCHRONOUS)

def get_reports(keys: list[str]):
    keys = [KeyPair.from_b64(key) for key in keys]
    acc = get_account_sync(
        RemoteAnisetteProvider(anisette_server),
    )
    reports = acc.fetch_last_reports(keys)
    points = []
    result = {}
    for key in reports:
        print(key, len(reports[key]))
        result[key.hashed_adv_key_b64] = len(reports[key])
        for report in sorted(reports[key]):
            point = (
                Point(report.hashed_adv_key_b64)
                .field("latitude", report.latitude)
                .field("longitude", report.longitude)
                .field("confidence", report.confidence)
                .field("horizontal_accuracy", report.horizontal_accuracy)
                .field("status", report.status)
                .field("published_at", time.mktime(report.published_at.timetuple()) * 1000)
                .time(report.timestamp)
            )
            points.append(point)
            
    
    write_api.write(bucket=bucket, org=org, record=points)
    return result