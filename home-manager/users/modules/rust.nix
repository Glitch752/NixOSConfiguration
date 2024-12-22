{ inputs, lib, config, pkgs, flakePath, ... }: {
  # I don't use any fancy nix shells to run Rust code; I just install everything through normal rustup.
  # This is because I don't want to deal with inconsistent build times (that can be up to hours!),
  # other weird dependency issues, and reliance on Nix.
  # Maybe this is the wrong way to do it, but it works for me.
  # See https://nix.dev/tutorials/first-steps/declarative-shell?

  # This is incredibly hacky and hopefully temporary...

  home.packages = with pkgs; [
    rustup
    gcc
    pkg-config
  ];
}