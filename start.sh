#!/usr/bin/env bash

echo "Installing Python dependencies..."
pip install -r embedding_api/requirements.txt

echo "Installing backend dependencies..."
npm install --prefix backend

echo "Starting backend (Node + Python)..."
cd backend
npm start
