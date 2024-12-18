# This boot message takes slightly less than 16 seconds to display. It's long, but it's fun.
# You can skip it at most points with a key press.

# Technically, the terminal should already be cleared, but just in case...
clear

# Like sleep, but exits the script if a key is pressed.
sleep_() {
  read -t $1 -n 1
  if [[ $? -eq 0 ]]; then
    echo # New line
    echo -e "\e[0m" # Reset the terminal colors
    echo "Interrupting boot message! Normal boot will continue."
    exit 1
  fi
}

# Get the first n characters of a string.
# If n is greater than the length of the string, return the whole string.
# Doesn't count escape sequences as characters.
get_first_n() {
  local n=$1
  local string=$2
  local length=${#string}
  local i=0
  local count=0
  while (( i < length && count < n )); do
    if [[ ${string:i:1} == $'\e' ]]; then
      # Skip the escape sequence
      while [[ ${string:i:1} != 'm' ]]; do
        (( i++ ))
      done
    fi
    (( i++ ))
    (( count++ ))
  done
  echo "${string:0:i}"
}

# Get the length of a string, ignoring escape sequences.
get_length() {
  local string=$1
  local length=${#string}
  local i=0
  local count=0
  while (( i < length )); do
    if [[ ${string:i:1} == $'\e' ]]; then
      # Skip the escape sequence
      while [[ ${string:i:1} != 'm' ]]; do
        (( i++ ))
      done
    fi
    (( i++ ))
    (( count++ ))
  done
  echo $count
}

# Writes out all the provided lines simultaneously
slowTypeLines() {
  # If the first argument is a number, use it as the sleep time
  if [[ $1 =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
    local sleep_time=$1
    shift
  else
    local sleep_time=0.03
  fi

  max_length=0
  for line in "$@"; do
    local line_length=$(get_length "$line")
    if (( line_length > max_length )); then
      max_length=$line_length
    fi
    echo # One empty line for each line
  done

  lines_count=$#

  for (( i=1; i<=max_length; i++ )); do
    # Move the cursor to the beginning of the first line
    echo -e -n "\e[${lines_count}A"
    
    for line in "$@"; do
      echo -e "$(get_first_n $i "$line")"
    done

    sleep_ $sleep_time
  done
}

ANSI_GREEN=$(echo -e "\e[1;32m")
ANSI_BOLD=$(echo -e "\e[1m")
ANSI_BLUE=$(echo -e "\e[1;34m")
ANSI_RESET=$(echo -e "\e[0m")

# Move the cursor to the bottom of the terminal
echo -e "\e[999B"

sleep_ 0.5

slowTypeLines 0.07 "$ANSI_GREEN> Booting operating system..."

sleep_ 0.8

echo

user=$(whoami)
user=$(echo -e "\e[1;34m$user\e[0m")

kernel_modules=$(lsmod | wc -l)
kernel_version=$(uname -r)

nixos_version=$(nixos-version --json | jq -r '.nixosVersion' | sed 's/\(.*\)\..*/\1/')
nixpkgs_version=$(nixos-version --json | jq -r '.nixpkgsRevision')

partition=$(df / | tail -n 1 | awk '{print $1}')
used_space=$(df / | tail -n 1 | awk '{print $3}')
available_space=$(df / | tail -n 1 | awk '{print $4}')

slowTypeLines \
  "$ANSI_GREEN> Welcome, $ANSI_BOLD$ANSI_BLUE$user$ANSI_RESET$ANSI_GREEN."
echo

sleep_ 0.3

slowTypeLines \
  "$ANSI_GREEN> Kernel modules loaded: $kernel_modules" \
  "$ANSI_GREEN> Kernel version: $kernel_version" \
  "$ANSI_GREEN> NixOS - NixOS version $nixos_version" \
  "$ANSI_GREEN> NixOS - Nixpkgs version $nixpkgs_version"
echo

slowTypeLines \
  "$ANSI_GREEN> Partition: $ANSI_BOLD$partition$ANSI_RESET" \
  "$ANSI_GREEN> .. Used $used_space bytes" \
  "$ANSI_GREEN> .. Available $available_space bytes"
echo

sleep_ 0.5

echo

sleep_ 0.5

# Fetch

cat <<'EOF' > /tmp/fastfetch.json
{
  "$schema": "https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json",
  "modules": [
    "title",
    "separator",
    "os",
    "host",
    "kernel",
    "uptime",
    "packages",
    "shell",
    "display",
    "de",
    "wm",
    "wmtheme",
    "theme",
    "icons",
    "font",
    "cursor",
    "terminal",
    "terminalfont",
    "cpu",
    "gpu",
    "memory",
    "swap",
    "disk",
    "localip",
    "battery",
    "poweradapter",
    "locale",
    "break"
  ],
  "colors": false
}
EOF

while IFS= read -r line; do
  echo -e "$ANSI_GREEN> $line"
  # Lol, this is a bad way to do this
  # We use normal sleep because sleep_ reads from the fetch output and exists immediately
  if [[ $RANDOM -lt 10000 ]]; then
    sleep 0.02
  fi
  if [[ $RANDOM -lt 10000 ]]; then
    sleep 0.02
  fi
  if [[ $RANDOM -lt 10000 ]]; then
    sleep 0.02
  fi
  if [[ $RANDOM -lt 10000 ]]; then
    sleep 0.02
  fi
  sleep 0.02
done < <(
echo "$(fastfetch -c /tmp/fastfetch.json)

$(fortune -s)")

rm /tmp/fastfetch.json

sleep_ 0.3

echo

sleep_ 0.5

slowTypeLines "$ANSI_GREEN> Done."

sleep_ 1.4

echo -e -n "$ANSI_RESET"