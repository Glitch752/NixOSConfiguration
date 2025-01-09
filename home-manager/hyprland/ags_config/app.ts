import { App, Astal, Gdk, Gtk } from "astal/gtk4";
import styles from "./style/styles.scss";
import Bar from "./widget/Bar";
import GLib from "gi://GLib";
import NotificationPopups from "./widget/notifications/NotificationPopups";
import { openPopup, PopupType } from "./popups";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { hyprlandMonitorToGdkMonitor } from "./utils";

// TODO: Shutdown menu
// TODO: Widget to select active wallpapers
// TODO: Audio mixer?
// TODO: Controls menu battery status
// TODO: Controls menu quick actions
// TODO: Brightness slider
// TODO: Pomodoro timer
// TODO: Better media controls

// Also not happy with this absolute path, but it works for now...
export function src() {
  return `${GLib.getenv("HOME")}/nixos-config/home-manager/hyprland/ags_config/`;
}

/**
 * The widgets displayed on every monitor and automatically updated when monitors are added or removed.
 */
class MonitorWindows {
  gdkmonitor: Gdk.Monitor;
  windows: Gtk.Window[];

  constructor(gdkmonitor: Gdk.Monitor) {
    this.gdkmonitor = gdkmonitor;

    this.windows = [Bar(gdkmonitor), NotificationPopups(gdkmonitor)];

    this.windows.forEach((widget) => widget.show());
  }

  destroy() {
    this.windows.forEach((widget) => widget.destroy());
    this.windows = [];
  }
}

App.start({
  icons: `${src()}/icons/`,
  css: styles,
  cursorTheme: "Adwaita",
  instanceName: "main",
  requestHandler(request: string, res) {
    const data = request.split(" ");
    if (data.length === 0) {
      res("No action specified");
      return;
    }

    const action = data[0];
    switch (action) {
      case "open": {
        if (data.length < 2) {
          res("No popup specified");
          return;
        }
        const popup = data[1];
        if (!Object.values(PopupType).includes(popup as PopupType)) {
          res("Invalid popup specified");
          return;
        }
        openPopup(popup as PopupType);
        res("Opened popup");
        break;
      }
      case "launcherList": {
        if (data.length < 2) {
          res("No launcher list specified");
          return;
        }
        openPopup(PopupType.RunPopup, {
          input: data.slice(1).join(" "),
          respond: res,
        });
        break;
      }
      default: {
        res("Unknown action");
      }
    }
  },
  main: () => {
    const monitorWidgets = new Map<Gdk.Monitor, MonitorWindows>();

    // Initialize
    for (const gdkmonitor of App.get_monitors()) {
      print(`Monitor ${gdkmonitor.get_model()} initialized`);
      monitorWidgets.set(gdkmonitor, new MonitorWindows(gdkmonitor));
    }

    const hyprland = AstalHyprland.get_default();

    hyprland.connect("monitor-added", (_, monitor) => {
      const gdkmonitor = hyprlandMonitorToGdkMonitor(monitor);
      monitorWidgets.set(gdkmonitor, new MonitorWindows(gdkmonitor));
    });

    hyprland.connect("monitor-removed", (_, id) => {
      const monitor = hyprland.get_monitors().find((monitor) => monitor.get_id() === id);
      if (!monitor) return;

      const gdkmonitor = hyprlandMonitorToGdkMonitor(monitor);
      monitorWidgets.get(gdkmonitor)?.destroy();
      monitorWidgets.delete(gdkmonitor);
      print(`Monitor ${gdkmonitor.get_model()} removed`);
    });
  },
});
