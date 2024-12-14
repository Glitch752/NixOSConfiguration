import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { closeOpenPopup } from "../popups";

export type PopupContent = {
  widget: Gtk.Widget;
  anchor: Astal.WindowAnchor;
};

export default function PopupWindow(
  monitor: Gdk.Monitor,
  windowName: string,
  popupContent: PopupContent
): Gtk.Window {
  return (
    <window
      className={`${windowName} popupWindow`}
      name={windowName}
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={popupContent.anchor}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={App}
      onKeyPressEvent={(self, event: Gdk.Event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) closeOpenPopup();
      }}
    >
      {popupContent.widget}
    </window>
  ) as Gtk.Window;
}
