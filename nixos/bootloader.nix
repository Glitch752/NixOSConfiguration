{ inputs, outputs, lib, config, pkgs, ... }: {
  boot.loader = {
    systemd-boot = {
      enable = false;
      configurationLimit = 5;
    };

    grub = rec {
      enable = true;
      useOSProber = true;
      efiSupport = true;
      device = "nodev";
      configurationLimit = 4;

      # Alternatively, https://github.com/Coopydood/HyperFluent-GRUB-Theme is really nice
      theme = inputs.distro-grub-themes.packages.${pkgs.system}.nixos-grub-theme;
      splashImage = "${theme}/splash_image.jpg";

      default = "saved"; # Use the last selected entry as the default
      
      font = "${pkgs.hack-font}/share/fonts/hack/Hack-Regular.ttf";

      fontSize = 36;
    };

    efi.canTouchEfiVariables = true;
  };
}