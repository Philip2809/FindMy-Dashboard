import time
from db import db

class Key(db.Model):
    __tablename__ = 'key'

    private_key = db.Column(db.String, nullable=False)
    public_key = db.Column(db.String, nullable=False, primary_key=True)
    hashed_public_key = db.Column(db.String, nullable=False)
    beacon_id = db.Column(db.String, db.ForeignKey('beacon.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.Integer, default=lambda: int(time.time()), nullable=False)

    def __init__(self, private_key, public_key, hashed_public_key, label, beacon_id):
        self.private_key = private_key
        self.public_key = public_key
        self.hashed_public_key = hashed_public_key
        self.label = label
        self.beacon_id = beacon_id

    def to_dict(self):
        data = {
            'public_key': self.public_key,
            'hashed_public_key': self.hashed_public_key,
            'tag_id': self.beacon_id
        }

        if self.label is not None:
            data['label'] = self.label

        return data
        
    def get_private_key(self):
        return self.private_key