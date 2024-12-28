{ inputs, outputs, lib, config, pkgs, ... }: {
  # See https://lix.systems/about/
  nix.package = pkgs.lix;
  nix.settings = {
    experimental-features = [ "nix-command" "flakes" ];
    auto-optimise-store = true;

    # https://mynixos.com/nixpkgs/option/nix.settings.trusted-users
    trusted-users = [ "root" "brody" ];
  };
  # Reduce disk usage
  nix.gc = {
    automatic = true;
    dates = "weekly";
    options = "--delete-older-than 1w";
  };
}