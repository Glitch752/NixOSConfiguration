import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { closeOpenPopup } from "../popups";

export function WindowCloser(menu: string, monitor: Gdk.Monitor): Gtk.Window {
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
        css="background-color: rgba(0, 0, 0, 0.3)"
      />
    </window>
  ) as Gtk.Window;
}
