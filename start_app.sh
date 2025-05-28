#!/bin/bash

# Setze das Arbeitsverzeichnis auf das Projektverzeichnis
cd "$(dirname "$0")"

if [ ! -f ./venv311/bin/activate ]; then
  echo "Virtuelle Umgebung wird erstellt..."
  python3 -m venv venv311
  source ./venv311/bin/activate
  python3 -m pip install --upgrade pip
  pip install -r backend/requirements.txt
else
  source ./venv311/bin/activate
fi

# Wechsle ins Backend-Verzeichnis
cd backend

# Führe Datenbank-Migrationen aus
echo "Führe Migrationen aus..."
alembic upgrade head

# Starte die Anwendung
echo "Starte Anwendung..."
export PYTHONPATH="."
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 