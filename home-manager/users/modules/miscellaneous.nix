{ inputs, lib, config, pkgs, ... }: {
  # This could be organized even further, but it's not a big deal to me for now.

  # Packages that should be installed to the user profile.
  home.packages = with pkgs; [
    nnn # Terminal file manager

    # archives
    zip # zip
    xz # xz
    unzip # unzip
    p7zip # 7z

    ripgrep # Recursively searches directories for a regex pattern
    jq # A lightweight and flexible command-line JSON processor
    fzf # A command-line fuzzy finder

    dnsutils  # `dig` + `nslookup`
    ldns # replacement of `dig`, the command `drill`
    nmap # A utility for network discovery and security auditing

    cowsay # Configurable speaking/thinking cow (and a bit more)
    file # A utility to determine file types
    which # A utility to show the full path of commands
    tree # A directory listing program displaying a depth indented list of files
    just # A command runner for project-specific tasks
    thefuck # Magnificent app which corrects your previous console command

    # Provides the command `nom` works just like `nix`
    # with more details log output
    nix-output-monitor
    nix-top # A top-like program for monitoring Nix builds

    glow # markdown previewer in terminal

    pciutils # provides the command `lspci`

    networkmanagerapplet # NetworkManager applet for the system tray

    vesktop # Vencord optimized for wayland

    bitwarden-desktop # Bitwarden password manager
    bitwarden-cli # Bitwarden password manager CLI

    spotube # Spotify client using Youtube as an audio source

    qimgv # Qt5 image viewer
    imagemagick # Image manipulation programs

    krita # Digital image editing application
    gimp # GNU Image Manipulation Program

    rink # A unit-aware calculator

    direnv # An environment switcher for the shell

    gparted # Graphical disk partitioning tool
    squirreldisk # Disk usage analyzer
  ];

  xdg.desktopEntries.gparted = {
    name = "GParted";
    genericName = "GParted";
    # This is really hacky and probably insecure, but it works for now.
    exec = "kitty sudo -E gparted";
    terminal = false;
    categories = [ "System" ];
    icon = "${pkgs.gparted}/share/icons/hicolor/48x48/apps/gparted.png";
  };
  
  xdg.mime.enable = true;
  xdg.mimeApps.defaultApplications = {
    # https://specifications.freedesktop.org/mime-apps-spec/latest/default
    "image/jpeg" = "qimgv";
    "image/png" = "qimgv";
  };

  services.udiskie = {
    enable = true;
    automount = true;
    notify = true;
    tray = "auto";
    settings = {
      # https://github.com/coldfix/udiskie/blob/master/doc/udiskie.8.txt#configuration
      file_manager = "thunar";
      terminal = "kitty";
    };
  };
}