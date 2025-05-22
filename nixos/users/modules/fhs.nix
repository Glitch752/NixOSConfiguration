{ inputs, outputs, lib, config, pkgs, ... }: {
    environment.systemPackages = [
        # Create a development shell based on the Filesystem Hierarchy Standard (FHS) with a set of
        # standard packages based on the list maintained by the appimagetools package.
        # Embrace the FHS... It's un-nix-like, but needed for some case and removes _so many_ headaches.
        # buildFHSEnv -> https://nixos.org/manual/nixpkgs/stable/#sec-fhs-environments
        (pkgs.buildFHSEnv (pkgs.appimageTools.defaultFhsEnvArgs // {
            name = "fhs";
            targetPkgs = pkgs: with pkgs; [
                # Run PowerShell scripts, which are sometimes included in NuGet packages like Playwright
                powershell
                # Timezones
                tzdata
                # Locales
                glibcLocales
                
                # Miscellaneous packages required
                libxkbcommon
                libnl
                libnsl
                iptables
            ];
            # Commands to be executed in the development shell
            profile = ''
                # Set LANG for locales, otherwise it is unset when running "nix-shell --pure"
                export LANG="C.UTF-8"

                # Do not pollute $HOME with config files (both paths are ignored in .gitignore)
                export DOTNET_CLI_HOME="$PWD/.net_cli_home"
                export NUGET_PACKAGES="$PWD/.nuget_packages"

                # Add a prefix to the oh-my-zsh prompt.
                # This is not a default feature; we manually reconfigure PROMPT at initialization.
                export PROMPT_PREFIX="(fhs) "
                
            '';
            runScript = "zsh";
        }))
    ];
}