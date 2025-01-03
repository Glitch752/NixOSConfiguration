import { bind, Binding, Variable } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import Notification from "./notifications/Notification";
import Notifd from "gi://AstalNotifd";
import { Scrollable } from "astal/gtk3/widget";
import Calendar from "./calendar/Calendar";

function Section({ child, children, title, className }: {
  child?: JSX.Element | Binding<JSX.Element> | Binding<Array<JSX.Element>>
  children?: Array<JSX.Element> | Binding<Array<JSX.Element>>,
  title?: string | Binding<string>,
  className?: string,
}) {
  return <box vertical className={`section ${className}`}>
    {title ? <label label={title} className="title" /> : null}
    {child}
    {children}
  </box>;
}

const MAX_NOTIFICATIONS = Infinity;

function NotificationsDisplay(notifd: Notifd.Notifd, notifications: Gtk.Widget[]) {
  return <box vertical>
    <Scrollable maxContentHeight={400} propagateNaturalHeight={true}>
      <box vertical>
        {
          notifications.length > MAX_NOTIFICATIONS
            ? notifications.slice(0, MAX_NOTIFICATIONS).concat([<label label={`And ${notifications.length - MAX_NOTIFICATIONS} more...`} />])
            : notifications
        }
      </box>
    </Scrollable>
    <button className="dismissButton" onClicked={() => {
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
    <Section className="dateTime">
      {/* TODO: Fancy animated time? Could be cool. */}
      <label label={bind(time)} className="time" />
      <label label={bind(date)} className="date" />
    </Section>

    <Section title="Quick settings">
      {/* TODO */}
    </Section>

    <Section title={notifications.as(notifs => notifs.length > 0 ? `Notifications (${notifs.length})` : `Notifications`)} className="notifications">
      {notifications.as(notifications =>
        notifications.length > 0 ? NotificationsDisplay(notifd, notifications) : <label label="No notifications" className="empty" />
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