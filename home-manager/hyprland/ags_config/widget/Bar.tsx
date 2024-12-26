import { App, Astal, Gtk, Gdk } from "astal/gtk3"
import { Binding, Variable, bind, execAsync, timeout } from "astal"
import Hyprland from "gi://AstalHyprland"
import Wp from "gi://AstalWp"
import Network from "gi://AstalNetwork"
import Battery from "gi://AstalBattery"
import Tray from "gi://AstalTray"
import Mpris from "gi://AstalMpris"
import { openPopup, PopupType } from "../popups"
import { formatDuration, limitLength } from "../utils"
import { mergeBindings } from "astal/gtk3/astalify"
import { Subscribable } from "astal/binding"

const COMPACT = false;

// Left panel

function NixOSIcon() {
  return <button className="nixosIcon" onClicked={() => execAsync('kitty sh -lic "fastfetch && read -n 1 -s"')}>
    <icon icon="nixos" />
  </button>
}

function Workspaces() {
  const hypr = Hyprland.get_default();

  return <box className="workspaces">
    {bind(hypr, "workspaces").as(wss => wss
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

function playerPriority(player: Mpris.Player) {
  // TODO
  return 0;
}

enum DisplayedPlayerData {
  SongName,
  Artist,
  Duration,
  Progress
};

// The player can be in a displayed player data more or a "cycle" mode.
class PlayerMode implements Subscribable {
  private mode: DisplayedPlayerData | "cycle" = DisplayedPlayerData.SongName;
  private showedMode: Variable<DisplayedPlayerData> = Variable(DisplayedPlayerData.SongName);

  private cycleTime = 3000;

  cycleNext() {
    if(this.mode === "cycle") {
      let newMode = this.showedMode.get();
      
      newMode = this.showedMode.get() + 1;
      if(newMode > DisplayedPlayerData.Progress) newMode = DisplayedPlayerData.SongName;

      this.showedMode.set(newMode);
      print(newMode);

      timeout(this.cycleTime, () => this.cycleNext());
    }
  }

  next() {
    // This is pretty hacky...
    if(this.mode === "cycle") {
      this.mode = DisplayedPlayerData.SongName;
      this.showedMode.set(this.mode);
    } else if(this.mode === DisplayedPlayerData.Progress) {
      this.mode = "cycle";
      timeout(this.cycleTime, () => this.cycleNext());
    } else {
      this.mode++;
      this.showedMode.set(this.mode);
    }
  }

  get() {
    return this.showedMode.get();
  }

  subscribe(callback: (mode: DisplayedPlayerData) => void) {
    return this.showedMode.subscribe(callback);
  }
}

function Media() {
  const mpris = Mpris.get_default();

  let playerMode = new PlayerMode();

  // TODO: Progress bar and time elapsed/remaining
  return <button onButtonReleaseEvent={(self, event) => {
    if(event.get_button()[1] === Gdk.BUTTON_SECONDARY) {
      playerMode.next();
      return true;
    } else {
      openPopup(PopupType.MediaControls);
      return true;
    }
  }}>
    <box className="media">
      {bind(mpris, "players").as(players => {
        const displayedPlayer = players.filter(p => p.title !== "").sort((a, b) => playerPriority(a) - playerPriority(b))[0];
        if(displayedPlayer) return <box>
          <icon icon="music" />
          {bind(playerMode).as(display => {
            switch(display) {
              case DisplayedPlayerData.SongName:
                return <label label={bind(displayedPlayer, "title").as(String)} />;
              case DisplayedPlayerData.Artist:
                return <label label={bind(displayedPlayer, "artist").as(String)} />;
              case DisplayedPlayerData.Duration:
                return <label label={
                  (mergeBindings([
                    bind(displayedPlayer, "position"),
                    bind(displayedPlayer, "length")
                  ]) as Binding<[number, number]>).as(([pos, len]) => {
                    return pos && len ? `${formatDuration(pos)} / ${formatDuration(len)}` : "";
                  })
                } />;
              case DisplayedPlayerData.Progress:
                return <label label={
                  (mergeBindings([
                    bind(displayedPlayer, "position"),
                    bind(displayedPlayer, "length")
                  ]) as Binding<[number, number]>).as(([pos, len]) => {
                    return pos && len ? `${Math.round(pos / len * 100)}%` : "";
                  })
                } />;
              default:
                return <label label="Unknown" />;
            }
          })}
        </box>;

        else return "Nothing Playing";
      })}
    </box>
  </button>
}


// Right panel

function SystemTray() {
  const tray = Tray.get_default()

  return <box className="systemTray">
    {bind(tray, "items").as(items => items.map(item => {
      if(item.iconThemePath) App.add_icons(item.iconThemePath)
      const menu = item.create_menu();

      return <button
        tooltipMarkup={bind(item, "tooltipMarkup")}
        onDestroy={() => menu?.destroy()}
        onClickRelease={self => {
          menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null)
        }}
        tooltipText={bind(item, "tooltip").as(t => t ? `${t.title}` : "")}>
        <icon gIcon={bind(item, "gicon")} />
      </button>
    }))}
  </box>
}

function ResourceUtilization() {
  const CPUUsage = Variable(0).poll(1000, ["bash", "-c", "top -bn 2 -d 0.01 | grep '^%Cpu' | tail -n 1 | gawk '{print $2+$4+$6}'"], parseFloat);
  const RAMUsage = Variable(0).poll(1000, ["bash", "-c", "free | awk '/Mem:/ {print $3/$2 * 100}'"], parseFloat);   

  return <button onClick={() => execAsync("missioncenter")} tooltipText="Resource Utilization" className="resourceUtilization">
    <box vertical={!COMPACT} valign={Gtk.Align.CENTER} halign={Gtk.Align.START}>
      <box>
        {
          COMPACT ? <icon icon="processor" className="name" />
          : <box className="name">
            <label label={"CPU"} halign={Gtk.Align.START} />
          </box>
        }
        <label label={CPUUsage().as(u => `${u.toFixed(1)}%`)} onDestroy={() => CPUUsage.drop()} hexpand halign={Gtk.Align.START} className="percent" />
      </box>
      <box>
        {
          COMPACT ? <icon icon="memory" className="name" />
          : <box className="name">
            <label label={"RAM"} halign={Gtk.Align.START} />
          </box>
        }
        <label label={RAMUsage().as(u => `${u.toFixed(1)}%`)} onDestroy={() => RAMUsage.drop()} hexpand halign={Gtk.Align.START} className="percent" />
      </box>
    </box>
  </button>
}

function Bluetooth() {
  // TODO: Shortcut to run systemctl --user restart pipewire for bluetooth audio?
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
    <button onClicked={() => execAsync("pavucontrol")}>
      <icon icon={bind(speaker, "volumeIcon").as(icon => icon ?? "audio-volume-low-symbolic")} />
    </button>
    <slider
      hexpand
      onDragged={({ value }) => speaker.volume = value}
      value={bind(speaker, "volume")}
      className="audioSlider"
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
    vertical={!COMPACT}
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
    {!COMPACT && <label
        className="dateLabel"
        label={shortDate()}
      />
    }
  </box>;
}

function ControlsPopupButton() {
  return <button onClicked={() => openPopup(PopupType.ControlsPopup)} className="controlsPopupButton">
    <icon icon="open-menu-symbolic" />
  </button>
}

export default function Bar(gdkmonitor: Gdk.Monitor): Gtk.Window {
  return <window
    className="bar"
    namespace="ags-bar-window"
    gdkmonitor={gdkmonitor}
    layer={Astal.Layer.TOP}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
    application={App}
  >
    <centerbox className={COMPACT ? "compact" : ""}>
      <box hexpand halign={Gtk.Align.START}>
        {/* Left panel */}
        <box className="segment first">
          <NixOSIcon />

          <Workspaces />

          <FocusedClient />
        </box>
      </box>

      <box halign={Gtk.Align.CENTER}>
        {/* Center panel */}

        <box className="segment">
          <Media />
        </box>
      </box>

      <box hexpand halign={Gtk.Align.END}>
        {/* Right panel */}

        <box className="segment">
          <SystemTray />
        </box>

        <box className="segment">
          <ResourceUtilization />
        </box>

        <box className="segment">
          <Bluetooth />
          <Wifi />
          <AudioSlider />
          <BatteryLevel />
        </box>

        <box className="segment last">
          <Time />
          <ControlsPopupButton />
        </box>
      </box>
    </centerbox>
  </window> as Gtk.Window;
}
