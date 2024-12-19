# List all wallpapers in the $WALLPAPERS_DIR (but not recursively)
# These will most likely be symlinks to the actual wallpapers since they're
# stored in the Nix store
wallpapers=($(find $WALLPAPERS_DIR -maxdepth 1 -type f,l))

# If WALLPAPER_STATE_FILE or DISABLED_WALLPAPERS_STATE_FILE are not set, error
if [ -z $WALLPAPER_STATE_FILE ] || [ -z $DISABLED_WALLPAPERS_STATE_FILE ]; then
  echo "WALLPAPER_STATE_FILE and DISABLED_WALLPAPERS_STATE_FILE must be set"
  exit 1
fi

# If the state file does not exist, create it
if [ ! -f $WALLPAPER_STATE_FILE ]; then
  touch $WALLPAPER_STATE_FILE
fi

# If the disabled wallpapers state file doesn't exist, create it
if [ ! -f $DISABLED_WALLPAPERS_STATE_FILE ]; then
  touch $DISABLED_WALLPAPERS_STATE_FILE
fi

# Read the disabled wallpapers state file into an array
mapfile -t disabled_wallpapers < $DISABLED_WALLPAPERS_STATE_FILE

# Read the wallpapers in the directory and store them in an array
get_wallpapers() {
  wallpapers=()
  while IFS= read -r wallpaper; do
    # If the wallpaper is not in the disabled wallpapers array, add it to the wallpapers array
    if [[ ! " ${disabled_wallpapers[@]} " =~ " $(basename $wallpaper) " ]]; then
      wallpapers+=("$wallpaper")
    fi
  done < <(find "$WALLPAPERS_DIR" -type f,l)
}
get_wallpapers

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
  get_wallpapers
  unused_wallpapers=("${wallpapers[@]}")
fi

# Select a random wallpaper
selectedWallpaper=${unused_wallpapers[$RANDOM % ${#unused_wallpapers[@]}]}

# Update the wallpaper using the swww img command
swww img "$selectedWallpaper" --transition-step 20 --transition-fps 60\
  --transition-type wipe --transition-angle $((RANDOM % 360))

# TODO: automatic wallpaper-based theming with https://codeberg.org/explosion-mental/wallust/ or similar?
# https://gitlab.com/fazzi/dotfiles/-/tree/hyprland-pc is an example of hyprland configuration for wallust

# Add the selected wallpaper to the state file
echo $(basename $selectedWallpaper) >> $WALLPAPER_STATE_FILE