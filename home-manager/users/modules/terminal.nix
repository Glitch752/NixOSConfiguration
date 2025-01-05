{ inputs, lib, config, pkgs, ... }: {
  programs.kitty = {
    enable = true;
    package = pkgs.kitty;
    # The kitty.conf file
    extraConfig = ''
      # https://sw.kovidgoyal.net/kitty/conf.html
      # 30% background opacity
      background_opacity 0.3
      confirm_os_window_close 0
      single_window_margin_width 20
      
      map ctrl+shift+f toggle_fullscreen
      map ctrl+w close_tab
      map ctrl+t new_tab

      map ctrl+shift+plus increase_font_size
      map ctrl+shift+minus decrease_font_size
    '';
  };

  programs.bash = {
    enable = true;
    package = pkgs.bashInteractive;
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
      # Faster rebuilds that don't require updating boot
      nixos-test = "sudo nixos-rebuild test --fast";
      shit = "fuck";
      oops = "fuck";
      explorer = "thunar";
      files = "thunar";
      browse = "thunar";
      view = "qimgv";
      neofetch = "fastfetch";
    };
    history = {
      size = 10000;
      path = "${config.xdg.dataHome}/zsh/history";
    };

    oh-my-zsh = {
      enable = true;
      plugins = [ "git" "fzf" "thefuck" "direnv" ];
      theme = "philips"; # nebirhos, norm, robbyrussell
    };

    # The zshrc file
    initExtra = ''
      fastfetch
    '';
  };

  # Direnv is an environment switcher for the shell
  programs.direnv = {
    enable = true;
    nix-direnv.enable = true;
  };
}