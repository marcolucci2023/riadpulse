"""
Connexion à Neon PostgreSQL via asyncpg.
"""
import asyncpg
from app.core.config import settings

pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=1,
            max_size=5,
        )
    return pool


async def init_db() -> None:
    """Supprime et recrée les tables proprement."""
    p = await get_pool()
    async with p.acquire() as conn:
        # Supprimer les anciennes tables (ordre important : FK d'abord)
        await conn.execute("DROP TABLE IF EXISTS audits CASCADE;")
        await conn.execute("DROP TABLE IF EXISTS users CASCADE;")

        # Recréer proprement
        await conn.execute("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE audits (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                url VARCHAR(500) NOT NULL,
                total_score INTEGER NOT NULL,
                max_total INTEGER NOT NULL,
                grade VARCHAR(2) NOT NULL,
                criteria JSONB NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)