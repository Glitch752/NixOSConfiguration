# These programs, for some reason need to be installed or work better at a system level.
{ inputs, outputs, lib, config, pkgs, ... }: {
  environment.systemPackages = with pkgs; [
    # A few tools I want on a system level
    wget
    htop
    neovim

    fastfetch # A fast neofetch alternative

    xfce.thunar # Thunar file manager; needs to be installed at a system level for some reason
  ];

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

  # Enable CUPS to print documents.
  services.printing.enable = true;
}