# https://nixos-and-flakes.thiscute.world/nixos-with-flakes/start-using-home-manager
{ inputs, lib, config, pkgs, ... }: {
  imports = [
    inputs.nix-colors.homeManagerModule
  ];

  colorScheme = inputs.nix-colors.colorSchemes.dracula;

  home = {
    username = "brody";
    homeDirectory = "/home/brody";
  };

  # https://gitlab.com/Zaney/zaneyos/-/blob/main/config/hyprland.nix
  # TODO: This should be part of the hyprland configuration file, not the user configuration file.
  # I don't know how to properly manage that, though.
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

        "XCURSOR_SIZE,24"
        "HYPRCURSOR_SIZE,24"
      ];

      "$terminal" = "kitty";
      "$fileManager" = "dolphin";
      "$menu" = "wofi --show drun";

      exec-once = [
        "firefox" # waybar & hyprpaper & ...
        "dbus-update-activation-environment --systemd --all"
        "systemctl --user import-environment QT_QPA_PLATFORMTHEME WAYLAND_DISPLAY XDG_CURRENT_DESKTOP"
      ];

      monitor = [
        "monitor=,preferred,auto,auto"
        # TODO: Properly configure monitor settings
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
        sensitivity = 0;

        touchpad = {
            natural_scroll = false;
        };
      };
      gestures = {
        workspace_swipe = false;
      };

      # https://wiki.hyprland.org/Configuring/Keywords/#per-device-input-configs if needed

      # https://wiki.hyprland.org/Configuring/Keywords/
      "$mainMod" = "SUPER";

      # I'll sort through these later...

      # # Example binds, see https://wiki.hyprland.org/Configuring/Binds/ for more
      # bind = $mainMod, Q, exec, $terminal
      # bind = $mainMod, C, killactive,
      # bind = $mainMod, M, exit,
      # bind = $mainMod, E, exec, $fileManager
      # bind = $mainMod, V, togglefloating,
      # bind = $mainMod, R, exec, $menu
      # bind = $mainMod, P, pseudo, # dwindle
      # bind = $mainMod, J, togglesplit, # dwindle

      # # Move focus with mainMod + arrow keys
      # bind = $mainMod, left, movefocus, l
      # bind = $mainMod, right, movefocus, r
      # bind = $mainMod, up, movefocus, u
      # bind = $mainMod, down, movefocus, d

      # # Switch workspaces with mainMod + [0-9]
      # bind = $mainMod, 1, workspace, 1
      # bind = $mainMod, 2, workspace, 2
      # bind = $mainMod, 3, workspace, 3
      # bind = $mainMod, 4, workspace, 4
      # bind = $mainMod, 5, workspace, 5
      # bind = $mainMod, 6, workspace, 6
      # bind = $mainMod, 7, workspace, 7
      # bind = $mainMod, 8, workspace, 8
      # bind = $mainMod, 9, workspace, 9
      # bind = $mainMod, 0, workspace, 10

      # # Move active window to a workspace with mainMod + SHIFT + [0-9]
      # bind = $mainMod SHIFT, 1, movetoworkspace, 1
      # bind = $mainMod SHIFT, 2, movetoworkspace, 2
      # bind = $mainMod SHIFT, 3, movetoworkspace, 3
      # bind = $mainMod SHIFT, 4, movetoworkspace, 4
      # bind = $mainMod SHIFT, 5, movetoworkspace, 5
      # bind = $mainMod SHIFT, 6, movetoworkspace, 6
      # bind = $mainMod SHIFT, 7, movetoworkspace, 7
      # bind = $mainMod SHIFT, 8, movetoworkspace, 8
      # bind = $mainMod SHIFT, 9, movetoworkspace, 9
      # bind = $mainMod SHIFT, 0, movetoworkspace, 10

      # # Example special workspace (scratchpad)
      # bind = $mainMod, S, togglespecialworkspace, magic
      # bind = $mainMod SHIFT, S, movetoworkspace, special:magic

      # # Scroll through existing workspaces with mainMod + scroll
      # bind = $mainMod, mouse_down, workspace, e+1
      # bind = $mainMod, mouse_up, workspace, e-1

      # # Move/resize windows with mainMod + LMB/RMB and dragging
      # bindm = $mainMod, mouse:272, movewindow
      # bindm = $mainMod, mouse:273, resizewindow

      # # Laptop multimedia keys for volume and LCD brightness
      # bindel = ,XF86AudioRaiseVolume, exec, wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%+
      # bindel = ,XF86AudioLowerVolume, exec, wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-
      # bindel = ,XF86AudioMute, exec, wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle
      # bindel = ,XF86AudioMicMute, exec, wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle
      # bindel = ,XF86MonBrightnessUp, exec, brightnessctl s 10%+
      # bindel = ,XF86MonBrightnessDown, exec, brightnessctl s 10%-

      # # Requires playerctl
      # bindl = , XF86AudioNext, exec, playerctl next
      # bindl = , XF86AudioPause, exec, playerctl play-pause
      # bindl = , XF86AudioPlay, exec, playerctl play-pause
      # bindl = , XF86AudioPrev, exec, playerctl previous

      # https://wiki.hyprland.org/Configuring/Window-Rules/
      # https://wiki.hyprland.org/Configuring/Workspace-Rules/

      windowrulev2 = [
        # Ignore maximize requests from apps
        "suppressevent maximize, class:.*"
        # Fix some dragging issues with XWayland
        "nofocus,class:^$,title:^$,xwayland:1,floating:1,fullscreen:0,pinned:0"
      ];

      # Helps when using NVidia drivers
      cursor = {
        no_hardware_cursors = true;
      };
    };
  };

  # set cursor size and dpi for 4k monitor
  # xresources.properties = {
  #   "Xcursor.size" = 16;
  #   "Xft.dpi" = 172;
  # };

  # Packages that should be installed to the user profile.
  home.packages = with pkgs; [
    neofetch
    nnn # Terminal file manager

    # archives
    zip
    xz
    unzip
    p7zip

    ripgrep # recursively searches directories for a regex pattern
    jq # A lightweight and flexible command-line JSON processor
    fzf # A command-line fuzzy finder

    dnsutils  # `dig` + `nslookup`
    ldns # replacement of `dig`, the command `drill`
    nmap # A utility for network discovery and security auditing

    cowsay
    file
    which
    tree

    # Provides the command `nom` works just like `nix`
    # with more details log output
    nix-output-monitor

    glow # markdown previewer in terminal

    pciutils # provides the command `lspci`
  ];

  # basic configuration of git, please change to your own
  programs.git = {
    enable = true;
    userName = "Glitch752";
    userEmail = "xxGlitch752xx@gmail.com";
  };

  programs.bash = {
    enable = true;
    enableCompletion = true;
    # The bashrc file
    bashrcExtra = ''
      
    '';

    shellAliases = {
      # c = "cd";
    };
  };

  # https://nixos.wiki/wiki/Visual_Studio_Code
  programs.vscode = {
    enable = true;
    extensions = with pkgs.vscode-extensions; [
      # TODO
    ];
  };

  # Nicely reload system units when changing configs
  systemd.user.startServices = "sd-switch";

  # This value determines the home Manager release that your
  # configuration is compatible with. This helps avoid breakage
  # when a new home Manager release introduces backwards
  # incompatible changes.
  #
  # You can update home Manager without changing this value. See
  # the home Manager release notes for a list of state version
  # changes in each release.
  home.stateVersion = "24.11";

  # Let home Manager install and manage itself.
  programs.home-manager.enable = true;
}
