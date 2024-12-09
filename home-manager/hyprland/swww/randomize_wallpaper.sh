# List all wallpapers in the $WALLPAPERS_DIR (but not recursively)
# These will most likely be symlinks to the actual wallpapers since they're
# stored in the Nix store
wallpapers=($(find $WALLPAPERS_DIR -maxdepth 1 -type f,l))

# If the state file does not exist, create it
if [ ! -f $WALLPAPER_STATE_FILE ]; then
  touch $WALLPAPER_STATE_FILE
fi

# Read the wallpapers in the directory and store them in an array
wallpapers=()
while IFS= read -r wallpaper; do
  wallpapers+=("$wallpaper")
done < <(find "$WALLPAPERS_DIR" -type f,l)

# Read the state file into an array
mapfile -t state_files < "$WALLPAPER_STATE_FILE"

unused_wallpapers=()

# Compare each wallpaper with the state file
for wallpaper in "${wallpapers[@]}"; do
  # If the wallpaper is not in the state file, add it to the unused_wallpapers array
  if [[ ! " ${state_files[@]} " =~ " $(basename $wallpaper) " ]]; then
    unused_wallpapers+=("$wallpaper")
  fi
done

# If all wallpapers have been used, reset the state file
if [ ${#unused_wallpapers[@]} -eq 0 ]; then
  > $WALLPAPER_STATE_FILE
  unused_wallpapers=($(find $WALLPAPERS_DIR -maxdepth 1 -type f,l))
fi

# Select a random wallpaper
selectedWallpaper=${unused_wallpapers[$RANDOM % ${#unused_wallpapers[@]}]}

# Update the wallpaper using the swww img command
swww img "$selectedWallpaper" --transition-step 20 --transition-fps 60\
  --transition-type wipe --transition-angle $((RANDOM % 360))

# Add the selected wallpaper to the state file
echo $(basename $selectedWallpaper) >> $WALLPAPER_STATE_FILE