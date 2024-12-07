# Kill ags if it's running
ags quit

# Clear the log
echo "" > /tmp/ags.log

# Launch ags
ags run 2>&1 | tee -a /tmp/ags.log & disown