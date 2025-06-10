import time
from cuid2 import Cuid
from db import db

CUID_GENERATOR: Cuid = Cuid(length=24)

class Tag(db.Model):
    __tablename__ = 'tag'

    id = db.Column(db.String, primary_key=True, default=CUID_GENERATOR.generate)
    icon = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    label = db.Column(db.String, nullable=False)
    color = db.Column(db.String, nullable=False)
    created_at = db.Column(db.Integer, default=lambda: int(time.time()), nullable=False)

    def __init__(self, icon, name, label, color):
        self.icon = icon
        self.color = color
        self.label = label
        self.name = name

    def to_dict(self):
        return {
            'id': self.id,
            'icon': self.icon,
            'name': self.name,
            'label': self.label,
            'color': self.color,
        }
