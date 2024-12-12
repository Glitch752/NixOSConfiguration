import { App, Astal, Gdk, Gtk } from "astal/gtk3";

let closeOpenMenus: (() => void) | null = null;
let windowClosers: Gtk.Window[] = [];

export function hideOpenPopup() {
    if(closeOpenMenus) {
        closeOpenMenus();
        closeOpenMenus = null;
    }
}

export function addWindowClosersForPopup(menu: string) {
    hideOpenPopup();

    for(const monitor of App.get_monitors()) {
        const closer = WindowCloser(menu, monitor);
        windowClosers.push(closer);
        App.add_window(closer);
    }
}

function WindowCloser(menu: string, monitor: Gdk.Monitor): Gtk.Window {
    closeOpenMenus = () => {
        App.get_window(menu)?.destroy();
        for(const closer of windowClosers) {
            closer.destroy();
        }
        windowClosers = [];
    };

    return <window
        name={`${menu}Closer`}
        className="windowCloser"
        layer={Astal.Layer.TOP}
        exclusivity={Astal.Exclusivity.NORMAL}
        gdkmonitor={monitor}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
    >
        <eventbox onClick={closeOpenMenus} css="background-color: rgba(0, 0, 0, 0.3)" />
    </window> as Gtk.Window;
}