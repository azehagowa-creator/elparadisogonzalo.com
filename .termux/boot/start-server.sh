#!/data/data/com.termux/files/usr/bin/bash

# Keep Termux awake
termux-wake-lock

# Start SSH (optional, for remote access)
# sshd

# Navigate to your project
cd /sdcard/Elparadisogonzalo/root/Elparadisogonzalo.github.io/

# Start the server with nohup so it survives session close
nohup node server.js > server.log 2>&1 &

# Optional: notification
termux-notification --title "Server Started" --content "elparadisogonzalo.com is running"
