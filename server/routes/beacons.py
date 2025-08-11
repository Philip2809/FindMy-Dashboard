from flask import Blueprint, request
from models.beacon import Beacon, StaticBeacon
from db import db
from marshmallow import Schema, ValidationError, fields

from models.key import Key
from utils.keygen import keygen
from utils.login import ShowMessage

beacons_blueprint = Blueprint('beacons', __name__)

# CRUD Operations for Beacons


# Create a new static beacon
class CreateStaticBeaconSchema(Schema):
    item_id = fields.String(required=True)
    label = fields.String()
    private_key = fields.String()

@beacons_blueprint.route('/static', methods=['POST'])
def create_static_beacon():
    try:
        data = CreateStaticBeaconSchema().load(request.json)
    except ValidationError as err:
        return ShowMessage(f"Invalid data: {err.messages}", 400).to_json()

    # Check if the private key already exists
    if 'private_key' in data:
        key = Key.query.filter_by(private_key=data.get('private_key')).first()
        if key:
            return ShowMessage("Private key already exists", 400).to_json()

    # Create a new StaticBeacon
    beacon = StaticBeacon(data.get('item_id'), data.get('label'))
    db.session.add(beacon)
    try:
        db.session.flush()
    except Exception as e:
        db.session.rollback()
        return ShowMessage(f"Failed to create beacon", 500).to_json()

    # Generate the key for the beacon, if provided use that as the private key
    try:
        private_key, public_key, hashed_public_key = keygen(data.get('private_key'))
    except:
        return ShowMessage("Failed to generate key", 400).to_json()
    
    # Add the key to the database
    key = Key(private_key, public_key, hashed_public_key, beacon.id)
    db.session.add(key)

    # Try to save all etc
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return ShowMessage(f"Failed to save beacon and key {e}", 500).to_json()

    return {}, 200

# Get all beacons
@beacons_blueprint.route('/<string:item_id>', methods=['GET'])
def get_beacons(item_id=None):
    beacons: list[Beacon] = Beacon.query.filter_by(item_id=item_id)
    beacon_array = [beacon.to_dict() for beacon in beacons]

    return beacon_array, 200

# Update a beacon
class UpdateStaticBeaconSchema(Schema):
    id = fields.String(required=True)
    label = fields.String()

@beacons_blueprint.route('/static', methods=['PATCH'])
def update_beacon():
    try:
        data = UpdateStaticBeaconSchema().load(request.json)
    except ValidationError as err:
        return ShowMessage(f"Invalid data: {err.messages}", 400).to_json()


    beacon = Beacon.query.get(data.get('id'))
    if not beacon:
        return ShowMessage("Beacon not found", 404).to_json()

    label = data.get('label')
    if label:
        beacon.label = label

    db.session.commit()

    return beacon.to_dict(), 200

# Delete a beacon
@beacons_blueprint.route('/<string:id>', methods=['DELETE'])
def delete_beacon(id: str):
    beacon = Beacon.query.get(id)
    if not beacon:
        return ShowMessage("Beacon not found", 404).to_json()

    db.session.delete(beacon)
    db.session.commit()

    return {}, 200
