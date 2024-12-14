import { bind, Binding, Variable } from "astal";
import { Subscribable } from "astal/binding";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";
import Notifd from "gi://AstalNotifd";
import Notification from "./notifications/Notification";
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
  return <box vertical vexpand={false}>
    <Scrollable maxContentHeight={400} propagateNaturalHeight={true}>
      <box vertical>
        {
          notifications.length > MAX_NOTIFICATIONS
            ? notifications.slice(0, MAX_NOTIFICATIONS).concat([<label label={`And ${notifications.length - MAX_NOTIFICATIONS} more...`} />])
            : notifications
        }
      </box>
    </Scrollable>
    <button onClicked={() => {
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

  return <box vertical>
    {/* TODO: Better battery status? */}
    {/* TODO: More control buttons */}
    
    <Section title={notifications.as(notifs => notifs.length > 0 ? `Notifications (${notifs.length})` : `Notifications`)} className="notifications">
      {notifications.as(notifications =>
        notifications.length > 0 ? NotificationsDisplay(notifd, notifications) : <label label="No notifications" className="empty" />
      )}
    </Section>

    <Section>
      <Calendar />
    </Section>
  </box>;
}