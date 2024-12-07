# https://nixos-and-flakes.thiscute.world/nixos-with-flakes/start-using-home-manager
{ inputs, lib, config, pkgs, ... }: {
  imports = [
    inputs.nix-colors.homeManagerModule # TODO: Stylix instead? Maybe? https://github.com/danth/stylix
    ./hyprland/hyprland.nix
  ];

  # TODO: Investigate https://github.com/Vencord/Vesktop ?

  colorScheme = inputs.nix-colors.colorSchemes.dracula;

  home = {
    username = "brody";
    homeDirectory = "/home/brody";
  };

  # Packages that should be installed to the user profile.
  home.packages = with pkgs; [
    neofetch # A command-line system information tool
    nnn # Terminal file manager

    # archives
    zip # zip
    xz # xz
    unzip # unzip
    p7zip # 7z

    ripgrep # recursively searches directories for a regex pattern
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

    glow # markdown previewer in terminal

    pciutils # provides the command `lspci`

    networkmanagerapplet # NetworkManager applet for the system tray
  ];

  programs.firefox.enable = true;

  # Install Brave
  programs.chromium = {
    enable = true;
    package = pkgs.brave;
    commandLineArgs = [
      "--ozone-platform-hint=auto"
      "--enable-features=UseOzonePlatform"
      "--ozone-platform=wayland"
      # make it use GTK_IM_MODULE if it runs with Gtk4, so fcitx5 can work with it.
      # (only supported by chromium/chrome at this time, not electron)
      "--gtk-version=4"
      # make it use text-input-v1, which works for kwin 5.27 and weston
      "--enable-wayland-ime"
    ];
  };

  programs.git = {
    enable = true;
    userName = "Glitch752";
    userEmail = "xxGlitch752xx@gmail.com";
  };

  programs.bash = {
    enable = true;
    enableCompletion = true;
    # The bashrc file
    bashrcExtra = '''';
  };
  programs.zsh = {
    enable = true;
    enableCompletion = true;
    syntaxHighlighting.enable = true;

    shellAliases = {
      ll = "ls -l";
      nixos-switch = "sudo nixos-rebuild switch";
      shit = "fuck";
      oops = "fuck";
    };
    history = {
      size = 10000;
      path = "${config.xdg.dataHome}/zsh/history";
    };

    oh-my-zsh = {
      enable = true;
      plugins = [ "git" "fzf" "thefuck" ];
      theme = "philips"; # nebirhos, norm, robbyrussell
    };

    # The zshrc file
    initExtra = ''
      neofetch
    '';
  };

  # https://nixos.wiki/wiki/Visual_Studio_Code
  programs.vscode = {
    package =
      (pkgs.vscode.override
        {
          # https://wiki.archlinux.org/title/Wayland#Electron
          commandLineArgs = [
            "--ozone-platform-hint=auto"
            "--enable-features=UseOzonePlatform"
            "--ozone-platform=wayland"
            # make it use GTK_IM_MODULE if it runs with Gtk4, so fcitx5 can work with it.
            # (only supported by chromium/chrome at this time, not electron)
            "--gtk-version=4"
            # make it use text-input-v1, which works for kwin 5.27 and weston
            "--enable-wayland-ime"
          ];
        });

    enable = true;
    extensions = with pkgs.vscode-extensions; [
      # TODO
    ];

    # keybinds.json
    keybindings = [
      {
        key = "shift shift";
        command = "workbench.action.showCommands";
      }
      {
        key = "ctrl+tab";
        command = "workbench.action.nextEditorInGroup";
      }
      {
        key = "ctrl+shift+tab";
        command = "workbench.action.previousEditorInGroup";
      }
    ];
  };

  # Nicely reload system units when changing configs
  systemd.user.startServices = "sd-switch";

  # This value determines the home Manager release that your
  # configuration is compatible with. This helps avoid breakage
  # when a new home Manager release introduces backwards
  # incompatible changes.
  #
  # You can update home Manager without changing this value. See
  # the home Manager release notes for a list of state version
  # changes in each release.
  home.stateVersion = "24.11";

  # Let home Manager install and manage itself.
  programs.home-manager.enable = true;
}
