{ inputs, outputs, lib, config, pkgs, ... }: {
  # Git is a prerequisite to using flakes, so we install it at
  # a system level.
  environment.systemPackages = with pkgs; [
    git-credential-oauth
  ];

  programs.git = {
    package = pkgs.gitFull;
    enable = true;
    config.credential.helper = "oauth";
    lfs.enable = true;
  };
}