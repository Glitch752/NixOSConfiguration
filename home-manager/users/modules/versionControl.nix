{ inputs, lib, config, pkgs, ... }: {
  home.packages = with pkgs; [
    # Git is installed at a system level, so it doesn't need to be installed here.

    # Perforce
    p4v # Perforce Visual Client
    p4 # Perforce Command-Line Client

    ydiff # Terminal tool to view colored, incremental diff in a version controlled workspace
  ];

  # Add a desktop entry for p4v since it doesn't create one itself.
  # See https://nix-community.github.io/home-manager/options.xhtml#opt-xdg.desktopEntries
  xdg.desktopEntries.p4v = {
    name = "Perforce Visual Client";
    genericName = "Perforce Visual Client";
    exec = "${pkgs.p4v}/bin/p4v";
    terminal = false;
    categories = [ "Development" ];
    icon = ./p4v.svg;
  };
  
  programs.git = {
    enable = true;
    userName = "Glitch752";
    userEmail = "xxGlitch752xx@gmail.com";
  };
}