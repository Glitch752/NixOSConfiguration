import { bind, Binding, Variable } from "astal";
import { Subscribable } from "astal/binding";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";
import Notifd from "gi://AstalNotifd";
import Notification from "./notifications/Notification";
import { Scrollable } from "astal/gtk3/widget";

function Section({ child, children, title, className }: {
  child?: JSX.Element | Binding<JSX.Element> | Binding<Array<JSX.Element>>
  children?: Array<JSX.Element> | Binding<Array<JSX.Element>>,
  title: string | Binding<string>,
  className?: string,
}) {
  return <box vertical className={`section ${className}`}>
    <label label={title} className="title" />
    {child}
    {children}
  </box>;
}

const MAX_NOTIFICATIONS = Infinity;

export default function ControlsPopup() {
  const notifd = Notifd.get_default();
  const notifications = bind(notifd, "notifications");

  return <box vertical>
    <Section title={notifications.as(notifs => notifs.length > 0 ? `Notifications (${notifs.length})` : `Notifications`)} className="notifications">
    {notifications.as(notifications =>
      notifications.length > 0 ? <box vertical vexpand={false}>
        <Scrollable minContentHeight={300}>
          <box vertical vexpand>
            {notifications.length > MAX_NOTIFICATIONS ? notifications.map(notif => Notification({ notification: notif })).slice(0, MAX_NOTIFICATIONS).concat([
              <label label={`And ${notifications.length - MAX_NOTIFICATIONS} more...`} />,
            ]) : notifications.map(notif => Notification({ notification: notif }))}
          </box>
        </Scrollable>
        <button onClicked={() => {
          notifd.get_notifications().forEach(notif => notif.dismiss());
        }}>Dismiss all</button>
      </box>
      : <label label="No notifications" className="empty" />
    )}
    </Section>
    <Section title="Calendar">
      <label label="TODO" />
    </Section>
    <box vertical vexpand />
    {/* TODO: Notifications */}
    {/* TODO: Better battery status? */}
    {/* TODO: More control buttons */}
  </box>;
}