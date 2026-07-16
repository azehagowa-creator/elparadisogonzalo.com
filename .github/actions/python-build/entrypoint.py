#!/usr/bin/env python3

import os

print("===================================")
print("Elparadisogonzalo Python Action")
print("===================================")

print(f"Repository: {os.getenv('GITHUB_REPOSITORY')}")
print(f"Ref: {os.getenv('GITHUB_REF')}")
print(f"Runner: {os.getenv('RUNNER_NAME')}")
print(f"Workspace: {os.getenv('GITHUB_WORKSPACE')}")

print("Python action completed successfully.")
