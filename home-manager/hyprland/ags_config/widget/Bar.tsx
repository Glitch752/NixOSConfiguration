import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import { Binding, Variable, bind } from "astal"
import Hyprland from "gi://AstalHyprland"
import Wp from "gi://AstalWp"
import Network from "gi://AstalNetwork"
import Battery from "gi://AstalBattery"
import Tray from "gi://AstalTray"
import { openPopup, PopupType } from "../popups"
import { limitLength } from "../utils"
import Media from "./bar/BarMedia"
import { startApplication } from "../processes"

type BindableChild = Gtk.Widget | Binding<Gtk.Widget>;

export function Widget({
  cssClasses,
  child,
  children,
  icon,
  tooltipText,
  visible,

  onClicked,
  onButtonReleased
}: {
  cssClasses?: string[]

  child?: BindableChild
  children?: Array<BindableChild>
  icon?: string | Binding<string>,
  tooltipText?: string | Binding<string>,
  visible?: boolean | Binding<boolean>,

  onClicked?: () => any,
  onButtonReleased?: (widget: Gtk.Button, event: Gdk.Event) => any,
}) {
  if (onClicked || onButtonReleased) {
    return <box vexpand cssClasses={["widgetOuter"]}>
      <button
        tooltipText={tooltipText ?? ""}
        visible={visible ?? true} cssClasses={["widget", icon ? "icon" : "", ...cssClasses ?? []]}
        onClicked={onClicked ?? (() => { })}
        onButtonReleased={onButtonReleased ?? (() => { })}
      >
        <box>
          {icon && <image iconName={icon} />}
          {child}
          {children}
        </box>
      </button>
    </box>
  }

  return <box vexpand tooltipText={tooltipText ?? ""} visible={visible ?? true} cssClasses={["widget", "widgetOuter", icon ? "icon" : "", ...cssClasses ?? []]}>
    {icon ? <image iconName={icon} /> : null as any}
    {child ?? null as any}
    {children ?? null as any}
  </box>
}

// Left panel

function NixOSIcon() {
  return <Widget cssClasses={["nixosIcon"]} onClicked={() => startApplication('kitty sh -lic "fastfetch && read -n 1 -s"')} icon="nixos" />
}

function Workspaces() {
  const hypr = Hyprland.get_default();

  return <Widget icon="workspace" cssClasses={["workspaces"]}>
    {bind(hypr, "workspaces").as(wss => wss
      .sort((a, b) => a.id - b.id)
      .map(ws => (
        <button
          cssClasses={bind(hypr, "focusedWorkspace").as(fw => ws === fw ? ["focused"] : [])}
          tooltipText={`"${ws.name}": Workspace ${ws.id}${ws.id < 0 ? " (special; moves windows to focused workspace)" : ""}`}
          onClicked={() => {
            if (ws.id > 0) ws.focus();
            else {
              ws.get_clients().forEach(c => c.move_to(hypr.focusedWorkspace));
            }
          }}>
          {ws.name}
        </button>
      ))
    )}
  </Widget>
}

function FocusedClient() {
  const hypr = Hyprland.get_default();
  const focused = bind(hypr, "focusedClient");

  return <Widget
    cssClasses={["focusedClient"]}
    visible={focused.as(Boolean)}>
    {focused.as(client => (
      client && <label label={bind(client, "title").as((s) => limitLength(String(s), 60))} />
    ))}
  </Widget>
}

// Right panel

function SystemTray() {
  const tray = Tray.get_default()

  return <Widget cssClasses={["systemTray"]}>
    {bind(tray, "items").as(items => items.map(item =>
      <menubutton
        tooltipMarkup={bind(item, "tooltipMarkup")}
        menuModel={bind(item, "menuModel")}
      >
        <image gicon={bind(item, "gicon")} />
      </menubutton>
    ))}
  </Widget>
}

