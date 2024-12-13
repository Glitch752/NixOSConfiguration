{ inputs, outputs, lib, config, pkgs, ... }: {
  imports = [
    ./hardware-configuration.nix
    ../../nvidia.nix
    ../../bootloader.nix
  ];

  # We intentionally use a lower resolution for the GRUB menu because GRUB
  # gets incredibly slow with higher resolutions.
  boot.loader.grub.gfxmodeEfi = "1920x1200x32,2560x1440x32,auto";

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
