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

      theme = pkgs.stdenv.mkDerivation {
        pname = "hyperfluent-grub-theme";
        version = "1.0.1";
        src = pkgs.fetchFromGitHub {
          owner = "Coopydood";
          repo = "HyperFluent-GRUB-Theme";
          rev = "v1.0.1";
          hash = "sha256-zryQsvue+YKGV681Uy6GqnDMxGUAEfmSJEKCoIuu2z8=";
        };
        installPhase = ''mkdir -p $out && cp -r nixos/* $out'';
      };

      default = "saved"; # Use the last selected entry as the default
    };

    efi.canTouchEfiVariables = true;
  };
}