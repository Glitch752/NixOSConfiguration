{ inputs, lib, config, pkgs, ... }: {
  miscPrograms.disableGPUCompositing = false;

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
        scroll_factor = 0.8;
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

  # The Framework 13 has 4 lights we can adjust:
  # input0::scrolllock
  # input0::capslock
  # input0::numlock
  # framework_laptop::kbd_backlight

  services.hypridle.settings = {
    listener = [
      {
        timeout = 150; # 2.5 minutes
        on-timeout = "brillo -O && brillo -S 10% -u 1000000"; # Set monitor backlight to minimum; avoid 0 on OLED monitor.
        on-resume = "brillo -I -u 200000"; # Monitor backlight restore.
      }
      { 
        timeout = 150; # 2.5 minutes
        # Sadly, the keyboard backlight's current brightness can't
        # be read, so animations and restoring to the previous
        # brightness level are not possible.
        # I just turn the backlight fully on when resuming no matter what.
        on-timeout = "brillo -S 0% -k framework_laptop:kbd_backlight";
        on-resume = "brillo -S 100% -k framework_laptop:kbd_backlight";
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
      {
        monitor = "";
        text = "$FPRINTPROMPT";
        color = "rgba(242, 243, 244, 0.75)";
        font_size = 22;
        font_family = "JetBrains Mono";
        position = "0, -80";
        halign = "center";
        valign = "center";
        zindex = 5;
      }  
      # {
      #   monitor = "";
      #   text = "$FPRINTFAIL";
      #   color = "rgba(255, 220, 220, 0.75)";
      #   font_size = 20;
      #   font_family = "JetBrains Mono";
      #   position = "0, -30";
      #   halign = "center";
      #   valign = "center";
      #   zindex = 5;
      # }

      { # Battery percentage
        monitor = "";
        text = ''cmd[update:1000] sh ${../hyprland/hyprlock/scripts/battery.sh}'';
        font_size = 18;
        font_family = "JetBrains Mono";
        position = "-15, -15";
        halign = "right";
        valign = "top";
      }
    ];

    auth = {
      "fingerprint:enabled" = true;
      "fingerprint:ready_message" = "Scan fingerprint";
      "fingerprint:present_message" = "Scanning fingerprint...";
    };
  };

  # Fusuma is a multitouch gesture recognizer for Linux
  services.fusuma = {
    enable = true;
    extraPackages = with pkgs; [
      # Required for some reason? Fusuma crashes otherwise.
      # https://discourse.nixos.org/t/fusuma-not-working/21416/4
      coreutils-full

      wtype # Keypress emulation
    ];
    settings = {
      threshold = {
        swipe = 0.1;
      };
      interval = {
        swipe = 0.7;
      };
      swipe = {
        # For browsers: ctrl+tab / ctrl+shift+tab with 4-finger swipe
        "4" = {
          left = {
            command = "wtype -M ctrl -M shift -P Tab -p Tab -m ctrl -m shift";
          };
          right = {
            command = "wtype -M ctrl -P Tab -p Tab -m ctrl";
          };
        };
      };
    };
  };
  # Also add wtype to normal packages for testing
  home.packages = [ pkgs.wtype ];
}