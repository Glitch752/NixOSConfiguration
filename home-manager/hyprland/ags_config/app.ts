import { App, Gdk, Gtk } from "astal/gtk3"
import styles from "./style/styles.scss"

import Bar from "./widget/Bar"
import MediaControls from "./widget/MediaControls"

import GLib from "gi://GLib"
import Hyprland from "gi://AstalHyprland?version=0.1"
import { bind } from "astal"
import { addWindowClosersForPopup, hideOpenPopup as hideOpenPopup } from "./widget/WindowCloser"
import NotificationPopups from "./widget/notifications/NotificationPopups"
import ControlsPopup from "./widget/ControlsPopup"

const HOME = GLib.getenv("HOME");

// TODO: Shutdown menu
// TODO: Calendar menu?
// TODO: Widget to select are active wallpapers
// TODO: Audio mixer?

// Also not happy with this absolute path, but it works for now...
const src = `${HOME}/nixos-config/home-manager/hyprland/ags_config/`;

function getMonitorForPopup(): Gdk.Monitor | null {
    // Pick the monitor that the mouse is currently on
    const [window, x, y] = Gdk.Display.get_default()?.get_window_at_pointer() ?? [null, 0, 0];
    const monitor = window ? Gdk.Display.get_default()?.get_monitor_at_window(window) : null;
    return monitor ?? null;
}

export function openMediaControls() {
    const mediaControls = App.get_window("mediaControls");
    if(!mediaControls) {
        const monitor = getMonitorForPopup();
        if(monitor === null) return null;

        addWindowClosersForPopup("mediaControls");

        const controls = MediaControls(monitor);
        if(!controls) return;
        App.add_window(controls);

        return;
    }

    hideOpenPopup();
}
export function openControlsPopup() {
    const controlsPopup = App.get_window("controlsPopup");
    if(!controlsPopup) {
        const monitor = getMonitorForPopup();
        if(monitor === null) return null;

        // Pick the monitor that the mouse is currently on
        addWindowClosersForPopup("controlsPopup");

        const controls = ControlsPopup(monitor);
        if(!controls) return;
        App.add_window(controls);

        return;
    }

    hideOpenPopup();
}

/**
 * The widgets displayed on every monitor and automatically updated when monitors are added or removed.
 */
class MonitorWidgets {
    gdkmonitor: Gdk.Monitor;
    widgets: Gtk.Widget[];

    constructor(gdkmonitor: Gdk.Monitor) {
        this.gdkmonitor = gdkmonitor;

        this.widgets = [
            Bar(gdkmonitor),
            NotificationPopups(gdkmonitor),
        ];
    }

    destroy() {
        this.widgets.forEach(widget => widget.destroy());
        this.widgets = [];

        
    }
}

App.start({
    icons: `${src}/icons/`,
    css: styles,
    instanceName: "main",
    requestHandler(request, res) {
        print(request)
        res("ok")
    },
    main: () => {
        const monitorWidgets = new Map<Gdk.Monitor, MonitorWidgets>();
    
        // Initialize
        for (const gdkmonitor of App.get_monitors()) {
            monitorWidgets.set(gdkmonitor, new MonitorWidgets(gdkmonitor));
        }
    
        App.connect("monitor-added", (_, gdkmonitor) => {
            monitorWidgets.set(gdkmonitor, new MonitorWidgets(gdkmonitor));
            print(`Monitor ${gdkmonitor.get_model()} added`);
        });
    
        App.connect("monitor-removed", (_, gdkmonitor) => {
            monitorWidgets.get(gdkmonitor)?.destroy();
            monitorWidgets.delete(gdkmonitor);
            print(`Monitor ${gdkmonitor.get_model()} removed`);
        });

        // If the focused monitor changes, close the media controls
        const hypr = Hyprland.get_default();
        bind(hypr, "focusedMonitor").subscribe(() => hideOpenPopup);
    }
});