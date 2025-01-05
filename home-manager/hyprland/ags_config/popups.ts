import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { WindowCloser } from "./widget/WindowCloser";
import PopupWindow from "./widget/PopupWindow";
import ControlsPopup from "./widget/ControlsPopup";
import MediaControls, { drawMediaControlsBackground } from "./widget/MediaControls";
import { exec } from "astal";
import RunPopup, { CenteredRunPopup } from "./widget/launcher/RunPopup";
import cairo from "cairo";

export enum PopupType {
  MediaControls = "mediaControls",
  ControlsPopup = "controlsPopup",
  RunPopup = "runPopup",
}

export type DrawBackgroundContext = {
  onRealize: (self: Gtk.DrawingArea) => void;
  onDraw: (self: Gtk.DrawingArea, cr: cairo.Context) => void;
  onDestroy: (self: Gtk.DrawingArea) => void;
}

export type PopupContent = {
  widget: Gtk.Widget;
  anchor: Astal.WindowAnchor;
  drawBackground?: DrawBackgroundContext;
  backgroundOpacity: number;
  revealTransitionType: Gtk.RevealerTransitionType;
};

function getPopup(popupType: PopupType, data?: PopupData): PopupContent {
  switch (popupType) {
    case PopupType.MediaControls:
      return {
        widget: MediaControls(),
        anchor: Astal.WindowAnchor.TOP,
        drawBackground: drawMediaControlsBackground(),
        backgroundOpacity: 0,
        revealTransitionType: Gtk.RevealerTransitionType.SLIDE_DOWN
      };
    case PopupType.ControlsPopup:
      return {
        widget: ControlsPopup(),
        anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM,
        backgroundOpacity: 0,
        revealTransitionType: Gtk.RevealerTransitionType.SLIDE_LEFT
      };
    case PopupType.RunPopup:
      return {
        widget: data ? CenteredRunPopup(data) : RunPopup(),
        anchor: Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | (data ? Astal.WindowAnchor.RIGHT : 0),
        backgroundOpacity: 0,
        revealTransitionType: Gtk.RevealerTransitionType.SLIDE_RIGHT
      };
  }
}

/**
 * We have to use this hacky solution until astal's gtk4 support is ready since GDK doesn't give us
 * monitor descriptions or anything else necessary to perfectly map hyprland monitors to GDK monitors.
 * Furthermore, GDK thinks all our monitors are at (0, 0) on top of each other, so we can't use GDK
 * to find the focused monitor.  
 * Technically, this means that if you have multiple monitors with the same resolution, model, and scale,
 * the popup can open on the wrong one. However, I don't think this is a huge deal for now.  
 * See https://github.com/Jas-SinghFSU/HyprPanel/blob/955eed6c60a3ea5d6b0b1b8b7086cffbae984277/modules/bar/Bar.ts#L137C1-L173C4
 * (although this is the inverse of what we're doing here)
 */
function getMonitorForPopup(): Gdk.Monitor | null {
  const monitors = JSON.parse(exec(`hyprctl monitors -j`)) as { width: number, height: number, model: string, scale: number, focused: boolean }[];
  const activeMonitor = monitors.find((monitor) => monitor.focused);
  if(!activeMonitor) return null;

  const { width, height, model, scale } = activeMonitor;

  const gdkMonitors = App.get_monitors();
  for(const monitor of gdkMonitors) {
    if(
      monitor.get_geometry().width === width &&
      monitor.get_geometry().height === height &&
      monitor.get_scale_factor() === scale &&
      monitor.get_model() === model
    ) {
      return monitor;
    }
  }

  // Fallback to the first monitor
  if(gdkMonitors.length > 0) return gdkMonitors[0];

  return null;
}

let openPopupData: {
  close: () => void,
  type: PopupType,
  monitor: Gdk.Monitor,
  windowClosers: Gtk.Window[],
} | null = null;

export function closeOpenPopup() {
  if(openPopupData) {
    openPopupData.close();
    for(const closer of openPopupData.windowClosers) closer.destroy();
    openPopupData = null;
  }
}

function addWindowClosersForPopup(menu: string, popupData: PopupContent): Gtk.Window[] {
  closeOpenPopup();

  let windowClosers: Gtk.Window[] = [];
  for(const monitor of App.get_monitors()) {
    const closer = WindowCloser(menu, monitor, popupData);
    windowClosers.push(closer);
    App.add_window(closer);
  }
  return windowClosers;
}

export type PopupData = {
  input: string,
  respond: (response: string) => void
};

export function openPopup(popupType: PopupType, data?: PopupData) {
  const monitor = getMonitorForPopup();
  if(monitor === null) return;

  if(!openPopupData || openPopupData.type !== popupType || openPopupData.monitor !== monitor) {
    const popupData = getPopup(popupType, data);
    const windowClosers = addWindowClosersForPopup(popupType, popupData);

    const popup = PopupWindow(monitor, popupType, popupData);
    App.add_window(popup);

    openPopupData = {
      close: () => {
        App.get_window(popupType)?.destroy();
        if(data) data.respond("");
      },
      type: popupType,
      windowClosers: windowClosers,
      monitor: monitor
    };

    return;
  }

  closeOpenPopup();
}