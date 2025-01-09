import { App, Astal, astalify, Gdk, Gtk } from "astal/gtk4";
import { closeOpenPopup, PopupContent } from "../popups";

const DrawingArea = astalify<Gtk.DrawingArea, Gtk.DrawingArea.ConstructorProps>(Gtk.DrawingArea, {})

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
      cssClasses={["windowCloser"]}
      layer={Astal.Layer.TOP}
      exclusivity={Astal.Exclusivity.NORMAL}
      gdkmonitor={monitor}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
      onButtonPressed={(self, state) => {
        if (state.get_button() === Gdk.BUTTON_PRIMARY || state.get_button() === Gdk.BUTTON_SECONDARY) {
          closeOpenPopup();
        }
      }}
      setup={(self) => {
        // I don't know if this is the best way to do this, but it works for now.
        const provider = Gtk.CssProvider.new();
        provider.load_from_data(`
          window {
            /* For some reason, if this is fully transparent, no mouse events are registered. */
            background-color: rgba(0, 0, 0, ${popupData.backgroundOpacity || 0.01});
          }
        `, -1);
        self.get_style_context().add_provider(provider, 800);
      }}
    >
      {drawBackground ? (
        // TODO
        // <box />
        <DrawingArea
          setup={(self) => {
            drawBackground.onRealize(self);
            self.set_draw_func(drawBackground.onDraw as any);
          }}
          onDestroy={drawBackground.onDestroy}
        />
      ) : null}
    </window>
  ) as Gtk.Window;
}
