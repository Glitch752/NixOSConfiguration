import { App, Astal, Gtk, Gdk } from "astal/gtk3"
import { Binding, Variable, bind, execAsync } from "astal"
import Hyprland from "gi://AstalHyprland"
import Wp from "gi://AstalWp"
import Network from "gi://AstalNetwork"
import Battery from "gi://AstalBattery"
import Tray from "gi://AstalTray"
import Mpris from "gi://AstalMpris"
import { openMediaControls } from "../app"

function limitLength(s: string, n: number) {
    return s.length > n ? s.slice(0, n - 3) + "..." : s;
}

// Left panel

function NixOSIcon() {
    return <button className="nixosIcon" onClicked={() => execAsync('kitty sh -lic "neofetch && read -n 1 -s"')}>
        <icon icon="nixos" />
    </button>
}

function Workspaces() {
    const hypr = Hyprland.get_default();

    return <box className="workspaces">
        {bind(hypr, "workspaces").as(wss => wss
            // .filter(ws => ws.id > 0) // Negative-numbered workspaces are special ones that we don't want to show
            .sort((a, b) => a.id - b.id)
            .map(ws => (
                <button
                    className={bind(hypr, "focusedWorkspace").as(fw =>
                        ws === fw ? "focused" : "")}
                    tooltipText={`"${ws.name}": Workspace ${ws.id}${ws.id < 0 ? " (special; moves windows to focused workspace)" : ""}`}
                    onClicked={() => {
                        if(ws.id > 0) ws.focus();
                        else {
                            ws.get_clients().forEach(c => c.move_to(hypr.focusedWorkspace));
                        }
                    }}>
                    {ws.name}
                </button>
            ))
        )}
    </box>
}

function FocusedClient() {
    const hypr = Hyprland.get_default();
    const focused = bind(hypr, "focusedClient");

    return <box
        className="focusedClient"
        visible={focused.as(Boolean)}>
        {focused.as(client => (
            client && <label label={bind(client, "title").as((s) => limitLength(String(s), 60))} />
        ))}
    </box>
}


// Center panel

function Media() {
    const mpris = Mpris.get_default();

    // TODO: Progress bar and time elapsed/remaining
    return <button onClicked={openMediaControls}>
        <box className="media">
            {bind(mpris, "players").as(ps => ps[0] ? (
                <box>
                    <icon icon="music" />
                    <box
                        className="Cover"
                        valign={Gtk.Align.CENTER}
                        css={bind(ps[0], "coverArt").as(cover =>
                            `background-image: url('${cover}');`
                        )}
                    />
                    <label
                        label={bind(ps[0], "title").as(() =>
                            `${limitLength(ps[0].title, 40)}`
                        )}
                    />
                </box>
            ) : (
                "Nothing Playing"
            ))}
        </box>
    </button>
}


// Right panel

function SystemTray() {
    const tray = Tray.get_default()

    return <box>
        {bind(tray, "items").as(items => items.map(item => {
            if(item.iconThemePath) App.add_icons(item.iconThemePath)
            const menu = item.create_menu();

            return <button
                tooltipMarkup={bind(item, "tooltipMarkup")}
                onDestroy={() => menu?.destroy()}
                onClickRelease={self => {
                    menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null)
                }}
                tooltipText={bind(item, "tooltip").as(t => `${t.title}`)}>
                <icon gIcon={bind(item, "gicon")} />
            </button>
        }))}
    </box>
}

