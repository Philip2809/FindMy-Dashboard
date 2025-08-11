from db import db
from cuid2 import Cuid
CUID_GENERATOR: Cuid = Cuid(length=24)

class Beacon(db.Model):
    __tablename__ = 'beacon'

    id = db.Column(db.String, primary_key=True, default=CUID_GENERATOR.generate)
    label = db.Column(db.String)
    type = db.Column(db.String, nullable=False)

    keys = db.relationship("Key", back_populates="beacon", cascade="all, delete-orphan")

    item_id = db.Column(db.String, db.ForeignKey('item.id', ondelete='CASCADE'), nullable=False)
    item = db.relationship("Item", back_populates="beacons")

    __mapper_args__ = {
        'polymorphic_on': type,
        'polymorphic_identity': 'beacon',
    }

    def __init__(self, item_id, label=None):
        self.item_id = item_id
        self.label = label

    def to_dict(self):
        """Base representation of a beacon."""
        # This method should be overridden in subclasses to include specific fields.
        return {
            "id": self.id,
            "item_id": self.item_id,
            "label": self.label,
            "type": self.type
        }

    def get_key_to_fetch(self):
        """Override this method in subclasses to return the keys needed for fetching reports."""
        return []

class StaticBeacon(Beacon):
    __mapper_args__ = {
        'polymorphic_identity': 'static',
    }

    def __init__(self, item_id, label=None):
        super().__init__(item_id, label)

    def to_dict(self):
        """Returns a dictionary representation of the static beacon."""
        base_dict = super().to_dict()

        if not self.keys:
            return base_dict

        base_dict["public_key"] = self.keys[0].public_key
        return base_dict
    
    def get_key_to_fetch(self):
        """Returns the private of the beacon. Static beacons only have one key."""
        return [self.keys[0].get_private_key()] if self.keys else []

# use later: all_keys = [key for beacon in beacons for key in beacon.get_key_to_fetch()]

# class ListBeacon(Beacon):

#     __mapper_args__ = {
#         'polymorphic_identity': 'list',
#     }
