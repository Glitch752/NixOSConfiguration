# If there's already a window named "anyrun", kill it

if [ -n "$(pgrep -l ".anyrun-wrapped")" ]; then
    pkill -f anyrun
else
    # Launch anyrun
    anyrun
fi