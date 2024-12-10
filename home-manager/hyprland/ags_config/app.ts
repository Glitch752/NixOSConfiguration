import { App, Gdk, Gtk } from "astal/gtk3"
import styles from "./style/styles.scss"

import Bar from "./widget/Bar"
import MediaControls from "./widget/MediaControls"

import GLib from "gi://GLib"
import Hyprland from "gi://AstalHyprland?version=0.1"
import { bind } from "astal"
import { addWindowClosers, removeWindowClosers } from "./widget/WindowCloser"

const HOME = GLib.getenv("HOME");

// Also not happy with this absolute path, but it works for now...
const src = `${HOME}/nixos-config/home-manager/hyprland/ags_config/`;

export function closeMediaControls() {
    const mediaControls = App.get_window("mediaControls");
    if(!mediaControls) return;

    mediaControls.destroy();
    removeWindowClosers();
}
export function openMediaControls() {
    const mediaControls = App.get_window("mediaControls");
    if(!mediaControls) {
        // Pick the monitor that the mouse is currently on
        const [window, x, y] = Gdk.Display.get_default()?.get_window_at_pointer() ?? [null, 0, 0];
        const monitor = window ? Gdk.Display.get_default()?.get_monitor_at_window(window) : undefined;
        if(monitor === undefined) return null;

        addWindowClosers("mediaControls");

        const controls = MediaControls(monitor);
        if(!controls) return;
        App.add_window(controls);

        return;
    }

    closeMediaControls();
}

App.start({
    icons: `${src}/icons/`,
    css: styles,
    requestHandler(request, res) {
        print(request)
        res("ok")
    },
    main: () => {
        const bars = new Map<Gdk.Monitor, Gtk.Widget>();
    
        // Initialize
        for (const gdkmonitor of App.get_monitors()) {
            bars.set(gdkmonitor, Bar(gdkmonitor));
        }
    
        App.connect("monitor-added", (_, gdkmonitor) => {
            bars.set(gdkmonitor, Bar(gdkmonitor));
            print(`Monitor ${gdkmonitor.get_model()} added`);
        });
    
        App.connect("monitor-removed", (_, gdkmonitor) => {
            bars.get(gdkmonitor)?.destroy();
            bars.delete(gdkmonitor);
            print(`Monitor ${gdkmonitor.get_model()} removed`);
        });

        // If the focused monitor changes, close the media controls
        const hypr = Hyprland.get_default();
        bind(hypr, "focusedMonitor").subscribe(() => closeMediaControls);
    }
});