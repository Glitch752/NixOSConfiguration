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

    boot.kernelParams = [ "nvidia.NVreg_PreserveVideoMemoryAllocations=1" ];

    # https://nixos.wiki/wiki/Nvidia
    # https://wiki.hyprland.org/Nvidia/
    services.xserver.videoDrivers = ["nvidia-dkms"];
    hardware.graphics.enable = true;
    hardware.nvidia = {
      # https://github.com/NVIDIA/open-gpu-kernel-modules/issues/472
      # Making sure to use the proprietary drivers until the issue above is fixed upstream
      open = false;
      modesetting.enable = true;
      package = config.boot.kernelPackages.nvidiaPackages.beta;
      nvidiaSettings = true;
      powerManagement.enable = true;
    };

    hardware.graphics = {
      driSupport = true;
      enable32Bit = true;
      extraPackages = with pkgs; [
        nvidia-vaapi-driver
        vaapiVdpau
        libvdpau-va-gl
      ];

      # If you start experiencing lag and FPS drops in games or programs like Blender on stable
      # NixOS when using the Hyprland flake, it is most likely a mesa version mismatch between
      # your system and Hyprland.
      # package = pkgs-unstable.mesa.drivers;
      # package32 = pkgs-unstable.pkgsi686Linux.mesa.drivers;
    };

    environment.variables = {
      GBM_BACKEND = "nvidia-drm";
      LIBVA_DRIVER_NAME = "nvidia";
      __GLX_VENDOR_LIBRARY_NAME = "nvidia";
    };

    environment.systemPackages = with pkgs; [
      # vulkan-loader
      # vulkan-validation-layers
      # vulkan-tools

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
