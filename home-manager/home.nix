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
  wayland.windowManager.hyprland.enable = true; # enable Hyprland
  wayland.windowManager.hyprland.settings = {
    enable = true;
    xwayland.enable = true;
    systemd.enable = true;

    extraConfig = ''
      env = LIBVA_DRIVER_NAME, nvidia
      env = XDG_SESSION_TYPE, wayland
      env = GBM_BACKEND, nvidia-drm
      env = __GLX_VENDOR_LIBRARY_NAME, nvidia
      env = NVD_BACKEND, direct

      env = NIXOS_OZONE_WL, 1
      env = NIXPKGS_ALLOW_UNFREE, 1
      env = XDG_CURRENT_DESKTOP, Hyprland
      env = XDG_SESSION_DESKTOP, Hyprland
      env = GDK_BACKEND, wayland, x11
      env = CLUTTER_BACKEND, wayland
      env = QT_QPA_PLATFORM=wayland;xcb
      env = QT_WAYLAND_DISABLE_WINDOWDECORATION, 1
      env = QT_AUTO_SCREEN_SCALE_FACTOR, 1
      env = SDL_VIDEODRIVER, x11
      env = MOZ_ENABLE_WAYLAND, 1

      exec-once = dbus-update-activation-environment --systemd --all
      exec-once = systemctl --user import-environment QT_QPA_PLATFORMTHEME WAYLAND_DISPLAY XDG_CURRENT_DESKTOP

      cursor = {
        no_hardware_cursors = true;
      };
    '';
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
