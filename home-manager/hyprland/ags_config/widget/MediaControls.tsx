import { bind } from "astal";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango?version=1.0";
import { formatDuration } from "../utils";

export default function MediaControls() {
  const mpris = Mpris.get_default();
  const players = bind(mpris, "players").as((p) => p.filter((player) => player.title !== ""));

  return (
    <box vertical>
      {/* <AudioControls /> */}
      {players.as((arr) => arr.map((player) => <MediaPlayer player={player} />))}
      {players.as((arr) => arr.length === 0 && (<label className="noMediaPlayers" label="No media players found" />))}
    </box>
  );
}

function MediaPlayer({ player }: { player: Mpris.Player }) {
  const title = bind(player, "title").as((t) => t || "Unknown Track");
  const artist = bind(player, "artist").as((a) => a || "Unknown Artist");
  const coverArt = bind(player, "coverArt").as((c) => `background-image: url('${c}')`);
  const playerIcon = bind(player, "entry").as((e) => Astal.Icon.lookup_icon(String(e)) ? e : "audio-x-generic-symbolic");
  const position = bind(player, "position").as((p) => player.length > 0 ? p / player.length : 0);
  const playIcon = bind(player, "playbackStatus").as((s) => s === Mpris.PlaybackStatus.PLAYING ? "media-playback-pause-symbolic" : "media-playback-start-symbolic");
  const canQuit = bind(player, "canQuit");

  return (
    <box className="player">
      <box vertical className="sideIcons" valign={Gtk.Align.CENTER}>
        <button className={canQuit.as((q) => `${q ? "" : "noQuit"} quitPlayer`)} onClicked={() => player.quit()}>
          <icon icon="window-close-symbolic" />
        </button>
        <icon className="playerIcon" icon={playerIcon} />
      </box>
      <box className="cover-art" css={coverArt} />
      <box vertical>
        <label className="title" wrap wrapMode={Pango.WrapMode.WORD} hexpand halign={Gtk.Align.START} label={title} />
        <label halign={Gtk.Align.START} valign={Gtk.Align.START} vexpand wrap label={artist} />
        <slider className="progress" visible={bind(player, "length").as((l) => l > 0)} onDragged={({ value }) => (player.position = value * player.length)} value={position} />
        <centerbox className="actions">
          <label hexpand className="position" halign={Gtk.Align.START} visible={bind(player, "length").as((l) => l > 0)} label={bind(player, "position").as(formatDuration)} />
          <box>
            <button onClicked={() => player.previous()} visible={bind(player, "canGoPrevious")}>
              <icon icon="media-skip-backward-symbolic" />
            </button>
            <button onClicked={() => player.play_pause()} visible={bind(player, "canControl")}>
              <icon icon={playIcon} />
            </button>
            <button onClicked={() => player.next()} visible={bind(player, "canGoNext")}>
              <icon icon="media-skip-forward-symbolic" />
            </button>
          </box>
          <label className="length" hexpand halign={Gtk.Align.END} visible={bind(player, "length").as((l) => l > 0)} label={bind(player, "length").as((l) => l > 0 ? formatDuration(l) : "0:00" )} />
        </centerbox>
      </box>
    </box>
  );
}
