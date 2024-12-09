# {username} | {uptime}

echo "$(whoami) | Up $(uptime | awk '{print $3}' | sed 's/,//g')"