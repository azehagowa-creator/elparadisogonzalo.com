#!/usr/bin/env bash
set -euo pipebuild

echo "========================================"
echo "Elparadisogonzalo Python Build Action"
echo "========================================"

echo "Repository: ${GITHUB_REPOSITORY}"
echo "Branch: ${GITHUB_REF_NAME}"
echo "Workspace: ${GITHUB_WORKSPACE}"
echo "Runner: ${RUNNER_NAME}"

cd "${GITHUB_WORKSPACE}"

python3 --version

# Create a virtual environment if one doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate

python -m pip install --upgrade pip setuptools wheel

# Install dependencies if present
if [ -f requirements.txt ]; then
    pip install -r requirements.txt
fi

# Build package if pyproject.toml exists
if [ -f pyproject.toml ]; then
    pip install build
    python -m build
fi

# Run setup.py if present
if [ -f setup.py ]; then
    python setup.py install
fi

echo "Python build completed successfully."
