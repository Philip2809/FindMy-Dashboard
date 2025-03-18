from flask import Blueprint, request, jsonify
from models.tag import Tag
from models.key import Key
from db import db

tags_blueprint = Blueprint('tags', __name__)

# CRUD Operations for Tags

# Create a new tag
@tags_blueprint.route('/', methods=['POST'])
def create_tag():
    data = request.get_json()
    icon = data.get('icon')
    name = data.get('name')
    color = data.get('color')
    
    tag = Tag(icon=icon, name=name, color=color)
    db.session.add(tag)
    db.session.commit()
    
    return jsonify(tag.to_dict()), 201


# Get all tags
@tags_blueprint.route('/', methods=['GET'])
def get_tags():
    tags = Tag.query.all()

    return jsonify([{
        **tag.to_dict(),
        'keys': [key.to_dict() for key in Key.query.filter_by(tag_id=tag.id).all()]
    } for tag in tags]), 200


# Update a tag by ID
@tags_blueprint.route('/<int:id>', methods=['PUT'])
def update_tag(id):
    data = request.get_json()
    icon = data.get('icon')
    name = data.get('name')
    color = data.get('color')
    
    tag = Tag.query.get(id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404
    
    tag.icon = icon
    tag.name = name
    tag.color = color
    db.session.commit()
    
    return jsonify(tag.to_dict()), 200


# Delete a tag by ID
@tags_blueprint.route('/<int:id>', methods=['DELETE'])
def delete_tag(id):
    tag = Tag.query.get(id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404
    
    db.session.delete(tag)
    db.session.commit()
    
    return jsonify({'message': 'Tag deleted successfully'}), 200
