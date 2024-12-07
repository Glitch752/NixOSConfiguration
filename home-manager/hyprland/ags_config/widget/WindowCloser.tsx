import { App, Astal, Gdk, Gtk } from "astal/gtk3";

let windowClosers: Gtk.Window[] = [];

export function removeWindowClosers() {
    for(const closer of windowClosers) {
        closer.destroy();
    }
    windowClosers = [];
}

export function addWindowClosers(menu: string) {
    if(windowClosers.length > 0) removeWindowClosers();

    for(const monitor of App.get_monitors()) {
        const closer = WindowCloser(menu, monitor);
        windowClosers.push(closer);
        App.add_window(closer);
    }
}

function WindowCloser(menu: string, monitor: Gdk.Monitor): Gtk.Window {
    function close() {
        App.get_window(menu)?.destroy();
        for(const closer of windowClosers) {
            closer.destroy();
        }
        windowClosers = [];
    }

    print("Creating window closer for", menu);

    return <window
        name={`${menu}Closer`}
        className="windowCloser"
        layer={Astal.Layer.TOP}
        gdkmonitor={monitor}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
    >
        <eventbox onClick={close} css="background-color: rgba(0, 0, 0, 0.2)" />
    </window> as Gtk.Window;
}