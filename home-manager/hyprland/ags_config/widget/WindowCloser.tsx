import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { closeOpenPopup, PopupContent } from "../popups";
import { DrawingArea } from "astal/gtk3/widget";

export function WindowCloser(menu: string, monitor: Gdk.Monitor, popupData: PopupContent): Gtk.Window {
  return (
    <window
      name={`${menu}Closer`}
      className="windowCloser"
      layer={Astal.Layer.TOP}
      exclusivity={Astal.Exclusivity.NORMAL}
      gdkmonitor={monitor}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
    >
      <eventbox
        onClick={closeOpenPopup}
        css={ `background-color: rgba(0, 0, 0, ${String(popupData.backgroundOpacity)})` }
      >
        { popupData.drawBackground ? (
          <DrawingArea
            onRealize={popupData.drawBackground.onRealize}
            onDraw={popupData.drawBackground.onDraw as any}
            onDestroy={popupData.drawBackground.onDestroy}
          />
        ) : null }
      </eventbox>
    </window>
  ) as Gtk.Window;
}
