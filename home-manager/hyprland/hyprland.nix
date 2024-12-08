{ inputs, lib, config, pkgs, ... }: {
  # TODO: Only include if hyprland is enabled as the desktop environment

  imports = [
    ./ags.nix
    ./anyrun/anyrun.nix
    ./hypr_shortcuts.nix
  ];

  # TODO: Configure hyprlock https://github.com/hyprwm/hyprlock
  # TODO: Configure hypridle https://github.com/hyprwm/hypridle
  # TODO: Configure hyprpaper https://github.com/hyprwm/hyprpaper
  # ...or sww? https://github.com/LGFae/swww

  # https://gitlab.com/Zaney/zaneyos/-/blob/main/config/hyprland.nix
  wayland.windowManager.hyprland = {
    enable = true;

    xwayland.enable = true;
    systemd.enable = true;

    settings = {
      env = [
        "LIBVA_DRIVER_NAME, nvidia"
        "XDG_SESSION_TYPE, wayland"
        "GBM_BACKEND, nvidia-drm"
        "__GLX_VENDOR_LIBRARY_NAME, nvidia"
        "NVD_BACKEND, direct"

        "NIXOS_OZONE_WL, 1"
        "NIXPKGS_ALLOW_UNFREE, 1"
        "XDG_CURRENT_DESKTOP, Hyprland"
        "XDG_SESSION_DESKTOP, Hyprland"
        "GDK_BACKEND, wayland, x11"
        "CLUTTER_BACKEND, wayland"
        "QT_QPA_PLATFORM=wayland;xcb"
        "QT_WAYLAND_DISABLE_WINDOWDECORATION, 1"
        "QT_AUTO_SCREEN_SCALE_FACTOR, 1"
        "SDL_VIDEODRIVER, x11"
        "MOZ_ENABLE_WAYLAND, 1"

        "ELECTRON_OZONE_PLATFORM_HINT,auto" # Can fix flickering in Electron apps

        "XCURSOR_SIZE,24"
        "HYPRCURSOR_SIZE,24"
      ];

      "$terminal" = "kitty";
      "$fileManager" = "dolphin";
      "$menu" = "wofi --show drun";

      exec-once = [
        "firefox"
        # hyprpaper
        # hyprctl setcursor ???? 32

        "dbus-update-activation-environment --systemd --all"
        "systemctl --user import-environment QT_QPA_PLATFORMTHEME WAYLAND_DISPLAY XDG_CURRENT_DESKTOP"
      ];

      # https://wiki.hyprland.org/Configuring/Monitors/
      monitor = [
        # Position (0, 0), fractional scaling of 1.25x
        # "DP-1, 2560x1440@179.88, 0x0, 1.25"
        # Fractional scaling causes flickering and other weird issues.
        # I could debug it, but I'm fine with 1x scaling for now.
        "DP-1, 2560x1440@179.88, 0x0, 1"
        "HDMI-A-2, 1600x900@60, 2560x270, 1"
        "HDMI-A-1, 1920x1080@119.98, -1920x180, 1"

        ", preferred, auto, 1"
      ];

      general = {
        gaps_in = 5;
        gaps_out = 20;

        border_size = 2;

        # https://wiki.hyprland.org/Configuring/Variables/#variable-types
        "col.active_border" = "rgba(33ccffee) rgba(00ff99ee) 45deg";
        "col.inactive_border" = "rgba(595959aa)";

        # Allow resizing windows by clicking and dragging on borders and gaps
        resize_on_border = false;

        # https://wiki.hyprland.org/Configuring/Tearing/
        allow_tearing = false;

        layout = "dwindle";
      };

      decoration = {
        rounding = 5;

        # Change transparency of focused and unfocused windows
        active_opacity = 1.0;
        inactive_opacity = 1.0;

        shadow = {
          enabled = true;
          range = 4;
          render_power = 3;
          color = "rgba(1a1a1aee)";
        };

        # https://wiki.hyprland.org/Configuring/Variables/#blur
        blur = {
          enabled = true;
          size = 3;
          passes = 1;
          vibrancy = 0.1696;
        };
      };

      animations = {
        enabled = true;

        # https://wiki.hyprland.org/Configuring/Animations/
        bezier = [
          "easeOutQuint,0.23,1,0.32,1"
          "easeInOutCubic,0.65,0.05,0.36,1"
          "linear,0,0,1,1"
          "almostLinear,0.5,0.5,0.75,1.0"
          "quick,0.15,0,0.1,1"
        ];

        animation = [
          "global, 1, 10, default"
          "border, 1, 5.39, easeOutQuint"
          "windows, 1, 4.79, easeOutQuint"
          "windowsIn, 1, 4.1, easeOutQuint, popin 87%"
          "windowsOut, 1, 1.49, linear, popin 87%"
          "fadeIn, 1, 1.73, almostLinear"
          "fadeOut, 1, 1.46, almostLinear"
          "fade, 1, 3.03, quick"
          "layers, 1, 3.81, easeOutQuint"
          "layersIn, 1, 4, easeOutQuint, fade"
          "layersOut, 1, 1.5, linear, fade"
          "fadeLayersIn, 1, 1.79, almostLinear"
          "fadeLayersOut, 1, 1.39, almostLinear"
          "workspaces, 1, 1.94, almostLinear, fade"
          "workspacesIn, 1, 1.21, almostLinear, fade"
          "workspacesOut, 1, 1.94, almostLinear, fade"
        ];
      };

      # https://wiki.hyprland.org/Configuring/Workspace-Rules/
      # "Smart gaps" / "No gaps when only"
      # uncomment all if you wish to use that.
      # workspace = w[tv1], gapsout:0, gapsin:0
      # workspace = f[1], gapsout:0, gapsin:0
      # windowrulev2 = bordersize 0, floating:0, onworkspace:w[tv1]
      # windowrulev2 = rounding 0, floating:0, onworkspace:w[tv1]
      # windowrulev2 = bordersize 0, floating:0, onworkspace:f[1]
      # windowrulev2 = rounding 0, floating:0, onworkspace:f[1]

      # https://wiki.hyprland.org/Configuring/Dwindle-Layout/
      dwindle = {
        # Pseudotiling; bound to mainMod + P in the keybinds section below
        pseudotile = true;
        preserve_split = true;
      };

      # https://wiki.hyprland.org/Configuring/Master-Layout/
      master = {
        new_status = "master";
      };

      # https://wiki.hyprland.org/Configuring/Variables/#misc
      misc = {
        # 0 or 1 to disable the default random wallpapers
        force_default_wallpaper = -1;
        # Disables the random hyprland-related backgrounds
        disable_hyprland_logo = false;
      };

      input = {
        kb_layout = "us";
        kb_variant = "";
        kb_model = "";
        kb_options = "";
        kb_rules = "";

        follow_mouse = 1;

        # [-1.0, 1.0]; 0 is default.
        sensitivity = -0.6;

        touchpad = {
            natural_scroll = false;
        };
      };
      gestures = {
        workspace_swipe = false;
      };

      # https://wiki.hyprland.org/Configuring/Window-Rules/
      # https://wiki.hyprland.org/Configuring/Workspace-Rules/

      windowrulev2 = [
        # Ignore maximize requests from apps
        "suppressevent maximize, class:.*"
        # Fix some dragging issues with XWayland
        "nofocus,class:^$,title:^$,xwayland:1,floating:1,fullscreen:0,pinned:0"

        # Always float Nemo windows (file manager)
        "float, class:(nemo)"
      ];

      # Helps when using NVidia drivers
      cursor = {
        no_hardware_cursors = true;
      };
      "render:explicit_sync" = 0;
    };

    # Settings that don't work in Nix for some reason
    extraConfig = ''
    xwayland {
      force_zero_scaling = true
    }
    '';
  };

  # Gtk theming
  gtk = {
    enable = true;
    theme = {
      name = "Adwaita";
    };
    iconTheme = {
      name = "Adwaita";
    };
  };
}