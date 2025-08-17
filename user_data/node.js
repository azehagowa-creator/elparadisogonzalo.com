import os
import json
user_folder = "user_data/wallets"
os.makedirs(user_folder, exist_ok=True)
user_address = "0x123abc"
user_file = f"{user_folder}/{user_address}.json"
data = {
    "address": user_address,
    "balance": 0,
    "tokens": []
}
with open(user_file, "w") as f:
    json.dump(data, f, indent=2)
