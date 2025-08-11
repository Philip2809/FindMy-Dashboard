from flask import Blueprint, request, jsonify
from models.item import Item
from db import db

from utils.login import ShowMessage

items_blueprint = Blueprint('items', __name__)

# CRUD Operations for Items

# Create a new item
@items_blueprint.route('/', methods=['POST'])
def create_item():
    data = request.get_json()
    id = data.get('id')
    icon = data.get('icon')
    name = data.get('name')
    description = data.get('description')
    color = data.get('color')

    if not icon or not name or not color:
        return ShowMessage("Missing required fields", 400).to_json()

    if id:
        existing_item = Item.query.get(id)
        if not existing_item:
            return ShowMessage("Item not found", 404).to_json()
        # Update existing item
        existing_item.icon = icon
        existing_item.name = name
        existing_item.description = description
        existing_item.color = color
        db.session.commit()

        return jsonify(existing_item.to_dict()), 200
        
    
    item = Item(icon, name, description, color)
    db.session.add(item)
    db.session.commit()
    
    return jsonify(item.to_dict()), 201


# Get all items
@items_blueprint.route('/', methods=['GET'])
def get_items():
    items = Item.query.all()

    return jsonify([item.to_dict() for item in items]), 200


# Delete an item by ID
@items_blueprint.route('/<string:id>', methods=['DELETE'])
def delete_item(id):
    item = Item.query.get(id)
    if not item:
        return ShowMessage("Item not found", 404).to_json()
    
    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Item deleted successfully'}), 200
