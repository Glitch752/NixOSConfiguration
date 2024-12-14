import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { closeOpenPopup, PopupContent } from "../popups";

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
        css={`background-color: rgba(0, 0, 0, ${String(popupData.backgroundOpacity)})`}
      />
    </window>
  ) as Gtk.Window;
}
