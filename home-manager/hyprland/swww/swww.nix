{ inputs, lib, config, pkgs, ... }: let wallpaperDir = "${config.home.homeDirectory}/Pictures/Wallpapers"; in {
  home.packages = [
    inputs.swww.packages.${pkgs.system}.swww
  ];

  home.sessionVariables = {
    WALLPAPERS_DIR = wallpaperDir;
    WALLPAPER_STATE_FILE = "${config.home.homeDirectory}/.wallpapers";
    DISABLED_WALLPAPERS_STATE_FILE = "${config.home.homeDirectory}/.disabled_wallpapers";
  };
  
  wayland.windowManager.hyprland.settings = {
    bind = [
      # Re-randomize the wallpaper when pressing Meta + `
      "$mainMod, Grave, exec, uwsm app -- sh ${./randomize_wallpaper.sh}"
    ];

    exec-once = [
      "swww-daemon" # Or `swww init`?
      "uwsm app -- sh ${./randomize_wallpaper.sh}"
    ];
  };

  # Copy all wallpapers from ./wallpapers to the user's wallpaper directory
  home.file."${wallpaperDir}" = {
    source = ./wallpapers;
    recursive = true;
  };

  # Systemd service to re-randomize the wallpaper occasionally
  systemd.user.services.randomize_wallpaper = {
    Unit = {
      Description = "Randomize wallpaper";
    };
    Service = {
      Type = "oneshot";
      ExecStart = "${pkgs.writeShellScript "rerandomize_wallpaper" ''
        sh ${./randomize_wallpaper.sh}
      ''}";
    };
  };
  systemd.user.timers.randomize_wallpaper = {
    Unit = {
      Description = "Randomize wallpaper every hour";
    };
    Timer = {
      OnCalendar = "*:0"; # Every hour
      Persistent = true;
    };
    Install = {
      WantedBy = [ "timers.target" ];
    };
  };
}