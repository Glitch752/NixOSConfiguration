{ inputs, outputs, lib, config, pkgs, ... }: {
  imports = [
    ./hardware-configuration.nix
    ../../bootloader.nix
    inputs.nixos-hardware.nixosModules.framework-11th-gen-intel
  ];
  
  boot.loader.grub.gfxmodeEfi = "2256x1504,auto";

  services.upower = {
    enable = true;
  };

  # Support fingerprint authentication
  # `sudo fprintd-enroll brody` will enroll a fingerprint.
  # `fprintd-verify` will verify the fingerprint.
  services.fprintd.enable = true;

  # Bootloader.
  boot.supportedFilesystems = [ "ntfs" ];

  networking.hostName = "brody-nixos-framework";

  # Enable the OpenSSH server.
  services.openssh = {
    enable = true;
    settings = {
      # Forbid root login through SSH.
      PermitRootLogin = "no";
      # Remove if SSH using passwords is needed
      PasswordAuthentication = false;
    };
  };
}
