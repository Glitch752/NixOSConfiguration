{ inputs, lib, config, pkgs, ... }: {
  home.packages = with pkgs; [
    # Git is installed at a system level, so it doesn't need to be installed here.

    # Perforce
    p4v # Perforce Visual Client
    p4 # Perforce Command-Line Client

    ydiff # Terminal tool to view colored, incremental diff in a version controlled workspace
  ];
  
  programs.git = {
    enable = true;
    userName = "Glitch752";
    userEmail = "xxGlitch752xx@gmail.com";
  };
}