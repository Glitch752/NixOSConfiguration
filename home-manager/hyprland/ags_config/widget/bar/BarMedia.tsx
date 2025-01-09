import { bind, Binding, timeout, Variable } from "astal";
import { formatDuration } from "../../utils";
import { Gdk } from "astal/gtk4";
import { openPopup, PopupType } from "../../popups";
import Mpris from "gi://AstalMpris";
import { Subscribable } from "astal/binding";
import { Widget } from "../Bar";
import { mergeBindings } from "astal/_astal";

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
    if (this.mode === "cycle") {
      let newMode = this.showedMode.get();

      newMode = this.showedMode.get() + 1;
      if (newMode > DisplayedPlayerData.Progress) newMode = DisplayedPlayerData.SongName;

      this.showedMode.set(newMode);
      print(newMode);

      timeout(this.cycleTime, () => this.cycleNext());
    }
  }

  next() {
    // This is pretty hacky...
    if (this.mode === "cycle") {
      this.mode = DisplayedPlayerData.SongName;
      this.showedMode.set(this.mode);
    } else if (this.mode === DisplayedPlayerData.Progress) {
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

export default function Media() {
  const mpris = Mpris.get_default();

  let playerMode = new PlayerMode();

  // TODO: Progress bar and time elapsed/remaining
  return <Widget icon="music" cssClasses={["media"]} onButtonReleased={(self, event) => {
    if (false /* right click */) {
      // TODO: Figure out how to do this with gtk4
      playerMode.next();
      return true;
    } else {
      openPopup(PopupType.MediaControls);
      return true;
    }
  }}>
    {
      bind(mpris, "players").as(players => {
        const displayedPlayer = players.filter(p => p.title !== "").sort((a, b) => playerPriority(a) - playerPriority(b))[0];
        if (displayedPlayer) return <box>
          {bind(playerMode).as(display => {
            switch (display) {
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

        else return <label label="Nothing Playing" />;
      })
    }
  </Widget >
}