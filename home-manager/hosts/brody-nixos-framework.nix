{ inputs, lib, config, pkgs, ... }: {
  wayland.windowManager.hyprland.settings = {
    "$lockScreen" = "uwsm app -- hyprlock"; # No need to use our nvidia screenshot fix script.
    monitor = [
      # Laptop screen
      "eDP-1, 2256x1504@59.999, 0x0, 1.175"
    ];

    input = {
      kb_layout = "us";
      kb_variant = "";
      kb_model = "";
      kb_options = "";
      kb_rules = "";

      follow_mouse = 1;

      # [-1.0, 1.0]; 0 is default.
      sensitivity = 0.2;

      touchpad = {
        # Scrolling moves the content in the opposite direction of the fingers
        natural_scroll = true;
        # TODO: Configure more touchpad settings
      };
    };

    gestures = {
      workspace_swipe = true;
      workspace_swipe_invert = true;
      workspace_swipe_forever = true;
    };

    # Most stable
    "render:explicit_sync" = 1;
  };

  services.hypridle.settings = {
    listener = [
      {
        timeout = 150; # 2.5 minutes
        on-timeout = "brightnessctl -s set 10"; # Set monitor backlight to minimum; avoid 0 on OLED monitor.
        on-resume = "brightnessctl -r"; # Monitor backlight restore.
      }
      { 
        timeout = 150; # 2.5 minutes
        on-timeout = "brightnessctl -sd rgb:kbd_backlight set 0"; # Turn off keyboard backlight.
        on-resume = "brightnessctl -rd rgb:kbd_backlight"; # Turn on keyboard backlight.
      }
    ];
  };

  programs.hyprlock.settings = {
    background = [
      {
        path = "screenshot"; # We can use this because we're not using Nvidia hardware.
        blur_passes = 3;
        blur_size = 2;
      }
    ];

    label = [ 
      { # Fingerprint reader message
        monitor = "";
        text = "$FPRINTMESSAGE";
        color = "rgba(242, 243, 244, 0.75)";
        font_size = 22;
        font_family = "JetBrains Mono";
        position = "0, -75";
        halign = "center";
        valign = "center";
        zindex = 5;
      }
    ];

    general = {
      enable_fingerprint = true;
      fingerprint_ready_message = "Scan fingerprint";
      fingerprint_present_message = "Scanning fingerprint...";
    };
  };
}