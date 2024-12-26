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

  # nixos-generate-config can't automatically configure FUSE (NTFS) filesystems, so we configure the mount points manually.
  fileSystems = {
    "/mnt/HardDrive" = {
      device = "/dev/disk/by-uuid/E6FE0039FE000491";
      fsType = "ntfs";
      options = [ "nofail" "uid=1000" "gid=100" ];
    };
    "/mnt/SSD" = {
      device = "/dev/disk/by-uuid/4816D95C16D94C16";
      fsType = "ntfs";
      options = [ "nofail" "uid=1000" "gid=100" ];
    };
    "/mnt/Windows" = {
      device = "/dev/disk/by-uuid/327A3A117A39D279";
      fsType = "ntfs";
      options = [ "nofail" "uid=1000" "gid=100" ];
    };
  };
}
