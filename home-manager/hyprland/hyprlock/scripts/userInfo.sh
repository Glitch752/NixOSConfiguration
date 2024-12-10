# {username} | {uptime}

echo "$(whoami) | Uptime: $(uptime | awk '{print $3}' | sed 's/,//g')"