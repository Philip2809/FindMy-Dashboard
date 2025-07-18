from flask import Blueprint, request, jsonify
from models.tag import Tag
from models.key import Key
from db import db

from utils.login import Pick2FAMethod, ShowMessage

tags_blueprint = Blueprint('tags', __name__)

# CRUD Operations for Tags

# Create a new tag
@tags_blueprint.route('/', methods=['POST'])
def create_tag():
    data = request.get_json()
    id = data.get('id')
    icon = data.get('icon')
    name = data.get('name')
    description = data.get('description')
    color = data.get('color')

    if not icon or not name or not color:
        return ShowMessage("Missing required fields", 400).to_json()

    if id:
        existing_tag = Tag.query.get(id)
        if not existing_tag:
            return jsonify({'error': 'Tag not found'}), 404
        # Update existing tag
        existing_tag.icon = icon
        existing_tag.name = name
        existing_tag.description = description
        existing_tag.color = color
        db.session.commit()

        return jsonify(existing_tag.to_dict()), 200
        
    
    tag = Tag(icon, name, description, color)
    db.session.add(tag)
    db.session.commit()
    
    return jsonify(tag.to_dict()), 201


# Get all tags
@tags_blueprint.route('/', methods=['GET'])
def get_tags():
    tags = Tag.query.all()


    # return Pick2FAMethod(["trusted", "sms"]).to_json()
    # return ShowMessage("2FA process not initiated or already completed.", 400).to_json()

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
