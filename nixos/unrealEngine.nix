# Everything needed on a system level for Unreal Engine 5 to compile
# and run on a NixOS system.

{ inputs, outputs, lib, config, pkgs, ... }: {
  programs.nix-ld.enable = true;
  programs.nix-ld.libraries = with pkgs; [
    stdenv.cc.cc
    bash
    zlib
    fuse3
    icu
    zlib
    nss
    openssl
    curl
    expat
    envfs
  ];

  environment.systemPackages = with pkgs; [
    nix-ld
    envfs
    steam-run
  ];
}