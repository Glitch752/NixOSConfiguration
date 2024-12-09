{ inputs, lib, config, pkgs, ... }: let wallpaperDir = "${config.home.homeDirectory}/Pictures/Wallpapers"; in {
  home.packages = [
    inputs.swww.packages.${pkgs.system}.swww
  ];
  
  wayland.windowManager.hyprland.settings = {
    env = [
      "WALLPAPERS_DIR, ${wallpaperDir}"
      "WALLPAPER_STATE_FILE, ${config.home.homeDirectory}/.wallpapers"
    ];

    bind = [
      # Re-randomize the wallpaper when pressing Meta + `
      "$mainMod, Grave, exec, bash ${./randomize_wallpaper.sh}"
    ];

    exec-once = [
      "swww-daemon" # Or `swww init`?
      "bash ${./randomize_wallpaper.sh}"
    ];
  };

  # Copy all wallpapers from ./wallpapers to the user's wallpaper directory
  home.file."${wallpaperDir}" = {
    source = ./wallpapers;
    recursive = true;
  };

  # Systemd service to re-randomize the wallpaper every hour
  systemd.user.services.randomize_wallpaper = {
    Unit = {
      Description = "Randomize wallpaper";
    };
    Service = {
      Type = "oneshot";
      ExecStart = "${pkgs.bash}/bin/bash ${./randomize_wallpaper.sh}";

      Timer = "*:0/1";
    };
    Install.WantedBy = [ "graphical-session.target" ];
  };
}