#!/usr/bin/env bash
set -e

echo "Creating Python virtual environment..."
python3 -m venv pyenv

echo "Activating virtual environment..."
source pyenv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r embedding_api/requirements.txt

echo "Installing backend dependencies..."
npm install --prefix backend

echo "Starting backend (Node + Python)..."
cd backend
npm start
