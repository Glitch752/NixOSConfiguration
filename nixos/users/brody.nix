{ inputs, outputs, lib, config, pkgs, ... }: {
  imports = [
    ./modules/desktopEnvironments/gnome_x11.nix
    ./modules/desktopEnvironments/hyprland.nix

    ./modules/games.nix
    ./modules/internationalisation.nix
    ./modules/audio.nix
    ./modules/networking.nix
    ./modules/bluetooth.nix
    ./modules/nix.nix
    ./modules/versionControl.nix
    ./modules/programs.nix
    ./modules/dbus-broker.nix
    ./modules/devices.nix
  ];

  # Allow unfree packages
  nixpkgs.config.allowUnfree = true;

  desktopEnvironments.hyprland.enable = true;
  desktopEnvironments.gnome.enable = false;
  
  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.brody = {
    isNormalUser = true;
    description = "Brody";
    openssh.authorizedKeys.keys = [
      # TODO
    ];
    extraGroups = [
      "networkmanager" # For network management
      "wheel" # Enable ‘sudo’ for the user.
      "video" # For video devices
      "input" # For input devices
      "dialout" # For serial ports
    ];
    shell = pkgs.zsh;
  };

  # Configured at a user level, but enabled at a system level.
  programs.zsh.enable = true;

  environment.sessionVariables = {
    __HM_SESS_VARS_SOURCED = ""; # Workaround for GH-755 and GH-890
  };

  # This value determines the NixOS release from which the default
  # settings for stateful data, like file locations and database versions
  # on your system were taken. It‘s perfectly fine and recommended to leave
  # this value at the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "24.05"; # Did you read the comment?
}