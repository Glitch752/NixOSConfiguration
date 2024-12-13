{ inputs, lib, config, pkgs, ... }: {
  home.packages = with pkgs; [
    hypridle
  ];

  # https://wiki.hyprland.org/Hypr-Ecosystem/hypridle/
  # Will automatically enable the systemd service
  services.hypridle = {
    enable = true;

    settings = {
      general = {
        ignore_dbus_inhibit = false;
        after_sleep_cmd = "hyprctl dispatch dpms on"; # Turn the display back on after resume.
        lock_cmd = "pidof hyprlock || hyprlock"; # Avoid locking multiple times.
        before_sleep_cmd = "loginctl lock-session"; # Lock the session before sleeping.
      };

      listener = [
        {
          timeout = 600; # 10 minutes
          # Lock screen
          on-timeout = "hyprlock";
        }
        {
          timeout = 1200; # 20 minutes
          # Screen off
          on-timeout = "hyprctl dispatch dpms off";
          on-resume = "hyprctl dispatch dpms on";
        }
      ];
    };
  };
}