{ inputs, lib, config, pkgs, ... }: {
  wayland.windowManager.hyprland.settings = {
    # https://wiki.hyprland.org/Configuring/Keywords/#per-device-input-configs if needed
    # https://wiki.hyprland.org/Configuring/Keywords/
    "$mainMod" = "SUPER";

    # Keep this in mind for spawning applications: https://wiki.hyprland.org/Useful-Utilities/Systemd-start/#launching-applications-inside-session

    # Bind flags:
    # l -> locked, will also work when an input inhibitor (e.g. a lockscreen) is active.
    # r -> release, will trigger on release of a key.
    # o -> longPress, will trigger on long press of a key.
    # e -> repeat, will repeat when held.
    # n -> non-consuming, key/mouse events will be passed to the active window in addition to triggering the dispatcher.
    # m -> mouse, see below.
    # t -> transparent, cannot be shadowed by other binds.
    # i -> ignore mods, will ignore modifiers.
    # s -> separate, will arbitrarily combine keys between each mod/key, see [Keysym combos](#keysym-combos) above.
    # d -> has description, will allow you to write a description for your bind.
    # p -> bypasses the app's requests to inhibit keybinds.

    # https://wiki.hyprland.org/Configuring/Binds/
    bind = [
      # TODO: This is _very_ temporary. I want to add a user interface or configuration file for this.
      # It should only show when on my home network.
      # I just think this is cool for now.
      "$mainMod, BackSpace, exec, curl -X POST http://192.168.68.112/switch/kauf_plug/toggle"

      "$mainMod, Q, exec, $terminal"

      # Pyprland shortcuts
      "$mainMod, X, exec, pypr fetch_client_menu"
      "$mainMod SHIFT, X, exec, pypr unfetch_client"
      "$mainMod, O, exec, pypr shift_monitors +1"
      "$mainMod SHIFT, O, exec, pypr shift_monitors -1"

      "$mainMod SHIFT, Z, exec, woomer" # Zoom utility

      "$mainMod, C, killactive,"
      "$mainMod, L, exec, $lockScreen"
      "$mainMod, E, exec, $fileManager"
      "$mainMod, Z, togglefloating,"
      "$mainMod, P, pseudo," # dwindle
      "$mainMod, J, togglesplit," # dwindle
      "$mainMod, F, fullscreen" # fullscreen

      # Custom ags menu binds
      "$mainMod, Space, exec, ags request -i main 'open controlsPopup'"
      "$mainMod, M, exec, ags request -i main 'open mediaControls'"

      # Screenshots
      "$mainMod SHIFT, S, exec, uwsm app -- grim -g \"$(slurp)\" - | wl-copy"

      # Color picker
      "$mainMod SHIFT, C, exec, uwsm app -- hyprpicker --autocopy"

      # Move focus with mainMod + arrow keys
      "$mainMod, left, movefocus, l"
      "$mainMod, right, movefocus, r"
      "$mainMod, up, movefocus, u"
      "$mainMod, down, movefocus, d"

      # Scroll through existing workspaces with mainMod + scroll
      "$mainMod, mouse_down, workspace, e+1"
      "$mainMod, mouse_up, workspace, e-1"

      # Groups
      "$mainMod, G, togglegroup"
      "$mainMod, TAB, changegroupactive, f"
      "$mainMod SHIFT, TAB, changegroupactive, b"
    ] ++ 

    # Switch workspaces with mainMod + 0-9
    # Move active window to a workspace with mainMod + SHIFT + 0-9
    (builtins.concatLists (builtins.genList (i: let n = toString (i + 1); in [
      "$mainMod, ${n}, workspace, ${n}"
      "$mainMod SHIFT, ${n}, movetoworkspace, ${n}"
    ]) 9)) ++
    
    # Special workspaces to hide windows
    # mainMod + F1-F9 "minimize" the currently-displayed window to min1-9
    # This is a super hacky way to "implement" minimizing, but I actually really like the workflow it enables
    (builtins.concatLists(builtins.genList (i: let n = toString (i + 1); key = "F${n}"; workspace = "min${n}"; in [
      "$mainMod, ${key}, togglespecialworkspace, ${workspace}"
      "$mainMod, ${key}, movetoworkspace, +0"
      "$mainMod, ${key}, togglespecialworkspace, ${workspace}"
      "$mainMod, ${key}, movetoworkspace, special:${workspace}"
      "$mainMod, ${key}, togglespecialworkspace, ${workspace}"
    ]) 9));

    # Move/resize windows with mainMod + LMB/RMB and dragging
    bindm = [
      "$mainMod, mouse:272, movewindow"
      "$mainMod, mouse:273, resizewindow"
      # Also resize with mainMod + alt since it's easier on my laptop
      "$mainMod ALT_L, mouse:272, resizewindow"
    ];

    bindel = [
      # Laptop multimedia keys for volume and LCD brightness
      ",XF86AudioRaiseVolume, exec, wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%+"
      ",XF86AudioLowerVolume, exec, wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"
      ",XF86AudioMute, exec, wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"
      ",XF86AudioMicMute, exec, wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"
      ",XF86MonBrightnessUp, exec, brillo -A 10% -u 100000"
      ",XF86MonBrightnessDown, exec, brillo -U 10% -u 100000"

      # Requires playerctl
      ", XF86AudioNext, exec, playerctl next"
      ", XF86AudioPause, exec, playerctl play-pause"
      ", XF86AudioPlay, exec, playerctl play-pause"
      ", XF86AudioPrev, exec, playerctl previous"
    ];

    wayland.windowManager.hyprland.settings.bindr = [
      # Open our app launcher with just meta
      "SUPER, SUPER_L, exec, ags request -i main 'open runPopup'"
    ];
  };
}