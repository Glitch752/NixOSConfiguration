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
        lock_cmd = "pidof hyprlock || hyprlock";       # avoid starting multiple hyprlock instances.
        before_sleep_cmd = "loginctl lock-session";    # lock before suspend.
        after_sleep_cmd = "hyprctl dispatch dpms on";  # to avoid having to press a key twice to turn on the display.
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

  # Required until https://github.com/nix-community/home-manager/pull/6086 is merged;
  # hypridle currently uses graphical-session-pre.target, which uwsm doesn't launch properly.
  systemd.user.services.hypridle.Unit.After = lib.mkForce "graphical-session.target";
}