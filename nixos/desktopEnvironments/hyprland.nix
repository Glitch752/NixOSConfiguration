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
      displayManager = mkOption {
        default = "greetd";
        type = with types; strMatching "^(gdm|greetd)$";
        description = ''
          The display manager to use.
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
        "https://anyrun.cachix.org"
      ];
      trusted-public-keys = [
        "hyprland.cachix.org-1:a7pgxzMz7+chwVL3/pzj6jIBMioiJM7ypFP8PwtkuGc="
        "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
        "nixpkgs-wayland.cachix.org-1:3lwxaILxMRkVhehr5StQprHdEo4IrE8sRho9R9HOLYA="
        "anyrun.cachix.org-1:pqBobmOjI7nKlsUMV25u9QHa9btJK65/C8vnO3p346s="
      ];
    };

    programs.hyprland = {
      enable = true;
      # set the flake package
      package = inputs.hyprland.packages.${pkgs.stdenv.hostPlatform.system}.hyprland;
      # make sure to also set the portal package, so that they are in sync
      portalPackage = inputs.hyprland.packages.${pkgs.stdenv.hostPlatform.system}.xdg-desktop-portal-hyprland;
    };

    # TODO: Systemd start with uwsm? https://wiki.hyprland.org/Useful-Utilities/Systemd-start/

    # Gnome display manager
    services.xserver.displayManager.gdm.enable = cfg.displayManager == "gdm";

    # Greetd display manager
    services.greetd = let
      session = {
        command = "${lib.getExe config.programs.uwsm.package} start hyprland-uwsm.desktop";
        user = "mihai";
      };
    in {
      enable = cfg.displayManager == "greetd";
      settings = {
        terminal.vt = 1;
        default_session = session;
        initial_session = session;
      };
    };
    programs.uwsm = {
      enable = cfg.displayManager == "greetd";
      waylandCompositors.hyprland = {
        binPath = "/run/current-system/sw/bin/Hyprland";
        prettyName = "Hyprland";
        comment = "Hyprland managed by UWSM";
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

      kitty # Needed for hyprland
      brightnessctl # Control background
      playerctl # Control audio

      (inputs.hyprland.packages.${pkgs.system}.hyprland.override {
        # enableNvidiaPatches = true;
      })

      # utils
      acpi # hardware states
      eww
      wl-clipboard
      rofi
      mpvpaper

      slurp
      grim

      inputs.pyprland.packages.${pkgs.system}.pyprland
      hyprpicker
      hyprcursor
      hyprlock
      hypridle
      hyprpaper
    ];
  };
}
