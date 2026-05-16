"""add user admin ban fields

Revision ID: a1b2c3d4e5f6
Revises: 0247539a4882
Create Date: 2026-05-16 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "0247539a4882"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("is_banned", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("ban_reason", sa.Text(), nullable=True))
    op.alter_column("users", "is_admin", server_default=None)
    op.alter_column("users", "is_banned", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "ban_reason")
    op.drop_column("users", "is_banned")
    op.drop_column("users", "is_admin")
