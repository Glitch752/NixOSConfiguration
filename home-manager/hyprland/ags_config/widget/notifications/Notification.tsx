import { GLib } from "astal";
import { Gtk, Astal } from "astal/gtk4";
import Notifd from "gi://AstalNotifd";
import Pango from "gi://Pango?version=1.0";

const fileExists = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS);
const formatTime = (time: number, format = "%l:%M:%S %p") => GLib.DateTime.new_from_unix_local(time).format(format)!;

function getUrgencyClass(n: Notifd.Notification) {
  const { LOW, NORMAL, CRITICAL } = Notifd.Urgency;
  switch (n.urgency) {
    case LOW:
      return "low";
    case CRITICAL:
      return "critical";
    case NORMAL:
    default:
      return "normal";
  }
};

type Props = {
  setup?(self: Astal.Box): void;
  onHoverLost?(self: Astal.Box): void;
  notification: Notifd.Notification;
};

export default function Notification(props: Props) {
  const { notification: n, onHoverLost, setup } = props;
  const { START, CENTER, END } = Gtk.Align;

  return (
    <box
      vertical
      cssClasses={["notification", getUrgencyClass(n)]}
      setup={setup ?? (() => { })}
      onHoverLeave={onHoverLost ?? (() => { })}
    >
      <box cssClasses={["header"]}>
        {(n.appIcon || n.desktopEntry) && (
          <image
            cssClasses={["app-icon"]}
            visible={Boolean(n.appIcon || n.desktopEntry)}
            iconName={n.appIcon || n.desktopEntry}
          />
        )}
        <label
          cssClasses={["app-name"]}
          halign={START}
          ellipsize={Pango.EllipsizeMode.END}
          label={n.appName || "Unknown"}
        />
        <label cssClasses={["time"]} hexpand halign={END} label={formatTime(n.time)} />
        <button onClicked={() => n.dismiss()}>
          <image iconName="window-close-symbolic" />
        </button>
      </box>

      <Gtk.Separator visible />

      <box cssClasses={["content"]}>
        {n.image && fileExists(n.image) && (
          <image
            valign={START}
            cssClasses={["image"]}
            file={n.image}
          />
        )}
        {n.image && (
          <box valign={START} cssClasses={["icon-image"]}>
            <image iconName={n.image} vexpand hexpand halign={CENTER} valign={CENTER} />
          </box>
        )}
        <box vertical>
          <label
            cssClasses={["summary"]}
            halign={START}
            xalign={0}
            label={n.summary}
            ellipsize={Pango.EllipsizeMode.END}
          />
          {n.body && (
            <label
              cssClasses={["body"]}
              wrap
              useMarkup
              halign={START}
              xalign={0}
              justify={Gtk.Justification.FILL}
              label={n.body}
            />
          )}
        </box>
      </box>

      {n.get_actions().length > 0 && (
        <box cssClasses={["actions"]}>
          {n.get_actions().map(({ label, id }) => (
            <button hexpand onClicked={() => n.invoke(id)}>
              <label label={label} halign={CENTER} hexpand />
            </button>
          ))}
        </box>
      ) || null as any}
    </box>
  );
}
