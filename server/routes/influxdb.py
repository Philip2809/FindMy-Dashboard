import os
from flask import Blueprint, request
import requests
import pandas as pd
from io import StringIO
from models.key import Key

influxdb_blueprint = Blueprint('influxdb', __name__)

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")

# GET data from InfluxDB
@influxdb_blueprint.route('/', methods=['GET'])
def influxdb():


    influxdb_url = INFLUXDB_URL + '/api/v2/query?org=' + INFLUXDB_ORG
    headers = {
        'Authorization': 'Token ' + INFLUXDB_TOKEN,
        'Content-Type': 'application/json'
    }

    response = requests.post(influxdb_url, headers=headers, json={
        'query': get_query(request.args.get('time_range'), request.args.get('latest')),
        'type': 'flux'
    })
    
    df = pd.read_csv(StringIO(response.text), sep=',')
    unique_hashed_keys = df.get('hashed_public_key').unique().tolist()
    keys: list[Key] = Key.query.filter(Key.hashed_public_key.in_(unique_hashed_keys)).all()

    data = {}

    for key in keys:
        item_id = key.beacon.item_id
        data[item_id] = []

        for _, row in df[df['hashed_public_key'] == key.hashed_public_key].iterrows():
            data[item_id].append({
                'timestamp': row.get('timestamp'),
                'latitude': row.get('latitude'),
                'longitude': row.get('longitude'),
                'horizontal_accuracy': row.get('horizontal_accuracy'),
                'status': row.get('status'),
                'confidence': row.get('confidence'),
                # 'hashed_public_key': key.hashed_public_key # Not used yet, when it is we should add it
            })


    return data, 200


def get_query(time_range: str, latest: int | None = None) -> str:
    tail_line = f'|> tail(n: {latest})' if latest is not None else ''
    
    return f'''
    from(bucket: "{INFLUXDB_BUCKET}")
        |> range(start: -{time_range})
        {tail_line}
        |> keep(columns: ["_time", "_field", "_value", "_measurement"])
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> rename(columns: {{_measurement: "hashed_public_key", "_time": "timestamp"}})
        |> map(fn: (r) => ({{ r with timestamp: int(v: r.timestamp) / 1000000 }}))
        |> group()
    '''
