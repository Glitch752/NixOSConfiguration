import { bind } from "astal";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";
import { hideOpenPopup } from "./WindowCloser";

export default function ControlsPopup(monitor: Gdk.Monitor): Gtk.Window | null {
    const mpris = Mpris.get_default();
    const players = bind(mpris, "players").as(p => p.filter(player => player.title !== ""));

    return <window
        className="controlsPopup"
        name="controlsPopup"

        gdkmonitor={monitor}

        exclusivity={Astal.Exclusivity.NORMAL}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}

        keymode={Astal.Keymode.EXCLUSIVE}
        application={App}

        onKeyPressEvent={(self, event: Gdk.Event) => {
            if(event.get_keyval()[1] === Gdk.KEY_Escape) hideOpenPopup();
        }}
    >
        <box vertical>
            <label label="Temporary; styling TODO" />
            {/* TODO: Notifications */}
            {/* TODO: Better battery status? */}
            {/* TODO: More control buttons */}
        </box>
    </window> as Gtk.Window;
}