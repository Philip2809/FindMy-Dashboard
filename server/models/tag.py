import time
from db import db

class Tag(db.Model):
    __tablename__ = 'tag'

    id = db.Column(db.Integer, primary_key=True)
    icon = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    color = db.Column(db.String, nullable=False)
    created_at = db.Column(db.Integer, default=lambda: int(time.time()), nullable=False)

    def __init__(self, icon, name, color):
        self.icon = icon
        self.name = name
        self.color = color

    def to_dict(self):
        return {
            'id': self.id,
            'icon': self.icon,
            'name': self.name,
            'color': self.color,
        }
