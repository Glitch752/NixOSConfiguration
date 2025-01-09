import { App, Astal, Gdk, Gtk } from "astal/gtk4";
import { closeOpenPopup, PopupContent } from "../popups";
import { timeout } from "astal";

export default function PopupWindow(
  monitor: Gdk.Monitor,
  windowName: string,
  popupContent: PopupContent
): Gtk.Window {
  return (
    <window
      cssClasses={[windowName, "popup"]}
      name={windowName}
      namespace="ags-popup-window"
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={popupContent.anchor}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={App}
      onKeyPressed={(self, keyval) => {
        if (keyval === Gdk.KEY_Escape) closeOpenPopup();
      }}
      onRealize={(self) => {
        const revealer = self.get_first_child() as Gtk.Revealer;
        timeout(0, () => revealer.set_reveal_child(true));
      }}
    >
      <Gtk.Revealer
        visible={true}
        transitionType={popupContent.revealTransitionType}
        transitionDuration={50}
      >
        {popupContent.widget}
      </Gtk.Revealer>
    </window>
  ) as Gtk.Window;
}
