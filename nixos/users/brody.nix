# TODO: Reorganize this configuration file.

{ inputs, outputs, lib, config, pkgs, ... }: {
  imports = [
    ./desktopEnvironments/gnome_x11.nix
    ./desktopEnvironments/hyprland.nix
  ];

  desktopEnvironments.hyprland.enable = true;
  desktopEnvironments.gnome.enable = false;

  # networking.wireless.enable = true;  # Enables wireless support via wpa_supplicant.

  # Configure network proxy if necessary
  # networking.proxy.default = "http://user:password@proxy:port/";
  # networking.proxy.noProxy = "127.0.0.1,localhost,internal.domain";

  # Enable networking
  networking.networkmanager.enable = true;

  # Set your time zone.
  time.timeZone = "America/Chicago";

  # Select internationalisation properties.
  i18n.defaultLocale = "en_US.UTF-8";
  i18n.extraLocaleSettings = {
    LC_ADDRESS = "en_US.UTF-8";
    LC_IDENTIFICATION = "en_US.UTF-8";
    LC_MEASUREMENT = "en_US.UTF-8";
    LC_MONETARY = "en_US.UTF-8";
    LC_NAME = "en_US.UTF-8";
    LC_NUMERIC = "en_US.UTF-8";
    LC_PAPER = "en_US.UTF-8";
    LC_TELEPHONE = "en_US.UTF-8";
    LC_TIME = "en_US.UTF-8";
  };

  # Enable CUPS to print documents.
  services.printing.enable = true;
  
  # NixOS supports "specialisations", which allow you to automatically generate different boot profiles when rebuilding your system.
  specialisation = {
    # gnome.configuration = {
    #   system.nixos.tags = [ "gnome" ];
    #   desktopEnvironments.hyprland.enable = lib.mkForce false;
    #   desktopEnvironments.gnome.enable = lib.mkForce true;
    # };
  };

  # Enable sound with pipewire.
  hardware.pulseaudio.enable = false;
  security.rtkit.enable = true;
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    alsa.support32Bit = true;
    pulse.enable = true;
    # If you want to use JACK applications, uncomment this
    #jack.enable = true;

    # use the example session manager (no others are packaged yet so this is enabled by default,
    # no need to redefine it in your config for now)
    #media-session.enable = true;
  };

  # Bluetooth
  hardware.bluetooth.enable = true; # Enables support for Bluetooth
  hardware.bluetooth.powerOnBoot = true;

  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.brody = {
    isNormalUser = true;
    description = "Brody";
    openssh.authorizedKeys.keys = [
      # TODO
    ];
    extraGroups = [ "networkmanager" "wheel" "video" ];
    shell = pkgs.zsh;
  };

  # Configured at a user level, but enabled at a system level.
  programs.zsh.enable = true;

  # Allow unfree packages
  nixpkgs.config.allowUnfree = true;

  # List packages installed in system profile. To search, run:
  # $ nix search ___
  nix.settings.experimental-features = [ "nix-command" "flakes" ];
  environment.systemPackages = with pkgs; [
    # Git is a prerequisite to using flakes, so we install it at
    # a system level.
    git
    git-credential-oauth
    
    # A few tools I want on a system level
    wget
    htop
    neovim

    fastfetch # A fast neofetch alternative

    bluez # Bluetooth

    dbus-broker # Alternative message broker implementation

    xfce.thunar # Thunar file manager; needs to be installed at a system level for some reason
  ];

  systemd.packages = [ pkgs.dbus-broker ];

  programs.thunar = {
    enable = true;
    plugins = with pkgs.xfce; [
      thunar-archive-plugin
      thunar-volman
    ];
  };
  programs.xfconf.enable = true;
  services.gvfs.enable = true; # Mount, trash, and other functionalities
  services.tumbler.enable = true; # Thumbnail support for images

  programs.git = {
    enable = true;
    config.credential.helper = "oauth";
  };

  # Reduce disk usage
  nix.gc = {
    automatic = true;
    dates = "weekly";
    options = "--delete-older-than 1w";
  };
  nix.settings.auto-optimise-store = true;

  # Some programs need SUID wrappers, can be configured further or are
  # started in user sessions.
  # programs.mtr.enable = true;
  # programs.gnupg.agent = {
  #   enable = true;
  #   enableSSHSupport = true;
  # };

  # Open ports in the firewall.
  # networking.firewall.allowedTCPPorts = [ ... ];
  # networking.firewall.allowedUDPPorts = [ ... ];
  # Or disable the firewall altogether.
  # networking.firewall.enable = false;

  # This value determines the NixOS release from which the default
  # settings for stateful data, like file locations and database versions
  # on your system were taken. It‘s perfectly fine and recommended to leave
  # this value at the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "24.05"; # Did you read the comment?
}