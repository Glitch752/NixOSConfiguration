# {username} | {uptime}

echo "$(whoami) | Up $(uptime | awk -F'( |,|:)+' '{print $6,$7",",$8,"hours,",$9,"minutes"}')"