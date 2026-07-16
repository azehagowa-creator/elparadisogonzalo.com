# Python Build Action

A reusable GitHub Action for self-hosted runners.

## Features

- Creates a Python virtual environment
- Upgrades pip, setuptools, and wheel
- Installs dependencies from `requirements.txt`
- Builds the project using `pyproject.toml`
- Installs the package using `setup.py` if present

## Usage

```yaml
- name: Run Python Build Action
  uses: ./.github/actions/python-build
