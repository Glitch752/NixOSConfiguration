import { App, Gdk } from "astal/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export function hyprlandMonitorToGdkMonitor(monitor: AstalHyprland.Monitor): Gdk.Monitor {
  const display = Gdk.Display.get_default();
  if (!display) throw new Error("No display found");

  const monitors = App.get_monitors();
  for (let gdkmonitor of monitors) {
    if (monitor.get_name() === gdkmonitor.get_connector()) return gdkmonitor;
  }

  // Fallback to monitors with the same model and size
  for (let gdkmonitor of monitors) {
    if (
      monitor.get_model() === gdkmonitor.get_model() &&
      monitor.get_scale() === gdkmonitor.get_scale_factor() &&
      monitor.get_width() === gdkmonitor.get_geometry().width &&
      monitor.get_height() === gdkmonitor.get_geometry().height
    ) return gdkmonitor;
  }

  // Fallback to the first monitor
  return monitors[0];
}

export function gdkMonitorToHyprlandMonitor(monitor: Gdk.Monitor): AstalHyprland.Monitor {
  const hyprland = AstalHyprland.get_default();
  const monitors = hyprland.get_monitors();
  for (let hyprmonitor of monitors) {
    if (hyprmonitor.get_name() === monitor.get_connector()) return hyprmonitor;
  }

  // Fallback to monitors with the same model and size
  for (let hyprmonitor of monitors) {
    if (
      hyprmonitor.get_model() === monitor.get_model() &&
      hyprmonitor.get_scale() === monitor.get_scale_factor() &&
      hyprmonitor.get_width() === monitor.get_geometry().width &&
      hyprmonitor.get_height() === monitor.get_geometry().height
    ) return hyprmonitor;
  }

  throw new Error("No matching monitor found");
}

export function limitLength(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 3) + "..." : s;
}

export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function copyToClipboard(text: string) {
  const clipboard = Gdk.Display.get_default()?.get_clipboard();
  if (!clipboard) return;

  clipboard.set_content(Gdk.ContentProvider.new_for_value(text));
}

Array.prototype.defaultIfEmpty = function <T>(defaultValue: T): T[] {
  return this.length > 0 ? this : [defaultValue];
};
Array.prototype.all = function <T>(predicate: (value: T) => boolean): boolean {
  for (let value of this) {
    if (!predicate(value)) return false;
  }
  return true;
};
Array.prototype.any = function <T>(predicate: (value: T) => boolean): boolean {
  for (let value of this) {
    if (predicate(value)) return true;
  }
  return false;
};
declare global {
  interface Array<T> {
    defaultIfEmpty(defaultValue: T): T[];
    all(predicate: (value: T) => boolean): boolean;
    any(predicate: (value: T) => boolean): boolean;
  }
}
