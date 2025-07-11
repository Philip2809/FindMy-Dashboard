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
    id = data.get('id')
    icon = data.get('icon')
    name = data.get('name')
    label = data.get('label')
    color = data.get('color')

    if not icon or not name or not label or not color:
        return jsonify({'error': 'Missing required fields'}), 400

    if id:
        existing_tag = Tag.query.get(id)
        if not existing_tag:
            return jsonify({'error': 'Tag not found'}), 404
        # Update existing tag
        existing_tag.icon = icon
        existing_tag.name = name
        existing_tag.label = label
        existing_tag.color = color
        db.session.commit()

        return jsonify(existing_tag.to_dict()), 200
        
    
    tag = Tag(icon=icon, name=name, label=label, color=color)
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


# Delete a tag by ID
@tags_blueprint.route('/<string:id>', methods=['DELETE'])
def delete_tag(id):
    tag = Tag.query.get(id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404
    
    db.session.delete(tag)
    db.session.commit()
    
    return jsonify({'message': 'Tag deleted successfully'}), 200
