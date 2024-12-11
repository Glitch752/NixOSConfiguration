# Edit this configuration file to define what should be installed on
# your system. Help is available in the configuration.nix(5) man page
# and in the NixOS manual (accessible by running ‘nixos-help’).

{ inputs, outputs, lib, config, pkgs, ... }: {
  imports = [
    ./hardware-configuration.nix
    ../../nvidia.nix
  ];

  # Bootloader.
  # TODO: Switch to grub and style it.
  boot.loader = {
    systemd-boot.enable = true;
    systemd-boot.configurationLimit = 5;
    efi.canTouchEfiVariables = true;
  };
  boot.kernelParams = [ "module_blacklist=amdgpu" ];
  boot.supportedFilesystems = [ "ntfs" ];


  networking.hostName = "brody-nixos-desktop"; # Define your hostname.

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
