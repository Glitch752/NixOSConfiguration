import { App, Astal, Gdk, Gtk } from "astal/gtk4";
import { WindowCloser } from "./widget/WindowCloser";
import PopupWindow from "./widget/PopupWindow";
import ControlsPopup from "./widget/ControlsPopup";
import MediaControls, {
  drawMediaControlsBackground,
} from "./widget/MediaControls";
import { exec } from "astal";
import RunPopup, { CenteredRunPopup } from "./widget/launcher/RunPopup";
import cairo from "cairo";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { hyprlandMonitorToGdkMonitor } from "./utils";

export enum PopupType {
  MediaControls = "mediaControls",
  ControlsPopup = "controlsPopup",
  RunPopup = "runPopup",
}

export type DrawBackgroundContext = {
  onRealize: (self: Gtk.DrawingArea) => void;
  onDraw: (self: Gtk.DrawingArea, cr: cairo.Context) => void;
  onDestroy: (self: Gtk.DrawingArea) => void;
};

export type PopupContent = {
  widget: Gtk.Widget;
  anchor: Astal.WindowAnchor;
  drawBackground?: () => DrawBackgroundContext;
  backgroundOpacity: number;
  revealTransitionType: Gtk.RevealerTransitionType;
};

function getPopup(popupType: PopupType, data?: PopupData): PopupContent {
  switch (popupType) {
    case PopupType.MediaControls:
      return {
        widget: MediaControls(),
        anchor: Astal.WindowAnchor.TOP,
        drawBackground: drawMediaControlsBackground,
        backgroundOpacity: 0,
        revealTransitionType: Gtk.RevealerTransitionType.SLIDE_DOWN,
      };
    case PopupType.ControlsPopup:
      return {
        widget: ControlsPopup(),
        anchor:
          Astal.WindowAnchor.TOP |
          Astal.WindowAnchor.RIGHT |
          Astal.WindowAnchor.BOTTOM,
        backgroundOpacity: 0,
        revealTransitionType: Gtk.RevealerTransitionType.SLIDE_LEFT,
      };
    case PopupType.RunPopup:
      return {
        widget: data ? CenteredRunPopup(data) : RunPopup(),
        anchor:
          Astal.WindowAnchor.LEFT |
          Astal.WindowAnchor.TOP |
          Astal.WindowAnchor.BOTTOM |
          (data ? Astal.WindowAnchor.RIGHT : 0),
        backgroundOpacity: 0,
        revealTransitionType: Gtk.RevealerTransitionType.SLIDE_RIGHT,
      };
  }
}

function getMonitorForPopup(): AstalHyprland.Monitor | null {
  const hyprland = AstalHyprland.get_default();
  return hyprland.get_focused_monitor();
}

let openPopupData: {
  close: () => void;
  type: PopupType;
  monitor: Gdk.Monitor;
  windowClosers: Gtk.Window[];
} | null = null;

export function closeOpenPopup() {
  if (openPopupData) {
    openPopupData.close();
    for (const closer of openPopupData.windowClosers) closer.destroy();
    openPopupData = null;
  }
}

function addWindowClosersForPopup(
  menu: string,
  popupData: PopupContent
): Gtk.Window[] {
  closeOpenPopup();

  let windowClosers: Gtk.Window[] = [];
  for (const monitor of App.get_monitors()) {
    const closer = WindowCloser(menu, monitor, popupData);
    windowClosers.push(closer);
    App.add_window(closer);
  }
  return windowClosers;
}

export type PopupData = {
  input: string;
  respond: (response: string) => void;
};

export function openPopup(popupType: PopupType, data?: PopupData) {
  const monitor = getMonitorForPopup();
  if (!monitor) return;
  const gdkmonitor = hyprlandMonitorToGdkMonitor(monitor);

  if (
    !openPopupData ||
    openPopupData.type !== popupType ||
    openPopupData.monitor !== gdkmonitor
  ) {
    const popupData = getPopup(popupType, data);
    const windowClosers = addWindowClosersForPopup(popupType, popupData);

    windowClosers.forEach((closer) => closer.show());

    const popup = PopupWindow(gdkmonitor, popupType, popupData);
    popup.show();
    App.add_window(popup);

    openPopupData = {
      close: () => {
        App.get_window(popupType)?.destroy();
        if (data) data.respond("");
      },
      type: popupType,
      windowClosers: windowClosers,
      monitor: gdkmonitor,
    };

    return;
  }

  closeOpenPopup();
}
