import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { closeOpenPopup, PopupContent } from "../popups";
import { timeout } from "astal";
import { DrawingArea, Overlay, Revealer } from "astal/gtk3/widget";

export default function PopupWindow(
  monitor: Gdk.Monitor,
  windowName: string,
  popupContent: PopupContent
): Gtk.Window {
  return (
    <window
      className={`${windowName} popup`}
      name={windowName}
      namespace="ags-popup-window"
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={popupContent.anchor}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={App}
      onKeyPressEvent={(self, event: Gdk.Event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) closeOpenPopup();
      }}
      onRealize={(self) => {
        const revealer = self.get_children()[0] as Gtk.Revealer;
        timeout(0, () => revealer.set_reveal_child(true));
      }}
    >
      <Gtk.Revealer
        visible={true}
        transitionType={popupContent.revealTransitionType}
        transitionDuration={50}
        canFocus={false}
      >
        {popupContent.widget}
      </Gtk.Revealer>
    </window>
  ) as Gtk.Window;
}
