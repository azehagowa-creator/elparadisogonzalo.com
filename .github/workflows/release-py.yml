name: Release

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

jobs:
  release:
    runs-on: ${{ matrix.os }}

    strategy:
      fail-fast: false
      matrix:
        os:
          - ubuntu-latest
          - self-hosted
          - windows-latest
          - macos-latest
        python-version:
          - "3.10"
          - "3.11"
          - "3.12"

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
        shell: bash

      - name: Run release.py
        run: |
          python release.py

      - name: Upload release artifacts
        if: runner.os == 'Linux' && matrix.python-version == '3.12'
        uses: actions/upload-artifact@v4
        with:
          name: release-${{ github.ref_name }}
          path: dist/
