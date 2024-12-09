wallpapers=$(swww query)
# Split by newline with readarray
readarray -t wallpapers <<< "$wallpapers"

# For each wallpaper...
for wallpaper in "${wallpapers[@]}"; do
  # Get the monitor name (the first section before a colon), lowercase
  monitor=$(echo "$wallpaper" | cut -d: -f1 | tr '[:upper:]' '[:lower:]')

  # Get the wallpaper path (the last part after "image: ")
  wallpaper_path=$(echo "$wallpaper" | grep -oP 'image: \K.*')

  # Make a symlink from the wallpaper path to /tmp/$monitor-lock.png
  ln -sf "$wallpaper_path" "/tmp/$monitor-lock.png"
done

# Finally, actually open hyprlock
hyprlock