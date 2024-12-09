{ inputs, lib, config, pkgs, customPackages, ... }: let
  cursor = "Bibata-Original-Classic-Hyprcursor";
  cursorPackage = pkgs.callPackage ./bibata-hyprcursor {};
  cursor_size = 24;
in {
  # TODO: Only include if hyprland is enabled as the desktop environment

  imports = [
    ./ags.nix
    ./anyrun/anyrun.nix
    ./swww/swww.nix
    ./hyprlock/hyprlock.nix
    ./hypr_shortcuts.nix
  ];

  # Avoid placing environment variables in the hyprland.conf file.
  # Instead, use ~/.config/uwsm/env for theming, xcursor, nvidia and toolkit variables,
  # and ~/.config/uwsm/env-hyprland for HYPR* and AQ_* variables. The format is export KEY=VAL.
  home.file.".config/uwsm/env".text = ''
    export LIBVA_DRIVER_NAME=nvidia
    export XDG_SESSION_TYPE=wayland
    export GBM_BACKEND=nvidia-drm
    export __GLX_VENDOR_LIBRARY_NAME=nvidia
    export NVD_BACKEND=direct

    export NIXOS_OZONE_WL=1
    export NIXPKGS_ALLOW_UNFREE=1
    export XDG_CURRENT_DESKTOP=Hyprland
    export XDG_SESSION_DESKTOP=Hyprland
    export GDK_BACKEND=wayland, x11
    export CLUTTER_BACKEND=wayland
    export QT_QPA_PLATFORM=wayland;xcb
    export QT_WAYLAND_DISABLE_WINDOWDECORATION=1
    export QT_AUTO_SCREEN_SCALE_FACTOR=1
    export SDL_VIDEODRIVER=x11
    export MOZ_ENABLE_WAYLAND=1

    # Can fix flickering in Electron apps
    export ELECTRON_OZONE_PLATFORM_HINT = auto

    export XCURSOR_SIZE = ${toString cursor_size}
  '';
  home.file.".config/uwsm/env-hyprland".text = ''
    export HYPRCURSOR_SIZE = ${toString cursor_size}
  '';

  home.packages = with pkgs; [
    hyprpicker
    hyprcursor
    hyprlock
    hypridle
    inputs.pyprland.packages.${pkgs.system}.pyprland

    wev # A wayland event viewer

    slurp # Select a region in wayland
    grim # Screenshot utility for wayland
    wl-clipboard # Wayland clipboard utilities
  ];

  # TODO: Configure hypridle https://github.com/hyprwm/hypridle
  # TODO: Configure pyprland https://github.com/hyprland-community/pyprland
  # ...or sww? https://github.com/LGFae/swww

  # TODO: Look into https://github.com/hyprland-community/hyprland-autoname-workspaces

  # https://gitlab.com/Zaney/zaneyos/-/blob/main/config/hyprland.nix
  wayland.windowManager.hyprland = {
    enable = true;

    xwayland.enable = true;
    systemd.enable = false; # Conflicts with uwsm

    settings = {
      "$terminal" = "kitty";
      "$fileManager" = "nemo";

      # Note: environment variables should be set in the env files
      # above instead of here. I think. Maybe.

      # We should use uwsm app -- <app> instead of spawning apps as a child process
      exec-once = [
        "hyprlock" # We automatically boot into hyprland, so we need to lock the screen on startup

        "uwsm app -- firefox"
        "hyprctl setcursor ${cursor} ${toString cursor_size}"
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
        gaps_out = 10;
        border_size = 2;

        # https://wiki.hyprland.org/Configuring/Variables/#variable-types
        # "col.active_border" = "rgba(cc945fff) rgba(e1ad8dff) 45deg";
        "col.active_border" = "rgba(e28936ff) rgba(e1ad8dff) 45deg";
        "col.inactive_border" = "rgba(655653cc) rgba(3b3433cc) 45deg";

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

          size = 8;
          passes = 3;
          noise = 0.0117; # [0, 1]
          contrast = 0.8916; # [0, 2]
          brightness = 0.8172; # [0, 2]
          vibrancy = 0.1696; # [0, 1]
          vibrancy_darkness = 0; # [0, 1]

          ignore_opacity = true;
          new_optimizations = true;
          # Make windows ignore windows beneath them; improves performance but can look weird with floating windows
          xray = false;
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
        # Always float Kitty windows and make them transparent (terminal)
        # "float, class:(kitty)" # Not so sure about this one
        # 80% opacity when active, 50% when inactive, 90% when fullscreen
        # Nevermind -- I now do this in my kitty config
        # "opacity 0.8 override 0.5 override 0.9 override, class:(kitty)"
      ];

      layerrule = [
        # Blur the background when Anyrun is open
        # This doesn't look great since I use a really aggressive blur
        # "blur, ^anyrun$"
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

  # Cursor theme
  # https://github.com/fufexan/dotfiles/blob/17939d902a780a6db459312baa40940ff2a9c149/home/programs/wayland/hyprland/default.nix#L21C1-L21C84
  # I'm not super happy with this solution, but it works for now.
  xdg.dataFile."icons/${cursor}".source = "${cursorPackage}/share/icons/${cursor}";

  home.pointerCursor = {
    gtk.enable = true;
    # x11.enable = true;
    package = cursorPackage;
    name = cursor;
    size = cursor_size;
  };
}