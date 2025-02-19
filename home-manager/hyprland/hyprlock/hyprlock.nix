{ inputs, lib, config, pkgs, ... }: {
  home.packages = with pkgs; [
    inputs.hyprlock.packages.${pkgs.system}.hyprlock
  ];
  
  programs.hyprlock = {
    enable = true;
    package = inputs.hyprlock.packages.${pkgs.system}.hyprlock;

    # https://wiki.hyprland.org/Hypr-Ecosystem/hyprlock/

    # Inspired by https://github.com/justinmdickey/publicdots/tree/main
    settings = {
      general = {
        disable_loading_bar = false;
        grace = 0;
        hide_cursor = true;
        no_fade_in = false;
      };

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