#!/usr/bin/env bash
set -e

echo "Creating Python virtual environment..."
python3 -m venv pyenv

echo "Activating virtual environment..."
source pyenv/bin/activate

echo "Upgrading pip..."
pip install --upgrade pip

echo "Installing Python dependencies..."
pip install --extra-index-url https://download.pytorch.org/whl/cpu -r embedding-api/requirements.txt

echo "Installing backend dependencies..."
npm install --prefix backend

echo "Starting backend (Node + Python)..."
cd backend
npm start
