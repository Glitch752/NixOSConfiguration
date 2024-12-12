{ inputs, outputs, lib, config, pkgs, ... }: {
  imports = [
    ./hardware-configuration.nix
    ../../nvidia.nix
    ../../bootloader.nix
  ];

  boot.loader.grub.gfxmodeEfi = "2560x1440x32,auto";

  boot.kernelParams = [ "module_blacklist=amdgpu" ];
  boot.supportedFilesystems = [ "ntfs" ];

  networking.hostName = "brody-nixos-desktop";

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
