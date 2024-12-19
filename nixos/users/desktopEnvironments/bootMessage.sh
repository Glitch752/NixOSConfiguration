# I would love to somehow switch to a better terminal environment than the Linux TTY.
# I tried for a _long_ time to get kmscon or fbterm to work, but there are a few issues:
# - It's difficult to start them and continue execution from inside the TTY,
#   since we still need to start our desktop environment from outside of them.
# - Both kmscon and fbterm freeze occasionally on Intel integrated graphics for some reason.

# It would be ideal if we could run a real Wayland terminal emulator like Alacritty, but I don't know
# how to set that up securely with hyprland. I don't really care about how the boot message looks enough
# to set up an entire separate Wayland environment just for it. If this is a route I want to take in the
# future, maybe lightdm is a good environment? I'm not sure how much overhead that would add.

# A feasible alternative is to render the boot message to a gif and display it with Plymouth, but
# I would prefer to have it match the resolution of the screen, so I would need to make a separate gif
# for every system and ideally have some sort of automated process for that. It's more work than I want
# to put in right now.

# One other solution I have in mind is making a custom "lock screen" application using the ext-session-lock-v1
# Wayland protocol which opens the normal lock screen when exiting. It would be an interesting project,
# but I have stability and security concerns... and, again, it's a lot of work for something small.



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

# With a 10% chance, colorize with lolcat and animate instead

if [[ $((RANDOM % 10)) -eq 0 ]]; then
  echo "Luck is on your side! Enjoy the lolcat (even though the colors are a bit messed up... thanks Linux TTY)!

$(fastfetch -c /tmp/fastfetch.json)

$(fortune -s)" | lolcat -t -a -d 1
else
  while IFS= read -r line; do
    echo -e "$ANSI_GREEN> $line"
    sleep 0.04
  done < <(
  echo "$(fastfetch -c /tmp/fastfetch.json)

  $(fortune -s)")
fi

rm /tmp/fastfetch.json

echo -e -n "$ANSI_RESET"
(
  sleep_ 0.3

  echo

  sleep_ 0.5

  slowTypeLines "$ANSI_GREEN> Done.$ANSI_RESET"
) & disown # Run in the background and disown so that the script can exit