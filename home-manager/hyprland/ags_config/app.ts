import { App, Gdk, Gtk } from "astal/gtk3";
import styles from "./style/styles.scss";
import Bar from "./widget/Bar";
import GLib from "gi://GLib";
import NotificationPopups from "./widget/notifications/NotificationPopups";


// TODO: Shutdown menu
// TODO: Calendar menu?
// TODO: Widget to select are active wallpapers
// TODO: Audio mixer?

// Also not happy with this absolute path, but it works for now...
const HOME = GLib.getenv("HOME");
const src = `${HOME}/nixos-config/home-manager/hyprland/ags_config/`;

/**
 * The widgets displayed on every monitor and automatically updated when monitors are added or removed.
 */
class MonitorWidgets {
  gdkmonitor: Gdk.Monitor;
  widgets: Gtk.Widget[];

  constructor(gdkmonitor: Gdk.Monitor) {
    this.gdkmonitor = gdkmonitor;

    this.widgets = [Bar(gdkmonitor), NotificationPopups(gdkmonitor)];
  }

  destroy() {
    this.widgets.forEach((widget) => widget.destroy());
    this.widgets = [];
  }
}

App.start({
  icons: `${src}/icons/`,
  css: styles,
  instanceName: "main",
  requestHandler(request, res) {
    print(request);
    res("ok");
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
  },
});