# Kill all scripts with "ags" in the command except ourselves

# pgrep -f ags returns the PID of every script with "ags" in the command
# grep -v $$ excludes the current script
# xargs kill -9 kills all the PIDs
pgrep -f ags | grep -v $$ | xargs kill -9

# Watch for changes and reload ags
inotifywait\
  -m -r\
  --exclude '@girs/' --exclude 'node_modules/'\
  -e close_write $(readlink -f ~/.config/ags) | while read; do
    ags quit -i main
    echo "" > /tmp/ags.log
    ags run --gtk4 2>&1 | tee -a /tmp/ags.log & disown
done & disown

# Load ags
echo "Force reloaded ags"
echo "--- Force reload ---" >> /tmp/ags.log
ags run --gtk4 2>&1 | tee -a /tmp/ags.log & disown