function ResourceUtilization() {
    const CPUUsage = Variable(0).poll(1000, ["bash", "-c", "top -bn 2 -d 0.01 | grep '^%Cpu' | tail -n 1 | gawk '{print $2+$4+$6}'"], parseFloat);
    const RAMUsage = Variable(0).poll(1000, ["bash", "-c", "free | awk '/Mem:/ {print $3/$2 * 100}'"], parseFloat);   

    return <button onClick={() => execAsync("missioncenter")} tooltipText="Resource Utilization">
        <box vertical className="resourceUtilization" valign={Gtk.Align.CENTER} halign={Gtk.Align.START}>
            <box>
                {/* <icon icon="processor" className="name" /> */}
                <box className="name">
                    <label label={"CPU"} halign={Gtk.Align.START} />
                </box>
                <label label={CPUUsage().as(u => `${u.toFixed(1)}%`)} onDestroy={() => CPUUsage.drop()} hexpand halign={Gtk.Align.START} className="cpu" />
            </box>
            <box>
                {/* <icon icon="memory" className="name" /> */}
                <box className="name">
                    <label label={"RAM"} halign={Gtk.Align.START} />
                </box>
                <label label={RAMUsage().as(u => `${u.toFixed(1)}%`)} onDestroy={() => RAMUsage.drop()} hexpand halign={Gtk.Align.START} className="ram" />
            </box>
        </box>
    </button>
}

function Bluetooth() {
    return <button className="bluetooth" onCLicked={() => execAsync("overskride")}>
        <icon
            tooltipText="Bluetooth"
            className="bluetoothIcon"
            icon="bluetooth"
        />
    </button>
}

function Wifi() {
    const { wifi } = Network.get_default();

    return <button className="wifi" onCLicked={() => execAsync("nm-connection-editor")}>
        <icon
            tooltipText={bind(wifi, "ssid").as(String)}
            className="wifi"
            icon={bind(wifi, "iconName")}
        />
    </button>
}

function AudioSlider() {
    const speaker = Wp.get_default()?.audio.defaultSpeaker!;

    return <box className="audio">
        <icon icon={bind(speaker, "volumeIcon").as(icon => icon ?? "audio-volume-low-symbolic")} />
        <slider
            hexpand
            onDragged={({ value }) => speaker.volume = value}
            value={bind(speaker, "volume")}
        />
    </box>
}

function BatteryLevel() {
    const battery = Battery.get_default();

    return <box className="battery" visible={bind(battery, "isPresent")}>
        <icon icon={bind(battery, "batteryIconName")} />
        <label label={bind(battery, "percentage").as(p =>
            `${Math.floor(p * 100)}%`
        )} />
    </box>
}

function Time() {
    const shortTime = Variable("").poll(1000, 'date "+%l:%M:%S %p"');
    const shortDate = Variable("").poll(1000, 'date "+%m/%d/%Y"');
    const tooltipText = Variable("").poll(1000, 'date "+%A, %B %d %Y - %m/%d/%y - %H:%M:%S %Z"');
    return <box
        vertical
        tooltipText={tooltipText()}
        className="time"
        valign={Gtk.Align.CENTER}
        onDestroy={() => {
            shortTime.drop();
            shortDate.drop();
            tooltipText.drop();
        }}
    >
        <label
            className="timeLabel"
            label={shortTime()}
        />
        <label
            className="dateLabel"
            label={shortDate()}
        />
    </box>;
}

function Separator() {
    return <box className="separator" />;
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
    return <window
        className="bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
        application={App}>
        <centerbox>
            <box hexpand halign={Gtk.Align.START}>
                {/* Left panel */}
                
                <NixOSIcon />

                <Separator />

                <Workspaces />

                <Separator />

                <FocusedClient />
            </box>

            <box halign={Gtk.Align.CENTER}>
                {/* Center panel */}

                <Media />
            </box>

            <box hexpand halign={Gtk.Align.END}>
                {/* Right panel */}

                {/* TODO: Pomodoro timer? */}

                <SystemTray />

                <Separator />

                <ResourceUtilization />

                <Separator />

                <Bluetooth />
                <Wifi />

                <Separator />

                <AudioSlider />
                {/* TODO: Brightness slider? */}

                <Separator />

                <BatteryLevel />

                <Separator />

                <Time />
            </box>
        </centerbox>
    </window>
}
