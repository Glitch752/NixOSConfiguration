import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { WindowCloser } from "./widget/WindowCloser";
import PopupWindow from "./widget/PopupWindow";
import ControlsPopup from "./widget/ControlsPopup";
import MediaControls from "./widget/MediaControls";

export enum PopupType {
  MediaControls = "mediaControls",
  ControlsPopup = "controlsPopup",
}

function getPopup(popupType: PopupType) {
  switch (popupType) {
    case PopupType.MediaControls:
      return {
        widget: MediaControls(),
        anchor: Astal.WindowAnchor.TOP,
      };
    case PopupType.ControlsPopup:
      return {
        widget: ControlsPopup(),
        anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
      };
  }
}

function getMonitorForPopup(): Gdk.Monitor | null {
  // Pick the monitor that the mouse is currently on
  const [window, x, y] = Gdk.Display.get_default()?.get_window_at_pointer() ?? [null, 0, 0];
  const monitor = window ? Gdk.Display.get_default()?.get_monitor_at_window(window) : null;
  return monitor ?? null;
}

let closeOpenMenus: (() => void) | null = null;
let windowClosers: Gtk.Window[] = [];

export function closeOpenPopup() {
  if(closeOpenMenus) {
    closeOpenMenus();
    closeOpenMenus = null;
  }
}

function addWindowClosersForPopup(menu: string) {
  closeOpenPopup();

  for(const monitor of App.get_monitors()) {
    const closer = WindowCloser(menu, monitor);
    windowClosers.push(closer);
    App.add_window(closer);
  }
}

export function openPopup(popupType: PopupType) {
  const popupWindow = App.get_window(popupType);
  if(!popupWindow) {
    const monitor = getMonitorForPopup();
    if(monitor === null) return null;

    addWindowClosersForPopup("mediaControls");

    const popup = PopupWindow(monitor, popupType, getPopup(popupType));
    App.add_window(popup);

    closeOpenMenus = () => {
      App.get_window(popupType)?.destroy();
      for(const closer of windowClosers) closer.destroy();
      windowClosers = [];
    };

    return;
  }

  closeOpenPopup();
}