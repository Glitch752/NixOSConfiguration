{
  description = "NixOS configuration";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    # Home-manager, used for managing user configuration
    home-manager = {
      url = "github:nix-community/home-manager";
      # The `follows` keyword in inputs is used for inheritance.
      # Here, `inputs.nixpkgs` of home-manager is kept consistent with
      # the `inputs.nixpkgs` of the current flake,
      # to avoid problems caused by different versions of nixpkgs.
      inputs.nixpkgs.follows = "nixpkgs";
    };

    hyprland.url = "github:hyprwm/Hyprland";
    hyprlock.url = "github:hyprwm/hyprlock";
    pyprland.url = "github:hyprland-community/pyprland";
    woomer.url = "github:coffeeispower/woomer";
    swww.url = "github:LGFae/swww";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crane.url = "github:ipetkov/crane";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nixpkgs-wayland = {
      url = "github:nix-community/nixpkgs-wayland";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nixos-hardware.url = "github:NixOS/nixos-hardware/master";
  };
  
  outputs = { self, nixpkgs, home-manager, ... } @ inputs: let
    inherit (self) outputs;
  in {
    # NixOS configuration entrypoint
    # You can select a specific hostname with 'nixos-rebuild --flake .#your-hostname'
     
    # Make home-manager as a module of nixos so that home-manager configuration
    # will be deployed automatically when executing `nixos-rebuild switch`
    nixosConfigurations = let
      makeNixOSConfig =
        { username, hostname }: let specialArgs = { inherit username; };
        in nixpkgs.lib.nixosSystem {
          specialArgs = { inherit inputs; };
          system = "x86_64-linux";

          modules = [
            ./nixos/hosts/${hostname}/configuration.nix
            ./nixos/users/${username}.nix

            home-manager.nixosModules.home-manager {
              home-manager.useGlobalPkgs = true;
              home-manager.useUserPackages = true;
              home-manager.users.${username} = {
                imports = [
                  ./home-manager/users/${username}.nix
                  ./home-manager/hosts/${hostname}.nix
                ];
              };
              home-manager.extraSpecialArgs = { inherit inputs outputs; } // specialArgs;
              home-manager.backupFileExtension = "backup";
            }
          ];
        };
    # For each folder under ./nixos/hosts, create a NixOS configuration with the
    # folder name as a hostname and "brody" as a username 
    in 
      builtins.mapAttrs (hostname: _type: makeNixOSConfig {
        username = "brody";
        inherit hostname;
      }) (builtins.readDir ./nixos/hosts);

    # We could put home-manager configuration entrypoints here as well,
    # but I put them in nixosConfigurations instead so I don't have to
    # remember to run `home-manager switch` after `nixos-rebuild switch`.
  };
}
