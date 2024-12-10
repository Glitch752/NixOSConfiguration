{ inputs, lib, config, pkgs, ... }: {
  programs.hyprlock = {
    enable = true;

    # https://wiki.hyprland.org/Hypr-Ecosystem/hyprlock/

    # Inspired by https://github.com/justinmdickey/publicdots/tree/main
    settings = {
      general = {
        disable_loading_bar = false;
        grace = 0;
        hide_cursor = true;
        no_fade_in = false;
        # enable_fingerprint TODO once I get this set up on my laptop
      };

      background = [
        # Path=screenshot is broken on Nvidia hardware. We manually take a screenshot with grim for each monitor instead.
        # {
        #   monitor = "DP-1";
        #   path = "/tmp/dp-1-lock.png";
        #   blur_passes = 3;
        #   blur_size = 2;
        # }
        # {
        #   monitor = "HDMI-A-2";
        #   path = "/tmp/hdmi-a-2-lock.png";
        #   blur_passes = 3;
        #   blur_size = 2;
        # }
        # {
        #   monitor = "HDMI-A-1";
        #   path = "/tmp/hdmi-a-1-lock.png";
        #   blur_passes = 3;
        #   blur_size = 2;
        # }

        # Non-monitor-specific backgrounds load much faster;
        # maybe there's a way to decompress and lower the quality of the images first before opening hyprlock though?
        {
          path = "/tmp/dp-1-lock.png";
          blur_passes = 3;
          blur_size = 2;
        }
      ];

      input-field = [
        {
          monitor = "";
          size = "350, 55";
          outline_thickness = 2;
          # Scale of input-field height, 0.2 - 0.8
          dots_size = 0.2;
          # Scale of dots' absolute size, 0.0 - 1.0
          dots_spacing = 0.35;
          dots_center = true;
          outer_color = "rgba(0, 0, 0, 0)";
          inner_color = "rgba(0, 0, 0, 0.3)";
          font_color = "rgba(255, 255, 255, 1)";
          fade_on_empty = false;
          rounding = 10;
          check_color = "rgba(201, 177, 140, 0.3)";
          placeholder_text = ''<i><span foreground="##cdd6f4">Password...</span></i>'';
          hide_input = false;
          position = "0, -150";
          halign = "center";
          valign = "center";
        }
      ];

      label = [ # Positive positions are upward
        { # Date
          monitor = "";
          text = ''cmd[update:1000] date +"%A, %B %d"'';
          color = "rgba(242, 243, 244, 0.75)";
          font_size = 22;
          font_family = "JetBrains Mono";
          position = "0, 200";
          halign = "center";
          valign = "center";
          zindex = 5;
        }
        { # Date shadow
          monitor = "";
          text = ''cmd[update:1000] date +"%A, %B %d"'';
          color = "rgba(0, 0, 0, 0.75)";
          font_size = 22;
          font_family = "JetBrains Mono";
          position = "2, 198";
          halign = "center";
          valign = "center";
          zindex = 4;
        }

        { # Time
          monitor = "";
          text = ''cmd[update:1000] date +"%-I:%M"'';
          color = "rgba(242, 243, 244, 0.75)";
          font_size = 95;
          font_family = "JetBrains Mono Extrabold";
          position = "0, 100";
          halign = "center";
          valign = "center";
          zindex = 5;
        }
        { # Time shadow
          monitor = "";
          text = ''cmd[update:1000] date +"%-I:%M"'';
          color = "rgba(0, 0, 0, 0.75)";
          font_size = 95;
          font_family = "JetBrains Mono Extrabold";
          position = "4, 96";
          halign = "center";
          valign = "center";
          zindex = 4;
        }

        { # User
          monitor = "";
          text = ''cmd[update:1000] sh ${./scripts/userInfo.sh}'';
          color = "rgba(255, 255, 255, 0.8)";
          font_size = 18;
          font_family = "JetBrains Mono";
          position = "0, 40";
          halign = "center";
          valign = "bottom";
        }
      ];
    };
  };
}