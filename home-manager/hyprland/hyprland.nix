{ inputs, lib, config, pkgs, ... }: let
  cursor = "Bibata-Original-Classic-Hyprcursor";
  cursorPackage = pkgs.callPackage ./bibata-hyprcursor {};
  cursor_size = 24;
in {
  # TODO: Only include if hyprland is enabled as the desktop environment?

  imports = [
    # ./wayvnc.nix # TODO: Figure out how to get this working
    
    ./ags/ags.nix
    ./pyprland/pyprland.nix
    ./swww/swww.nix
    ./hyprlock/hyprlock.nix
    ./hyprlock/hypridle.nix
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
    export GDK_BACKEND=wayland,x11
    export CLUTTER_BACKEND=wayland
    export QT_QPA_PLATFORM=wayland;xcb
    export QT_WAYLAND_DISABLE_WINDOWDECORATION=1
    export QT_AUTO_SCREEN_SCALE_FACTOR=1
    export SDL_VIDEODRIVER=x11
    export MOZ_ENABLE_WAYLAND=1

    # Can fix flickering in Electron apps
    export ELECTRON_OZONE_PLATFORM_HINT = auto
  '';

  home.packages = with pkgs; [
    hyprpicker # Color picker for Hyprland
    hyprcursor
    hyprpolkitagent # Polkit authentication agent for Hyprland

    wev # A wayland event viewer

    slurp # Select a region in wayland
    grim # Screenshot utility for wayland
    wl-clipboard # Wayland clipboard utilities
    wl-clip-persist # Keep clipboard content even after programs exit

    # TODO: This fails to launch with a segfault on my laptop but works on my desktop?
    inputs.woomer.packages.${system}.default # Zoomer application for wayland
  ];

  # TODO: Look into https://github.com/hyprland-community/hyprland-autoname-workspaces

  # https://gitlab.com/Zaney/zaneyos/-/blob/main/config/hyprland.nix
  wayland.windowManager.hyprland = {
    enable = true;

    xwayland.enable = true;
    systemd.enable = false; # Conflicts with uwsm

    settings = {
      "$terminal" = "uwsm app -- kitty";
      "$fileManager" = "uwsm app -- thunar";
      "$lockScreen" = lib.mkDefault "uwsm app -- sh ${./hyprlock/hyprlock_nvidia_screenshot_fix.sh}";

      # Note: environment variables should be set in the env files
      # above instead of here. I think. Maybe.

      # We should use uwsm app -- <app> instead of spawning apps as a child process
      exec-once = [
        "$lockScreen --no-fade-in --immediate-render" # We automatically boot into hyprland, so we need to lock the screen on startup
        "hyprctl setcursor ${cursor} ${toString cursor_size}"
        "dconf write /org/gnome/desktop/interface/cursor-theme \"${cursor}\""
        # x8 is required to have a correct cursor size with fractional scaling
        "dconf write /org/gnome/desktop/interface/cursor-size ${toString cursor_size}"
        "systemctl --user start hyprpolkitagent"
        # TODO: This breaks the clipboard for some reason?
        # "wl-clip-persist --clipboard regular --all-mime-type-regex '(?i)^(?!image/).+'"
        
        # Applications to autostart
        "uwsm app -- vesktop"
      ];

      # https://wiki.hyprland.org/Configuring/Monitors/
      monitor = [
        # Configured per host
        ", preferred, auto, 1"
      ];

      general = {
        gaps_in = 5;
        gaps_out = 10;
        border_size = 2;

        # https://wiki.hyprland.org/Configuring/Variables/#variable-types
        "col.active_border" = "rgba(36a3e2ff) rgba(5090b5ff) 45deg";
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

          size = 7;
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
        # Disables the random hyprland-related backgrounds; this avoids flickering
        # at boot if swww doesn't start before the desktop shows and, sometimes, hyprlock.
        # (although we still have them as part of our randomized wallpaper setup)
        disable_hyprland_logo = true;
        force_default_wallpaper = 0;
      };

      # https://wiki.hyprland.org/Configuring/Window-Rules/
      # https://wiki.hyprland.org/Configuring/Workspace-Rules/

      windowrulev2 = [
        # Ignore maximize requests from apps
        "suppressevent maximize, class:.*"
        # Fix some dragging issues with XWayland
        "nofocus,class:^$,title:^$,xwayland:1,floating:1,fullscreen:0,pinned:0"

        # Always float Thunar windows (file manager)
        "float, class:(thunar)"
        # Always float qimgv windows (image viewer)
        "float, class:(qimgv)"

        # Fixes for Unreal Engine
        "unset,class:^(UnrealEditor)$"
        "noinitialfocus,class:^(UnrealEditor)$"
        "suppressevent activate,class:^(UnrealEditor)$"
      ];

      layerrule = [
        "blur, ^ags-bar-window$"
        "ignorezero, ^ags-bar-window$"
        "blur, ^ags-popup-window$"
        "ignorezero, ^ags-popup-window$"
        "blur, ^ags-notifications$"
        "ignorezero, ^ags-notifications$"
      ];

      cursor = {
        # Causes cursor scale issues
        sync_gsettings_theme = false;
      };
    };

    # Settings that don't work in Nix for some reason
    extraConfig = ''
    xwayland {
      force_zero_scaling = true
    }
    '';
  };

  # Works for a few apps to default to dark mode
  dconf.settings."org/gnome/desktop/interface" = {
    color-scheme = "prefer-dark";
  };

  # Gtk theming
  gtk = {
    enable = true;
    theme = {
      name = "Adwaita-dark";
      package = pkgs.gnome-themes-extra;
    };
    iconTheme = {
      name = "Adwaita-dark";
      package = pkgs.gnome-themes-extra;
    };
  };

  # Qt theming
  qt = {
    enable = true;
    platformTheme.name = "qtct";
    style.name = "kvantum";
  };
  xdg.configFile = {
    "Kvantum/kvantum.kvconfig".text = ''
      [General]
      theme=ArcDarker
    '';

    "Kvantum/ArcDarker".source = "${pkgs.arc-kde-theme}/Kvantum/ArcDark"; # Or Arc/ArcDarker 
  };

  # Cursor theme
  # https://github.com/fufexan/dotfiles/blob/17939d902a780a6db459312baa40940ff2a9c149/home/programs/wayland/hyprland/default.nix#L21C1-L21C84
  # I'm not super happy with this solution, but it works for now.
  xdg.dataFile."icons/${cursor}".source = "${cursorPackage}/share/icons/${cursor}";

  home.pointerCursor = {
    gtk.enable = true;
    x11.enable = true;
    # package = cursorPackage;
    # Fixes cursor size issues for some reason... I want to fix this
    # so we use a consistent cursor theme, but I've already spent too much time on it.
    package = pkgs.xorg.xcursorthemes;
    name = "Adwaita";
    size = cursor_size;
  };
}