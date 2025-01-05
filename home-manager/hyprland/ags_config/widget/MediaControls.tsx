import { bind, Gio, GLib } from "astal";
import { Astal, Gdk, Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango?version=1.0";
import { formatDuration } from "../utils";
import cairo from "cairo";
import { DrawBackgroundContext } from "../popups";

export default function MediaControls() {
  const mpris = Mpris.get_default();
  const players = bind(mpris, "players").as((p) => p.filter((player) => player.title !== ""));

  return (
    <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.START}>
      {/* <AudioControls /> */}
      {players.as((arr) => arr.map((player) => <MediaPlayer player={player} />))}
      {players.as((arr) => arr.length === 0 && (<label className="noMediaPlayers" label="No media players found" />))}
    </box>
  );
}

// Make read_bytes_async use promises
Gio._promisify(Gio.InputStream.prototype, "read_bytes_async");

export function drawMediaControlsBackground(): DrawBackgroundContext {
  const BARS = 100;
  const FRAMERATE = 60; // TODO: Configure this based on the refresh rate of the monitor

  const config = `
## Configuration file for CAVA.
# Remove the ; to change parameters.


[general]

# Accepts only non-negative values.
framerate = ${FRAMERATE}

# 'autosens' will attempt to decrease sensitivity if the bars peak. 1 = on, 0 = off
# new as of 0.6.0 autosens of low values (dynamic range)
# 'overshoot' allows bars to overshoot (in % of terminal height) without initiating autosens. DEPRECATED as of 0.6.0
autosens = 1
; overshoot = 20

# Manual sensitivity in %. If autosens is enabled, this will only be the initial value.
# 200 means double height. Accepts only non-negative values.
; sensitivity = 100

# The number of bars (0-512). 0 sets it to auto (fill up console).
# Bars' width and space between bars in number of characters.
bars = ${BARS}

# Lower and higher cutoff frequencies for lowest and highest bars
# the bandwidth of the visualizer.
# Note: there is a minimum total bandwidth of 43Mhz x number of bars.
# Cava will automatically increase the higher cutoff if a too low band is specified.
; lower_cutoff_freq = 50
; higher_cutoff_freq = 10000

# Seconds with no input before cava goes to sleep mode. Cava will not perform FFT or drawing and
# only check for input once per second. Cava will wake up once input is detected. 0 = disable.
; sleep_timer = 0

[input]
# Audio capturing method. Possible methods are: 'fifo', 'portaudio', 'pipewire', 'alsa', 'pulse', 'sndio', 'oss', 'jack' or 'shmem'
# Defaults to 'oss', 'pipewire', 'sndio', 'jack', 'pulse', 'alsa', 'portaudio' or 'fifo', in that order, dependent on what support cava was built with.
# On Mac it defaults to 'portaudio' or 'fifo'
# On windows this is automatic and no input settings are needed.
#
# All input methods uses the same config variable 'source'
# to define where it should get the audio.
#
# For pulseaudio and pipewire 'source' will be the source. Default: 'auto', which uses the monitor source of the default sink
# (all pulseaudio sinks(outputs) have 'monitor' sources(inputs) associated with them).
#
# For pipewire 'source' will be the object name or object.serial of the device to capture from.
# Both input and output devices are supported.
#
# For alsa 'source' will be the capture device.
# For fifo 'source' will be the path to fifo-file.
# For shmem 'source' will be /squeezelite-AA:BB:CC:DD:EE:FF where 'AA:BB:CC:DD:EE:FF' will be squeezelite's MAC address
#
# For sndio 'source' will be a raw recording audio descriptor or a monitoring sub-device, e.g. 'rsnd/2' or 'snd/1'. Default: 'default'.
# README.md contains further information on how to setup CAVA for sndio.
#
# For oss 'source' will be the path to a audio device, e.g. '/dev/dsp2'. Default: '/dev/dsp', i.e. the default audio device.
# README.md contains further information on how to setup CAVA for OSS on FreeBSD.
#
# For jack 'source' will be the name of the JACK server to connect to, e.g. 'foobar'. Default: 'default'.
# README.md contains further information on how to setup CAVA for JACK.
#
; method = pulse
; source = auto

; method = pipewire
; source = auto

; method = alsa
; source = hw:Loopback,1

; method = fifo
; source = /tmp/mpd.fifo

; method = shmem
; source = /squeezelite-AA:BB:CC:DD:EE:FF

; method = portaudio
; source = auto

; method = sndio
; source = default

; method = oss
; source = /dev/dsp

; method = jack
; source = default

# The options 'sample_rate', 'sample_bits', 'channels' and 'autoconnect' can be configured for some input methods:
#   sample_rate: fifo, pipewire, sndio, oss
#   sample_bits: fifo, pipewire, sndio, oss
#   channels:    sndio, oss, jack
#   autoconnect: jack
# Other methods ignore these settings.
#
# For 'sndio' and 'oss' they are only preferred values, i.e. if the values are not supported
# by the chosen audio device, the device will use other supported values instead.
# Example: 48000, 32 and 2, but the device only supports 44100, 16 and 1, then it
# will use 44100, 16 and 1.
#
; sample_rate = 44100
; sample_bits = 16
; channels = 2
; autoconnect = 2

[output]
# Output method. Can be 'ncurses', 'noncurses', 'raw', 'noritake', 'sdl'
# or 'sdl_glsl'.
# 'noncurses' (default) uses a buffer and cursor movements to only print
# changes from frame to frame in the terminal. Uses less resources and is less
# prone to tearing (vsync issues) than 'ncurses'.
#
# 'raw' is an 8 or 16 bit (configurable via the 'bit_format' option) data
# stream of the bar heights that can be used to send to other applications.
# 'raw' defaults to 200 bars, which can be adjusted in the 'bars' option above.
#
# 'noritake' outputs a bitmap in the format expected by a Noritake VFD display
#  in graphic mode. It only support the 3000 series graphical VFDs for now.
#
# 'sdl' uses the Simple DirectMedia Layer to render in a graphical context.
# 'sdl_glsl' uses SDL to create an OpenGL context. Write your own shaders or
# use one of the predefined ones.
method = raw

# Visual channels. Can be 'stereo' or 'mono'.
# 'stereo' mirrors both channels with low frequencies in center.
# 'mono' outputs left to right lowest to highest frequencies.
# 'mono_option' set mono to either take input from 'left', 'right' or 'average'.
# set 'reverse' to 1 to display frequencies the other way around.
; channels = stereo
; mono_option = average
; reverse = 0

# Raw output target. A fifo will be created if target does not exist.
raw_target = /dev/stdout

# Raw data format. Can be 'binary' or 'ascii'.
data_format = binary

# Binary bit format, can be '8bit' (0-255) or '16bit' (0-65530).
bit_format = 16bit

# Ascii max value. In 'ascii' mode range will run from 0 to value specified here
; ascii_max_range = 1000

# Ascii delimiters. In ascii format each bar and frame is separated by a delimiters.
# Use decimal value in ascii table (i.e. 59 = ';' and 10 = '\\n' (line feed)).
; bar_delimiter = 59
; frame_delimiter = 10

[smoothing]
# Disables or enables the so-called "Monstercat smoothing" with or without "waves". Set to 0 to disable.
; monstercat = 0
; waves = 0

# Noise reduction, int 0 - 100. default 77
# the raw visualization is very noisy, this factor adjusts the integral and gravity filters to keep the signal smooth
# 100 will be very slow and smooth, 0 will be fast but noisy.
noise_reduction = 70


[eq]
# This one is tricky. You can have as much keys as you want.
# Remember to uncomment more than one key! More keys = more precision.
# Look at readme.md on github for further explanations and examples.
1 = 1 # bass
2 = 1
3 = 1 # midtone
4 = 1
5 = 1 # treble`;

  // Write a cava configuration to /tmp/bg_cava.conf
  const file = Gio.File.new_for_path("/tmp/bg_cava.conf");
  file.replace_contents(config, null, false, Gio.FileCreateFlags.NONE, null);

  // Create a subprocess to run cava with the configuration file
  const subprocess = Gio.Subprocess.new(
    ["cava", "-p", "/tmp/bg_cava.conf"],
    Gio.SubprocessFlags.STDOUT_PIPE
  );
  subprocess.init(null);

  const stdout = subprocess.get_stdout_pipe() as Gio.InputStream;
  if(!stdout) throw new Error("Failed to get stdout pipe");

  let lastFrame: Uint16Array = new Uint16Array(BARS);
  let queueDraw: () => void = () => {};

  const asyncIterator = stdout.createAsyncIterator(BARS * 2, GLib.PRIORITY_DEFAULT);
  (async () => {
    let currentChunk: Uint16Array = new Uint16Array(); // Stores chunks that aren't sent in full
    for await(const chunk of asyncIterator) {
      const frame = new Uint16Array(chunk.toArray().buffer);
      currentChunk = new Uint16Array([...currentChunk, ...frame]);

      if(currentChunk.length < BARS) continue;

      lastFrame = currentChunk.slice(0, BARS);
      currentChunk = currentChunk.slice(BARS);
      queueDraw();
    }
  })();
  
  // https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
  
  function hueToRgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }

  function hslToRgb(h: number, s: number, l: number) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // Achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1/3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1/3);
    }

    return [r, g, b];
  }

  return {
    onRealize: (self) => {
      queueDraw = self.queue_draw.bind(self);
    },
    onDraw: (self, cr) => {
      const { width, height } = self.get_allocated_size()[0];

      // Draw the bars
      const BAR_MARGIN = 5;
      const BAR_WIDTH = (width - BAR_MARGIN * BARS) / BARS;
      
      for(let i = 0; i < BARS; i++) {
        const barHeight = lastFrame[i] / 65535 * height * 0.7;
        const barX = i * (BAR_WIDTH + BAR_MARGIN) + BAR_MARGIN / 2;
        const barY = height - barHeight - BAR_MARGIN / 2;

        const [r, g, b] = hslToRgb(i / BARS, 1, 0.5);
        cr.setSourceRGBA(r, g, b, 0.3);
        cr.rectangle(barX, barY, BAR_WIDTH, barHeight);
        cr.fill();
      }
    },
    onDestroy: (self) => {
      subprocess.force_exit();
      file.delete(null);
      console.log("Cava subprocess exited");
    },
  }
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
