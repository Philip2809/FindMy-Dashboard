"""move to beacon_id and migrate data

Revision ID: 1c8dd3955e6b
Revises: 0b130f569ac7
Create Date: 2025-08-07 19:43:24.448374

"""
from alembic import op
import sqlalchemy as sa
from cuid2 import Cuid
CUID_GENERATOR: Cuid = Cuid(length=24)


# revision identifiers, used by Alembic.
revision = '1c8dd3955e6b'
down_revision = '0b130f569ac7'
branch_labels = None
depends_on = None


def upgrade():
    # add beacon_id column to key table
    with op.batch_alter_table('key', schema=None) as batch_op:
        batch_op.add_column(sa.Column('beacon_id', sa.String(), nullable=True)) # Temporarily nullable, to allow for migration
        batch_op.create_foreign_key(None, 'beacon', ['beacon_id'], ['id'], ondelete='CASCADE')
    
    # Get all keys
    connection = op.get_bind()
    keys = connection.execute(
        sa.text("SELECT public_key, tag_id, label FROM key")
    ).fetchall()

    # for each key create a beacon and update the key with the beacon_id
    for key in keys:
        beacon_id = CUID_GENERATOR.generate()

        connection.execute(
            sa.text("INSERT INTO beacon (id, item_id, label, type) VALUES (:id, :item_id, :label, 'static')"),
            {'id': beacon_id, 'item_id': key.tag_id, 'label': key.label}
        )

        connection.execute(
            sa.text("UPDATE key SET beacon_id = :beacon_id WHERE public_key = :public_key"),
            {'beacon_id': beacon_id, 'public_key': key.public_key}
        )

    # Remove tag_id and label columns from key table
    with op.batch_alter_table('key', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('key_tag_id_fkey'), type_='foreignkey')
        batch_op.drop_column('tag_id')
        batch_op.drop_column('label')

        # Make beacon_id column non-nullable
        batch_op.alter_column('beacon_id', nullable=False)



def downgrade():
    # Readd the tag_id and label columns to key table
    with op.batch_alter_table('key', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tag_id', sa.VARCHAR(), autoincrement=False, nullable=True)) # Temporarily nullable, to allow for migration
        batch_op.add_column(sa.Column('label', sa.VARCHAR(), autoincrement=False, nullable=True))
        batch_op.create_foreign_key(batch_op.f('key_tag_id_fkey'), 'item', ['tag_id'], ['id'], ondelete='CASCADE')

    connection = op.get_bind()

    # Make sure only breacons of type 'static' exist
    non_static_beacons = connection.execute(
        sa.text("SELECT id FROM beacon WHERE type != 'static'")
    ).fetchall()

    # Older versions only supported static beacons, if there are any non-static beacons, we cannot downgrade
    if len(non_static_beacons) > 0:
        raise Exception("Cannot downgrade, there are non-static beacons present.")

    # Get all beacons
    beacons = connection.execute(
        sa.text("SELECT id, item_id, label FROM beacon")
    ).fetchall()

    # Add the label and tag_id back to the key table
    for beacon in beacons:
        connection.execute(
            sa.text("UPDATE key SET tag_id = :tag_id, label = :label WHERE beacon_id = :beacon_id"),
            {'tag_id': beacon.item_id, 'label': beacon.label, 'beacon_id': beacon.id}
        )

    # Remove beacon_id column from key table
    with op.batch_alter_table('key', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('key_beacon_id_fkey'), type_='foreignkey')
        batch_op.drop_column('beacon_id')

        # Make tag_id column non-nullable
        batch_op.alter_column('tag_id', nullable=False)

