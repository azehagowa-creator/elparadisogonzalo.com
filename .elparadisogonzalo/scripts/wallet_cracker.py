import json
import sys
from eth_keyfile import load_keyfile, decode_keyfile_json
from eth_utils import to_hex

def try_decrypt(wallet_path, password_file):
    with open(wallet_path, 'r') as f:
        keyfile = json.load(f)

    with open(password_file, 'r') as f:
        passwords = [line.strip() for line in f if line.strip()]

    for pwd in passwords:
        try:
            private_key = decode_keyfile_json(keyfile, bytes(pwd, 'utf-8'))
            print(f"\n✅ SUCCESS: Password found → {pwd}")
            print(f"🔑 Private key: {to_hex(private_key)}\n")
            return
        except Exception as e:
            print(f"❌ Failed: {pwd}")
    
    print("\n❌ No matching password found.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python wallet_cracker.py wallet.json passwords.txt")
    else:
        try_decrypt(sys.argv[1], sys.argv[2])
