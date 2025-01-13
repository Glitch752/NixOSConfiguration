import { exec, execAsync, Gio, GLib } from "astal";

export function startApplication(cmd: string): Promise<string | void> {
  // HACK: (like, a really big one)
  // Something with astal and gtk4 means launching applications doesn't work because
  // they inherit weird incompatible environment variables.
  // We take hyprland's environment variables from /proc/PPID/environ,
  // manually set each in a new shell that doesn't inherit ours, and then launch
  // the application with uwsm. I'm... not proud of this.

  // Get the PID of hyprland
  const environmentProcess = exec(["pgrep", "hyprland"]).split("\n")[0].trim();

  // Since /proc/[process]/environ is zero-terminated, GLib can't read it correctly.
  // We just use a shell command to convert \0 to \n.
  const parentEnvironment = exec(["bash", "-c", `cat /proc/${environmentProcess}/environ | tr '\\0' '\\n'`]);

  const parentEnvironmentMap = parentEnvironment.split("\n").reduce<Record<string, string>>((acc, line) => {
    const [key, value] = line.split("=");
    acc[key] = value;
    return acc;
  }, {});
  const exportCommands = Object.entries(parentEnvironmentMap).map(([key, value]) => `export ${key}=${GLib.shell_quote(value)}`).join(" && ");

  const process = new Gio.Subprocess({
    argv: [
      // Since inheriting the parent variables breaks most child processes,
      // we need to use our parent's shell environment.
      "env", "-i",
      "bash", "-c",
      `${exportCommands} && uwsm app -- ${cmd}`
    ],
    flags:
      Gio.SubprocessFlags.STDOUT_PIPE |
      Gio.SubprocessFlags.STDERR_PIPE
  });
  process.init(null);

  return new Promise((resolve, reject) => {
    process.communicate_utf8_async(null, null)
      .then(([stdout, stderr]) => {
        if (stderr) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
}

/** An incredibly simple abort signal implementation. */
export class AbortSignal {
  private listeners: (() => void)[] = [];
  public aborted = false;

  listen(listener: () => void) {
    this.listeners.push(listener);
  }

  abort() {
    for (let listener of this.listeners) {
      listener();
    }
    this.aborted = true;
  }
}

Gio._promisify(Gio.Subprocess.prototype, "communicate_utf8_async");
Gio._promisify(Gio.OutputStream.prototype, "write_bytes_async");
Gio._promisify(Gio.DataInputStream.prototype, "read_line_async");
Gio._promisify(Gio.DataInputStream.prototype, "fill_async");
Gio._promisify(Gio.DataInputStream.prototype, "skip_async");

// The Typescript definitions for GLib.Bytes are incorrect; it can accept a string.
// We can't augment the type definition, so this is just a small helper.
const Bytes = (s: string) => new GLib.Bytes(s as any);

/**
 * Execute a command asynchronously, while allowing it to be aborted.
 */
export async function abortableExecAsync(
  args: string[],
  abortSignal: AbortSignal
): Promise<{
  stdout: string;
  stderr: string;
  status: number;
} | null> {
  const cancellable = new Gio.Cancellable();
  abortSignal.listen(() => cancellable.cancel());

  let cancelId = 0;
  let flags = Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE;

  const process = new Gio.Subprocess({ argv: args, flags });
  process.init(cancellable);

  if (cancellable instanceof Gio.Cancellable)
    cancelId = cancellable.connect(() => process.force_exit());

  try {
    const [stdout, stderr] = await process.communicate_utf8_async(
      null,
      cancellable
    );
    const status = process.get_exit_status();

    return { stdout, stderr, status };
  } catch (e) {
    if (!(e instanceof GLib.Error) || e.code !== Gio.IOErrorEnum.CANCELLED)
      print(`Error executing command ${args.join(" ")}: ${e}`);
    return null;
  } finally {
    if (cancelId > 0) cancellable.disconnect(cancelId);
  }
}

class AsyncMutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async lock() {
    if (this.locked) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    } else {
      this.locked = true;
    }
  }

  unlock() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift()!;
      resolve();
    } else {
      this.locked = false;
    }
  }
}

export class StdIOSocketProcess {
  private process: Gio.Subprocess;
  private stdin: Gio.OutputStream;
  private stdout: Gio.DataInputStream;
  private stderr: Gio.DataInputStream;
  private lock = new AsyncMutex();

  constructor(args: string[]) {
    this.process = new Gio.Subprocess({
      argv: args,
      flags:
        Gio.SubprocessFlags.STDIN_PIPE |
        Gio.SubprocessFlags.STDOUT_PIPE |
        Gio.SubprocessFlags.STDERR_PIPE,
    });
    this.process.init(null);

    this.stdin = this.process.get_stdin_pipe()!;
    this.stdout = new Gio.DataInputStream({
      baseStream: this.process.get_stdout_pipe()!,
      closeBaseStream: true,
    });
    this.stderr = new Gio.DataInputStream({
      baseStream: this.process.get_stderr_pipe()!,
      closeBaseStream: true,
    });
  }

  async write_stdin_async(data: string, cancellable: Gio.Cancellable) {
    try {
      await this.stdin.write_bytes_async(
        Bytes(`${data}\n`),
        GLib.PRIORITY_DEFAULT,
        cancellable
      );
    } catch (e) {
      if (!(e instanceof GLib.Error) || e.code !== Gio.IOErrorEnum.CANCELLED)
        print(`Error writing to stdin: ${e}`);
    }
  }

  private activeRead: Gio.Cancellable | null = null;

  async sendAsync(data: string): Promise<string | null> {
    await this.lock.lock();

    try {
      if (this.activeRead) {
        this.activeRead.cancel();
        this.activeRead = null;
      }

      const cancellable = new Gio.Cancellable();
      this.activeRead = cancellable;

      // Clear the stdout buffer
      if (this.stdout.get_available() > 0) {
        await this.stdout.skip_async(
          this.stdout.get_available(),
          GLib.PRIORITY_DEFAULT,
          cancellable
        );
        if (cancellable.is_cancelled()) return null;
      }

      await this.write_stdin_async(data, cancellable);
      if (cancellable.is_cancelled()) return null;
      // const stdout = await this.read_stdout_line_async();

      await this.stdout.fill_async(-1, GLib.PRIORITY_DEFAULT, cancellable);
      if (cancellable.is_cancelled()) return null;

      const bytes = this.stdout.peek_buffer();
      const text = new TextDecoder().decode(bytes);

      const [lineBytes] = await this.stdout.read_line_async(
        GLib.PRIORITY_DEFAULT,
        cancellable
      );
      if (cancellable.is_cancelled()) return null;
      if (!lineBytes) return null;

      const line = new TextDecoder().decode(lineBytes);

      return line;
    } finally {
      this.lock.unlock();
    }
  }

  close() {
    this.process.force_exit();
  }
}