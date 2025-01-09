import { bind, Binding, Variable } from "astal";
import { Gtk } from "astal/gtk4";
import Notification from "./notifications/Notification";
import Notifd from "gi://AstalNotifd";
import { Calendar } from "./calendar/Calendar";
import { ScrolledWindow } from "./launcher/RunPopup";

// TODO: Power profile switcher

function Section({ child, children, title, cssClasses }: {
  child?: JSX.Element | Binding<JSX.Element> | Binding<Array<JSX.Element>>
  children?: Array<JSX.Element> | Binding<Array<JSX.Element>>,
  title?: string | Binding<string>,
  cssClasses?: string[],
}) {
  return <box vertical cssClasses={["section", ...cssClasses ?? []]}>
    {title ? <label label={title} cssClasses={["title"]} /> : null as any}
    {child ?? null as any}
    {children ?? null as any}
  </box>;
}

const MAX_NOTIFICATIONS = Infinity;

function NotificationsDisplay(notifd: Notifd.Notifd, notifications: Gtk.Widget[]) {
  return <box vertical>
    <ScrolledWindow maxContentHeight={400} propagateNaturalHeight={true}>
      <box vertical>
        {
          notifications.length > MAX_NOTIFICATIONS
            ? notifications.slice(0, MAX_NOTIFICATIONS).concat([<label label={`And ${notifications.length - MAX_NOTIFICATIONS} more...`} />])
            : notifications
        }
      </box>
    </ScrolledWindow>
    <button cssClasses={["dismissButton"]} onClicked={() => {
      notifd.get_notifications().forEach(notif => notif.dismiss());
    }}>Dismiss all</button>
  </box>;
}

export default function ControlsPopup() {
  const notifd = Notifd.get_default();
  const notifications = bind(notifd, "notifications").as(notifications => notifications
    .sort((a, b) => a.time - b.time)
    .map(notif => Notification({ notification: notif }))
  );

  const time = Variable("").poll(1000, 'date "+%l:%M:%S %p"');
  const date = Variable("").poll(1000, 'date "+%A, %B %e"');

  return <box vertical valign={Gtk.Align.START}>
    <Section cssClasses={["dateTime"]}>
      {/* TODO: Fancy animated time? Could be cool. */}
      <label label={bind(time)} cssClasses={["time"]} />
      <label label={bind(date)} cssClasses={["date"]} />
    </Section>

    <Section title="Quick settings">
      {/* TODO */}
    </Section>

    <Section title={notifications.as(notifs => notifs.length > 0 ? `Notifications (${notifs.length})` : `Notifications`)} cssClasses={["notifications"]}>
      {notifications.as(notifications =>
        notifications.length > 0 ? NotificationsDisplay(notifd, notifications) : <label label="No notifications" cssClasses={["empty"]} />
      )}
    </Section>

    <Section>
      {/* Please forgive me for this incredibly hacky centering solution */}
      <centerbox>
        <box></box>
        <Calendar />
        <box></box>
      </centerbox>
    </Section>
  </box>;
}