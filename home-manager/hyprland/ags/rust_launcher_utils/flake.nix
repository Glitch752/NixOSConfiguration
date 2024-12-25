{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    crane.url = "github:ipetkov/crane";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, crane, rust-overlay, flake-utils, nixpkgs, ... }:
    flake-utils.lib.eachDefaultSystem (system: let
      build = import ./default.nix { inherit system crane rust-overlay nixpkgs; };
      crate = build.crate;
      craneLib = build.craneLib;
    in {
      checks = {
        inherit crate;
      };

      packages.default = crate;

      apps.default = flake-utils.lib.mkApp {
        drv = crate;
      };
      
      devShells.default = craneLib.devShell {
        # Inherit inputs from checks.
        checks = self.checks.${system};

        # Additional dev-shell environment variables can be set directly
        # MY_CUSTOM_DEVELOPMENT_VAR = "something else";

        # Extra inputs can be added here; cargo and rustc are provided by default.
        packages = with nixpkgs; [];
      };
    });
}