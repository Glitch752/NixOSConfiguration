import { bind, Gio, GLib } from "astal";
import { Astal, Gdk, Gtk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import Cava from "gi://AstalCava";
import Pango from "gi://Pango?version=1.0";
import { formatDuration } from "../utils";
import { DrawBackgroundContext } from "../popups";

export default function MediaControls() {
  const mpris = Mpris.get_default();
  const players = bind(mpris, "players").as((p) => p.filter((player) => player.title !== ""));

  return (
    <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.START}>
      {/* <AudioControls /> */}
      {players.as((arr) => {
        if (arr.length === 0) return <label cssClasses={["noMediaPlayers"]} label="No media players found" />;
        return arr.map((player) => <MediaPlayer player={player} />)
      })}
    </box>
  );
}

// Make read_bytes_async use promises
Gio._promisify(Gio.InputStream.prototype, "read_bytes_async");

export function drawMediaControlsBackground(): DrawBackgroundContext {
  const cava = Cava.get_default();
  if (!cava) {
    return {
      onRealize: () => { },
      onDraw: () => { },
      onDestroy: () => { },
    };
  }

  const BARS = 100;

  let lastFrame: number[] = new Array(BARS).fill(0);
  let queueDraw: () => void;

  cava.set_bars(BARS);
  cava.set_autosens(true);
  cava.set_framerate(160); // TODO: Make this configurable
  cava.set_noise_reduction(0.7);

  const callbackID = cava.connect("notify::values", () => {
    lastFrame = cava.get_values();
    queueDraw();
  });

  // https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion

  function hueToRgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function hslToRgb(h: number, s: number, l: number) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // Achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
  }

  return {
    onRealize: (self) => {
      queueDraw = self.queue_draw.bind(self);
    },
    onDraw: (self, cr) => {
      const width = self.get_allocated_width();
      const height = self.get_allocated_height();

      // Draw the bars
      const BAR_MARGIN = 5;
      const BAR_WIDTH = (width - BAR_MARGIN * BARS) / BARS;

      for (let i = 0; i < BARS; i++) {
        const barHeight = lastFrame[i] * height * 0.7;
        const barX = i * (BAR_WIDTH + BAR_MARGIN) + BAR_MARGIN / 2;
        const barY = height - barHeight - BAR_MARGIN / 2;

        const [r, g, b] = hslToRgb(i / BARS, 1, 0.5);
        cr.setSourceRGBA(r, g, b, 0.3);
        cr.rectangle(barX, barY, BAR_WIDTH, barHeight);
        cr.fill();
      }
    },
    onDestroy: (self) => {
      cava.disconnect(callbackID);
    },
  }
}

function MediaPlayer({ player }: { player: Mpris.Player }) {
  const title = bind(player, "title").as((t) => t || "Unknown Track");
  const artist = bind(player, "artist").as((a) => a || "Unknown Artist");
  const coverArt = bind(player, "coverArt");
  const playerIcon = bind(player, "entry").as((e) => e ? e : null);
  const position = bind(player, "position").as((p) => player.length > 0 ? p / player.length : 0);
  const playIcon = bind(player, "playbackStatus").as((s) => s === Mpris.PlaybackStatus.PLAYING ? "media-playback-pause-symbolic" : "media-playback-start-symbolic");
  const canQuit = bind(player, "canQuit");

  return (
    <box cssClasses={["player"]}>
      <box vertical cssClasses={["sideIcons"]} valign={Gtk.Align.CENTER}>
        <button cssClasses={canQuit.as((q) => [q ? "" : "noQuit", "quitPlayer"])} onClicked={() => player.quit()}>
          <image iconName="window-close-symbolic" />
        </button>
        <image cssClasses={["playerIcon"]} iconName={playerIcon.as(p => p ? p : "")} visible={playerIcon.as(p => p !== null)} />
      </box>
      <image cssClasses={["cover-art"]} file={coverArt} />
      <box vertical>
        <label cssClasses={["title"]} wrap wrapMode={Pango.WrapMode.WORD} hexpand halign={Gtk.Align.START} label={title} />
        <label halign={Gtk.Align.START} valign={Gtk.Align.START} vexpand wrap label={artist} />
        <slider cssClasses={["progress"]} visible={bind(player, "length").as((l) => l > 0)} onChangeValue={({ value }) => (player.position = value * player.length)} value={position} />
        <centerbox cssClasses={["actions"]}>
          <label hexpand cssClasses={["position"]} halign={Gtk.Align.START} visible={bind(player, "length").as((l) => l > 0)} label={bind(player, "position").as(formatDuration)} />
          <box>
            <button onClicked={() => player.previous()} visible={bind(player, "canGoPrevious")}>
              <image iconName="media-skip-backward-symbolic" />
            </button>
            <button onClicked={() => player.play_pause()} visible={bind(player, "canControl")}>
              <image iconName={playIcon} />
            </button>
            <button onClicked={() => player.next()} visible={bind(player, "canGoNext")}>
              <image iconName="media-skip-forward-symbolic" />
            </button>
          </box>
          <label cssClasses={["length"]} hexpand halign={Gtk.Align.END} visible={bind(player, "length").as((l) => l > 0)} label={bind(player, "length").as((l) => l > 0 ? formatDuration(l) : "0:00")} />
        </centerbox>
      </box>
    </box>
  );
}
