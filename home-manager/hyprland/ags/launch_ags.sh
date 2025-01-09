# Kill ags if it's running
ags quit -i main

# Clear the log
echo "" > /tmp/ags.log

# Launch ags
ags run --gtk4 2>&1 | tee -a /tmp/ags.log & disown