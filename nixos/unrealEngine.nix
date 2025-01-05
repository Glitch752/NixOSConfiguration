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
    
    SDL2
    vulkan-loader
  ];

  environment.systemPackages = with pkgs; [
    nix-ld
    envfs
    steam-run

    vulkan-headers
  ];

  # This is hacky, and there's a reason NixOS doesn't include /bin/bash by
  # default, but multiple Unreal Engine tools require /bin/bash to exist, and
  # I don't want to deal with FHS environments.
  # See https://discourse.nixos.org/t/add-bin-bash-to-avoid-unnecessary-pain/5673/10
  system.activationScripts.binbash = ''
    mkdir -m 0755 -p /bin
    ln -sfn ${pkgs.bash}/bin/bash /bin/.bash.tmp
    mv /bin/.bash.tmp /bin/bash # Atomically replace /bin/bash
  '';
}