function CPUUtilization() {
  const CPUUsage = Variable(0).poll(1000, ["bash", "-c", "top -bn 2 -d 0.01 | grep '^%Cpu' | tail -n 1 | gawk '{print $2+$4+$6}'"], parseFloat);

  return <Widget icon="processor" onClicked={() => startApplication("missioncenter")} tooltipText="CPU Utilization">
    <label label={CPUUsage().as(u => `${u.toFixed(0)}%`)} onDestroy={() => CPUUsage.drop()} hexpand halign={Gtk.Align.START} />
  </Widget>
}

function RAMUtilization() {
  const RAMUsage = Variable(0).poll(1000, ["bash", "-c", "free | awk '/Mem:/ {print $3/$2 * 100}'"], parseFloat);

  return <Widget icon="memory" onClicked={() => startApplication("missioncenter")} tooltipText="RAM Utilization">
    <label label={RAMUsage().as(u => `${u.toFixed(0)}%`)} onDestroy={() => RAMUsage.drop()} hexpand halign={Gtk.Align.START} />
  </Widget>
}

function Bluetooth() {
  // TODO: Shortcut to run systemctl --user restart pipewire for bluetooth audio?
  return <Widget
    cssClasses={["bluetooth"]}
    tooltipText="Bluetooth"
    icon="bluetooth"
    onClicked={() => startApplication("overskride")}
  />
}

function Wifi() {
  const { wifi } = Network.get_default();

  return <Widget
    cssClasses={["wifi"]}
    tooltipText={bind(wifi, "ssid").as(String)}
    onClicked={() => startApplication("nm-connection-editor")}
    icon={bind(wifi, "iconName")}
  />
}

function Audio() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker!;

  return <Widget cssClasses={["audio"]} onClicked={() => startApplication("pavucontrol")} icon={bind(speaker, "volumeIcon").as(icon => icon ?? "audio-volume-low-symbolic")}>
    <label label={bind(speaker, "volume").as(v => `${Math.round(v * 100)}%`)}></label>
  </Widget>
}

function BatteryLevel() {
  const battery = Battery.get_default();

  return <Widget icon={bind(battery, "batteryIconName")} visible={bind(battery, "isPresent")}>
    <label label={bind(battery, "percentage").as(p =>
      `${Math.floor(p * 100)}%`
    )} />
  </Widget>
}

function Time() {
  const shortTime = Variable("").poll(1000, 'date "+%l:%M:%S %p"');
  const shortDate = Variable("").poll(1000, 'date "+%m/%d/%Y"');
  const tooltipText = Variable("").poll(1000, 'date "+%A, %B %d %Y - %m/%d/%y - %H:%M:%S %Z"');
  return <box
    vertical
    tooltipText={tooltipText()}
    cssClasses={["time"]}
    valign={Gtk.Align.CENTER}
    onDestroy={() => {
      shortTime.drop();
      shortDate.drop();
      tooltipText.drop();
    }}
  >
    <label
      cssClasses={["timeLabel"]}
      label={shortTime()}
    />
    <label
      cssClasses={["dateLabel"]}
      label={shortDate()}
    />
  </box>;
}

function ControlsPopupButton() {
  return <button onClicked={() => openPopup(PopupType.ControlsPopup)} cssClasses={["controlsPopupButton"]}>
    <image iconName="open-menu-symbolic" />
  </button>
}


export default function Bar(gdkmonitor: Gdk.Monitor): Gtk.Window {
  return <window
    cssClasses={["bar"]}
    namespace="ags-bar-window"
    gdkmonitor={gdkmonitor}
    layer={Astal.Layer.TOP}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
    application={App}
  >
    <centerbox>
      <box hexpand halign={Gtk.Align.START}>
        <NixOSIcon />
        <Workspaces />
        <FocusedClient />
      </box>

      <box halign={Gtk.Align.CENTER}>
        <Media />
      </box>

      <box hexpand halign={Gtk.Align.END}>
        <SystemTray />
        <CPUUtilization />
        <RAMUtilization />
        <Bluetooth />
        <Wifi />
        <Audio />
        <BatteryLevel />

        <Widget>
          <Time />
          <ControlsPopupButton />
        </Widget>
      </box>
    </centerbox>
  </window> as Gtk.Window;
}
