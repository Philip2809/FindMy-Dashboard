# from db import db
# from cuid2 import Cuid
# CUID_GENERATOR: Cuid = Cuid(length=24)

# class Beacon(db.Model):
#     __tablename__ = 'beacon'

#     id = db.Column(db.String, primary_key=True, default=CUID_GENERATOR.generate)
#     item_id = db.Column(db.String, db.ForeignKey('item.id', ondelete='CASCADE'), nullable=False)
#     label = db.Column(db.String)
#     type = db.Column(db.String, nullable=False)

#     __mapper_args__ = {
#         'polymorphic_on': type,
#         'polymorphic_identity': 'beacon',
#     }

#     def __init__(self, item_id, label=None):
#         self.item_id = item_id
#         self.label = label

# class StaticBeacon(Beacon):
#     first_byte_random = db.Column(db.Boolean, default=False)

#     __mapper_args__ = {
#         'polymorphic_identity': 'static',
#     }

#     def __init__(self, item_id, label=None, first_byte_random=False):
#         super().__init__(item_id, label)
#         self.first_byte_random = first_byte_random

# class ListBeacon(Beacon):
#     foo = db.Column(db.String)
#     bar = db.Column(db.String)

#     __mapper_args__ = {
#         'polymorphic_identity': 'list',
#     }
