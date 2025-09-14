from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Add the app directory to sys.path so Alembic can import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import Base, DATABASE_URL
from app.models import *  # Import all your models so Alembic sees them

# Alembic Config object
config = context.config

# Configure SQLAlchemy URL dynamically from DATABASE_URL
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Set up Python logging
fileConfig(config.config_file_name)

# Metadata for autogenerate
target_metadata = Base.metadata

# Run migrations offline (generates SQL without connecting to DB)
def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,  # detect column type changes
        compare_server_default=True
    )

    with context.begin_transaction():
        context.run_migrations()

# Run migrations online (connects to DB and applies changes)
def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True
        )

        with context.begin_transaction():
            context.run_migrations()

# Determine if we are running offline or online
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
