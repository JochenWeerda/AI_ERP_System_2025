from setuptools import setup, find_packages

setup(
    name="backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi<0.100.0",
        "pydantic<2.0.0",
        "uvicorn",
        "sqlalchemy",
        "alembic",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-multipart",
        "python-dotenv",
        "pytest",
        "httpx",
    ],
) 