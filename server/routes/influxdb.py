import os
from flask import Blueprint, request
import requests

influxdb_blueprint = Blueprint('influxdb', __name__)

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")

# Proxy for InfluxDB, mostly to avoid CORS but also so you only need to one url in the config

# POST request to get data
@influxdb_blueprint.route('/', methods=['POST'])
def influxdb():
    data = request.get_json()
    
    influxdb_url = INFLUXDB_URL + '/api/v2/query?org=' + INFLUXDB_ORG
    headers = {
        'Authorization': 'Token ' + INFLUXDB_TOKEN,
        'Content-Type': 'application/json'
    }

    data['query'] = data['query'].replace('BUCKET_NAME_HERE', INFLUXDB_BUCKET)
    response = requests.post(influxdb_url, headers=headers, json=data)
    
    return response.text, 200
