from flask import Blueprint
from models.beacon import Beacon, StaticBeacon
from db import db

beacons_blueprint = Blueprint('beacons', __name__)

# CRUD Operations for Beacons


@beacons_blueprint.route('/', methods=['POST'])
def create_beacon():
    # test = StaticBeacon("test", "test")
    # db.session.add(test)
    # db.session.commit()

    return {}, 200

# Get all beacons
@beacons_blueprint.route('/', methods=['GET'])
def get_tags():
    beacons = Beacon.query.all()

    print(beacons)

    return {}, 200
