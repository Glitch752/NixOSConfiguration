{ inputs, lib, config, pkgs, ... }: {
  nix.settings = {
    substituters = [
      "https://ags.cachix.org"
    ];
    trusted-public-keys = [
      "ags.cachix.org-1:naAvMrz0CuYqeyGNyLgE010iUiuf/qx6kYrUv3NwAJ8="
    ];
  };

  imports = [
    inputs.ags.homeManagerModules.default
  ];

  # https://github.com/0thElement/nixconf/blob/main/packages/ags/default.nix
  programs.ags = {
    enable = true;

    configDir = ./ags_config;

    # Additional packages to add to gjs's runtime
    extraPackages = with pkgs; [
      gtksourceview
      webkitgtk
      accountsservice

      overskride # Bluetooth client
      mission-center # Essentially task manager

      # inputs.ags.packages."x86_64-linux".battery
      # fzf
    ];
  };

  # systemd.user.services.ags = {
  #   Unit = {
  #     Description = "Ags";
  #     PartOf = [
  #       "tray.target"
  #       "graphical-session.target"
  #     ];
  #     After = "graphical-session.target";
  #   };
  #   Service = {
  #     Environment = "PATH=/run/wrappers/bin:${lib.makeBinPath dependencies}";
  #     ExecStart = "${cfg.package}/bin/ags";
  #     Restart = "on-failure";
  #   };
  #   Install.WantedBy = ["graphical-session.target"];
  # };

  # Not exec-once -- we want to reload ags with hyprland
  wayland.windowManager.hyprland.settings.exec = [
    "sh ${./launch_ags.sh}"
  ];
}