{ inputs, lib, config, pkgs, ... }: {
  programs.hyprlock = {
    enable = true;

    # TODO: Investigate solutions for https://github.com/hyprwm/hyprlock/issues/572 or alternative lockers if necessary

    # https://wiki.hyprland.org/Hypr-Ecosystem/hyprlock/
    settings = {
      general = {
        disable_loading_bar = false;
        grace = 0;
        hide_cursor = false;
        no_fade_in = false;
        # enable_fingerprint TODO once I get this set up on my laptop
      };

      background = [
        {
          # Use a screenshot of the desktop as the background
          path = "screenshot";
          blur_passes = 3;
          blur_size = 8;
        }
      ];

      input-field = [
        {
          size = "200, 50";
          position = "0, -80";
          monitor = "";
          dots_center = true;
          fade_on_empty = false;
          font_color = "rgb(202, 211, 245)";
          inner_color = "rgb(91, 96, 120)";
          outer_color = "rgb(24, 25, 38)";
          outline_thickness = 5;
          placeholder_text = ''<span foreground=""#cad3f5"">Password...</span>'';
          shadow_passes = 2;
        }
      ];
    };
  };
}