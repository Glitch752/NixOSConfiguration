{ inputs, outputs, lib, config, pkgs, ... }: {
  environment.systemPackages = with pkgs; [
    # Git is a prerequisite to using flakes, so we install it at
    # a system level.
    git
    git-credential-oauth
  ];

  programs.git = {
    enable = true;
    config.credential.helper = "oauth";
  };
}