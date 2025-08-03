import os

from utils.login import ShowMessage, get_account
from findmy import KeyPair
import influxdb_client, os
from influxdb_client import Point
from influxdb_client.client.write_api import SYNCHRONOUS

token = os.getenv("INFLUXDB_TOKEN")
org = os.getenv("INFLUXDB_ORG")
url = os.getenv("INFLUXDB_URL")
bucket = os.getenv("INFLUXDB_BUCKET")
anisette_server = os.getenv("ANISETTE_SERVER")

write_client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)
write_api = write_client.write_api(write_options=SYNCHRONOUS)

def get_reports(keys: list[str]):
    keys = [KeyPair.from_b64(key) for key in keys]
    accORshowMessage = get_account()
    if isinstance(accORshowMessage, ShowMessage):
        return accORshowMessage.to_json()

    try:
        reports = accORshowMessage.fetch_last_reports(keys)
    except Exception as e:
        return ShowMessage(f"Failed to fetch reports, most likely you need to redo 2FA. Error from FindMy.py: {e}", 500).to_json()
    points = []
    for key in reports:
        # print(key, len(reports[key])) # Debugging comment
        for report in sorted(reports[key]):
            point = (
                Point(report.hashed_adv_key_b64)
                .field("latitude", report.latitude)
                .field("longitude", report.longitude)
                .field("confidence", report.confidence)
                .field("horizontal_accuracy", report.horizontal_accuracy)
                .field("status", report.status)
                .time(report.timestamp)
            )
            points.append(point)

    write_api.write(bucket=bucket, org=org, record=points)

    return {}, 200