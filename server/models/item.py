import time
from cuid2 import Cuid
from db import db

CUID_GENERATOR: Cuid = Cuid(length=24)

class Item(db.Model):
    __tablename__ = 'item'

    id = db.Column(db.String, primary_key=True, default=CUID_GENERATOR.generate)
    icon = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    color = db.Column(db.String, nullable=False)
    created_at = db.Column(db.Integer, default=lambda: int(time.time()), nullable=False)

    beacons = db.relationship("Beacon", back_populates="item", cascade="all, delete-orphan")

    def __init__(self, icon, name, description, color):
        self.icon = icon
        self.name = name
        self.description = description
        self.color = color

    def to_dict(self):
        data = {
            'id': self.id,
            'icon': self.icon,
            'name': self.name,
            'color': self.color,
        }

        if self.description is not None:
            data['description'] = self.description

        return data
