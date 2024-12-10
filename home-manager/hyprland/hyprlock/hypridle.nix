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
        # TODO: Enable only when on laptop
        # {
        #   timeout = 150;                          # 2.5min.
        #   on-timeout = "brightnessctl -s set 10"; # set monitor backlight to minimum, avoid 0 on OLED monitor.
        #   on-resume = "brightnessctl -r";         # monitor backlight restore.
        # }
        # { # Turn off keyboard backlight, comment out this section if you dont have a keyboard backlight. 
        #   timeout = 150;                                            # 2.5min.
        #   on-timeout = "brightnessctl -sd rgb:kbd_backlight set 0"; # turn off keyboard backlight.
        #   on-resume = "brightnessctl -rd rgb:kbd_backlight";        # turn on keyboard backlight.
        # }

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