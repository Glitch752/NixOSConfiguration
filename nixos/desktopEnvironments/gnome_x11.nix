{ inputs, outputs, lib, config, pkgs, ... }:
 
 let
   cfg = config.desktopEnvironments.gnome;
 in
 
 with lib;

{
  options = {
    desktopEnvironments.gnome = {
      enable = mkOption {
        default = false;
        type = with types; bool;
        description = ''
          Enable the Gnome desktop environment.
        '';
      };
    };
  };

  config = mkIf cfg.enable {
    # Enable the X11 windowing system.
    services.xserver.enable = true;

    # Enable the GNOME Desktop Environment.
    services.xserver.displayManager.gdm.enable = true;
    services.xserver.desktopManager.gnome.enable = true;

    # Configure keymap in X11
    services.xserver = {
        layout = "us";
        xkbVariant = "";
    };
  };

  # https://nixos.wiki/wiki/Nvidia
  services.xserver.videoDrivers = ["nvidia"];
  hardware.graphics.enable = true;
  hardware.nvidia = {
    package = config.boot.kernelPackages.nvidiaPackages.beta;
    open = true;
    modesetting.enable = true;
  };
}
