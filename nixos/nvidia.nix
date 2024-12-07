{ inputs, outputs, lib, config, pkgs, ... }: {
  boot = {
    # https://forums.developer.nvidia.com/t/550-54-14-cannot-create-sg-table-for-nvkmskapimemory-spammed-when-launching-chrome-on-wayland/284775/26
    # https://wiki.hyprland.org/Nvidia/ | "add the following module names" ....
    initrd.kernelModules = [ "nvidia" "nvidia_modeset" "nvidia_uvm" "nvidia_drm" ]; # "nvidia-dkms" or "nvidia"?
    # extraModulePackages = [ config.boot.kernelPackages.nvidia_x11 ];
    # kernelPackages = let pkgs = import inputs.nixpkgs-unstable { system = ${pkgs.system}; config.allowUnfree = true; }; in pkgs.linuxPackages_latest;
    kernelParams = [ "nvidia-drm.modeset=1" "nvidia-drm.fbdev=1" "nvidia.NVreg_PreserveVideoMemoryAllocations=1" ];

    # https://wiki.hyprland.org/Nvidia/
    extraModprobeConfig=''
      options nvidia_drm modeset=1 fbdev=1
      options nvidia NVreg_RegistryDwords="PowerMizerEnable=0x1; PerfLevelSrc=0x2222; PowerMizerLevel=0x3; PowerMizerDefault=0x3; PowerMizerDefaultAC=0x3"
    '';
  };

  environment.variables = {
    LIBVA_DRIVER_NAME = "nvidia";
    XDG_SESSION_TYPE = "wayland";
    GBM_BACKEND = "nvidia-drm";
    __GLX_VENDOR_LIBRARY_NAME = "nvidia";
    NVD_BACKEND = "direct";
    NIXOS_OZONE_WL = "1";
  };

  # https://nixos.wiki/wiki/Nvidia
  # https://wiki.hyprland.org/Nvidia/
  services.xserver.videoDrivers = ["nvidia"];
  hardware.nvidia = {
    # https://github.com/NVIDIA/open-gpu-kernel-modules/issues/472
    # Making sure to use the proprietary drivers until the issue above is fixed upstream
    open = true;

    modesetting.enable = true;
    
    package = config.boot.kernelPackages.nvidiaPackages.beta;
    # package = config.boot.kernelPackages.nvidiaPackages.stable;

    nvidiaSettings = true;

    powerManagement.enable = true;
  };

  hardware.graphics = {
    # driSupport = true;
    enable = true;
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
}