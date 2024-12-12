{ inputs, outputs, lib, config, pkgs, ... }:
 
 let
   cfg = config.desktopEnvironments.hyprland;
 in
 
 with lib;

{
  options = {
    desktopEnvironments.hyprland = {
      enable = mkOption {
        default = false;
        type = with types; bool;
        description = ''
          Enable the Hyprland desktop environment.
        '';
      };
    };
  };

  config = let pkgs-unstable = inputs.hyprland.inputs.nixpkgs.legacyPackages.${pkgs.stdenv.hostPlatform.system}; in mkIf cfg.enable {
    # Cache
    nix.settings = {
      substituters = [
        "https://hyprland.cachix.org"
        "https://cache.nixos.org"
        "https://nixpkgs-wayland.cachix.org"
      ];
      trusted-public-keys = [
        "hyprland.cachix.org-1:a7pgxzMz7+chwVL3/pzj6jIBMioiJM7ypFP8PwtkuGc="
        "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
        "nixpkgs-wayland.cachix.org-1:3lwxaILxMRkVhehr5StQprHdEo4IrE8sRho9R9HOLYA="
      ];
    };

    programs.hyprland = {
      enable = true;

      package = inputs.hyprland.packages.${pkgs.system}.hyprland;
      portalPackage = inputs.hyprland.packages.${pkgs.system}.xdg-desktop-portal-hyprland;

      xwayland.enable = true;
      withUWSM = true;
    };

    programs.uwsm = {
      enable = true;
      waylandCompositors = {
        Hyprland = {
          prettyName = "Hyprland";
          comment = "Hyprland UWSM";
          binPath = "/etc/profiles/per-user/quinn/bin/Hyprland";
        };
      };
    };

    xdg.portal = {
      enable = true;
      extraPortals = with pkgs; [ xdg-desktop-portal-gtk ];
    };
    
    # Required for hyprlock, which is installed at a user level
    security = {
      polkit.enable = true;
      pam.services.hyprlock = {};
    };

    # This is a super hacky set up lol
    services.greetd = {
      enable = true;
      settings = rec {
        initial_session = {
          command = "${pkgs.uwsm}/bin/uwsm start hyprland-uwsm.desktop";
          user = "brody";
        };
        default_session = initial_session;
      };
    };

    nixpkgs.overlays = [
      inputs.nixpkgs-wayland.overlay
    ];
    environment.systemPackages = with pkgs; [
      vulkan-loader
      vulkan-validation-layers
      vulkan-tools
      egl-wayland

      kdePackages.qtwayland # qt6 Wayland support
      libsForQt5.qt5.qtwayland # qt5 Wayland support

      kitty # Needed for hyprland

      # TODO: Switch to brillo for smooth transitions?
      # https://github.com/CameronNemo/brillo
      brightnessctl # Control background
      playerctl # Control audio

      (inputs.hyprland.packages.${pkgs.system}.hyprland.override {
        # enableNvidiaPatches = true;
      })

      acpi # hardware states
    ];
  };
}
