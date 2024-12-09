# https://www.reddit.com/r/linux4noobs/comments/18gszjq/comment/ktf7vvx/

# Check if the wallpapers array is empty
if [ ${#WALLPAPERS[@]} -eq 0 ]; then
    # If the array is empty, refill it with the image files
    export WALLPAPERS=("$WALLPAPERS_DIR"/*)
fi

# Select a random wallpaper from the array
wallpaperIndex=$(( RANDOM % ${#WALLPAPERS[@]} ))
selectedWallpaper="${WALLPAPERS[$wallpaperIndex]}"

# Update the wallpaper using the swww img command
swww img "$selectedWallpaper" --transition-step 20 --transition-fps 60\
  --transition-type wipe --transition-angle 30

# Remove the selected wallpaper from the array
unset "WALLPAPERS[$wallpaperIndex]"