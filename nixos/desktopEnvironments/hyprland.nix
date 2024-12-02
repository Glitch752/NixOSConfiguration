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
      substituters = ["https://hyprland.cachix.org"];
      trusted-public-keys = ["hyprland.cachix.org-1:a7pgxzMz7+chwVL3/pzj6jIBMioiJM7ypFP8PwtkuGc="];
    };

    programs.hyprland = {
      enable = true;
      # set the flake package
      package = inputs.hyprland.packages.${pkgs.stdenv.hostPlatform.system}.hyprland;
      # make sure to also set the portal package, so that they are in sync
      portalPackage = inputs.hyprland.packages.${pkgs.stdenv.hostPlatform.system}.xdg-desktop-portal-hyprland;
    };

    lib.mkForce = {
      boot.kernelParams = [ "nvidia.NVreg_PreserveVideoMemoryAllocations=1" ];

      hardware.nvidia.powerManagement.enable = true;

      # Making sure to use the proprietary drivers until the issue above is fixed upstream
      hardware.nvidia.open = false;
    };

    # If you start experiencing lag and FPS drops in games or programs like Blender on stable
    # NixOS when using the Hyprland flake, it is most likely a mesa version mismatch between
    # your system and Hyprland.
    hardware.graphics = {
      package = pkgs-unstable.mesa.drivers;

      # If you also want 32-bit support (e.g for Steam)
      driSupport32Bit = true;
      package32 = pkgs-unstable.pkgsi686Linux.mesa.drivers;
    };


    home.packages = with pkgs; [
      # utils
      acpi # hardware states
      brightnessctl # Control background
      playerctl # Control audio

      (inputs.hyprland.packages."x86_64-linux".hyprland.override {
        enableNvidiaPatches = true;
      })
      eww
      wl-clipboard
      rofi
      grim
      # from overlay
      mpvpaper
    ];
  };
}