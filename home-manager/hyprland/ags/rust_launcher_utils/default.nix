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
  commonArgs = let
    # Only keeps markdown files
    txtFilter = path: _type: builtins.match ".*txt$" path != null;
    txtOrCargo = path: type: (txtFilter path type) || (craneLib.filterCargoSources path type);
  in {
    src = nixpkgs.lib.cleanSourceWith {
      src = ./.; # The original, unfiltered source
      filter = txtOrCargo;
      name = "source"; # Be reproducible, regardless of the directory name
    };
    
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