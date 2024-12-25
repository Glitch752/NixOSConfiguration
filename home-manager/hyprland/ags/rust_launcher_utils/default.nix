{ system, crane, rust-overlay, nixpkgs, ... }: let
  overlays = [ (import rust-overlay) ];
  pkgs = import nixpkgs {
    inherit system overlays;
  };

  craneLib = (crane.mkLib pkgs).overrideToolchain (
    pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml
  );

  # Common arguments can be set here to avoid repeating them later
  # Note: changes here will rebuild all dependency crates
  commonArgs = {
    src = craneLib.cleanCargoSource ./.;
    strictDeps = true;

    # Dependencies that exist only at build time
    nativeBuildInputs = with pkgs; [
      pkg-config
    ];

    # Dependencies that exist at runtime but not necessarily at build time
    # Note that when we use nix-shell, we are essentially entering into the build environment.
    buildInputs = with pkgs; [
      openssl
    ];
  };

  crate = craneLib.buildPackage (commonArgs // {
    cargoArtifacts = craneLib.buildDepsOnly commonArgs;

    # Additional environment variables or build phases/hooks can be set
    # here *without* rebuilding all dependency crates
    # MY_CUSTOM_VAR = "some value";
  });

  in {
    inherit crate craneLib;
  }