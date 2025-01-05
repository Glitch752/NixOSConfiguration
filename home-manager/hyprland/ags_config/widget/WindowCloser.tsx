import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { closeOpenPopup, PopupContent } from "../popups";
import { DrawingArea } from "astal/gtk3/widget";

export function WindowCloser(
  menu: string,
  monitor: Gdk.Monitor,
  popupData: PopupContent
): Gtk.Window {
  const drawBackground = popupData.drawBackground
    ? popupData.drawBackground()
    : null;

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
        css={`
          background-color: rgba(
            0,
            0,
            0,
            ${String(popupData.backgroundOpacity)}
          );
        `}
      >
        {drawBackground ? (
          <DrawingArea
            onRealize={drawBackground.onRealize}
            onDraw={drawBackground.onDraw as any}
            onDestroy={drawBackground.onDestroy}
          />
        ) : null}
      </eventbox>
    </window>
  ) as Gtk.Window;
}
