import { bind } from "astal";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";

export default function ControlsPopup() {
    return <box vertical>
        <label label="Temporary; styling TODO" />
        {/* TODO: Notifications */}
        {/* TODO: Better battery status? */}
        {/* TODO: More control buttons */}
    </box>;
}