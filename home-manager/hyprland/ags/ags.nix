{ inputs, lib, config, pkgs, flakePath, ... }: {
  nix.settings = {
    extra-substituters = [
      "https://ags.cachix.org"
    ];
    extra-trusted-public-keys = [
      "ags.cachix.org-1:naAvMrz0CuYqeyGNyLgE010iUiuf/qx6kYrUv3NwAJ8="
    ];
  };

  imports = [
    inputs.ags.homeManagerModules.default
  ];

  home.packages = with pkgs; [
    inotify-tools # For auto-reloading

    accountsservice

    overskride # Bluetooth client
    mission-center # Essentially task manager

    alsa-utils # Advanced audio controls
    pavucontrol # PulseAudio volume control

    (import ./rust_launcher_utils {
      inherit (inputs) crane rust-overlay nixpkgs;
      inherit (pkgs) system;
    }).crate
  ];

  # https://github.com/0thElement/nixconf/blob/main/packages/ags/default.nix
  programs.ags = {
    enable = true;

    # configDir = ./ags_config;

    # Link directly to the ags_config directory instead of symlinking to a copy in the store; this allows for live updates to the configuration
    # I'm not happy with this at all since it depends on the configuration being under `nixos-config` and will break if I reorganize my configuration.
    # However, I couldn't find a better solution.
    # Technically, using an absolute path like this violates flakes' purity, but I'm not particularly concerned about that for development.
    # There may be a better solution using home-manager's activation scripts, but I haven't looked into that yet.

    configDir = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/nixos-config/home-manager/hyprland/ags_config";

    # Additional packages to add to gjs's runtime
    extraPackages = with pkgs; [
      # gtksourceview
      # webkitgtk
      
      inputs.ags.packages.${pkgs.system}.apps
      inputs.ags.packages.${pkgs.system}.hyprland
      inputs.ags.packages.${pkgs.system}.wireplumber
      inputs.ags.packages.${pkgs.system}.battery
      inputs.ags.packages.${pkgs.system}.network
      inputs.ags.packages.${pkgs.system}.tray
      inputs.ags.packages.${pkgs.system}.mpris
      inputs.ags.packages.${pkgs.system}.notifd
      inputs.ags.packages.${pkgs.system}.cava
    ];
  };

  wayland.windowManager.hyprland.settings = {
    # Not exec-once -- we want to reload ags with hyprland
    exec = [
      "sh ${./launch_ags.sh}"
    ];
    
    # Auto-reload with inotifywait
    # Importantly, this _is_ exec-once, so it only runs once
    exec-once = [
      "inotifywait -m -r --exclude '@girs/' --exclude 'node_modules/' -e close_write $(readlink -f ~/.config/ags) | while read; do sh ${./launch_ags.sh}; done"
    ];

    bind = [
      # Shortcut to reload ags
      "SUPER, R, exec, sh ${./force_reload_ags.sh}"
    ];
  };
}