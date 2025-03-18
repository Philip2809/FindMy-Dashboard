from flask import Blueprint, request, jsonify
from models.key import Key
from db import db
from models.tag import Tag
from utils.keygen import keygen
import utils.fetch_reports

keys_blueprint = Blueprint('keys', __name__)

# CRD for keys, no need for update

# Create a new key
@keys_blueprint.route('/', methods=['POST'])
def create_key():
    data = request.get_json()
    tag_id = data.get('tag_id')
    private_key = data.get('private_key')

    if not tag_id:
        return jsonify({'error': 'Missing required fields (tag_id)'}), 400

    # make sure the tag exists
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404

    if private_key:
        # Check if the key already exists, if so return the existing key
        key = Key.query.filter_by(private_key=private_key).first()
        if key:
            return jsonify(key.to_dict()), 200

    private_key, public_key, hashed_public_key = keygen(private_key)

    # Create a new Key record
    key = Key(private_key=private_key, public_key=public_key, hashed_public_key=hashed_public_key, tag_id=tag_id)
    
    db.session.add(key)
    db.session.commit()
    
    return jsonify(key.to_dict()), 201


# Get all keys
@keys_blueprint.route('/', methods=['GET'])
def get_keys():
    keys = Key.query.all()
    return jsonify([key.to_dict() for key in keys]), 200


# Get specific key by public_key
@keys_blueprint.route('/<path:public_key>', methods=['GET'])
def get_key(public_key):
    key: Key = Key.query.get(public_key)
    if not key:
        return jsonify({'error': 'Key not found'}), 404
    return jsonify(key.get_private_key()), 200


# Delete a key by private_key
@keys_blueprint.route('/<path:public_key>', methods=['DELETE'])
def delete_key(public_key):
    key = Key.query.get(public_key)

    if not key:
        return jsonify({'error': 'Key not found'}), 404
    
    db.session.delete(key)
    db.session.commit()
    
    return jsonify({'message': 'Key deleted successfully'}), 200


# Refresh reports for all keys
@keys_blueprint.route('/fetch/all', methods=['GET'])
def fetch_all_reports():
    keys = Key.query.all()
    res = utils.fetch_reports.get_reports([key.get_private_key() for key in keys])

    return jsonify(res), 200

# Refresh reports by tag
@keys_blueprint.route('/fetch', methods=['POST'])
@keys_blueprint.route('/fetch/<int:tag_id>', methods=['GET'])
def fetch_reports(tag_id=None):
    keys: list[Key] = []

    if tag_id:
        keys = Key.query.filter_by(tag_id=tag_id).all()
        if not keys:
            return jsonify({'error': 'Tag not found'}), 404

    else:
        data = request.get_json()
        tag_ids = data.get('tag_ids')
        if not tag_ids:
            return jsonify({'error': 'Missing required fields (tag_ids)'}), 400
        
        keys = [Key.query.filter_by(tag_id=tag_id).first() for tag_id in tag_ids]
        if not all(keys):
            return jsonify({'error': 'One or more keys not found'}), 404

    res = utils.fetch_reports.get_reports([key.get_private_key() for key in keys])

    return jsonify(res), 200
