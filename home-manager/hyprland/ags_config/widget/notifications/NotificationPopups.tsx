import { Astal, Gtk, Gdk } from "astal/gtk4";
import Notifd from "gi://AstalNotifd";
import Notification from "./Notification";
import { type Subscribable } from "astal/binding";
import { Variable, bind, timeout } from "astal";

// TODO: Notifications were completely broken by our gtk4 migration

/*
 * For reference, you can use `notify-send --action 'wow=Test' --action 'test2=Test 2' 'This is a notification!' 'This is the body of the notification.'` to test notifications.
 */

const TIMEOUT_DELAY = 5000;

/**
 * This class lets us use a map from notification ID to widget instead of an array, which makes it easier to manage.
 */
class NotifiationMap implements Subscribable {
  /**
   * The map from notification ID to widget.
   */
  private widgetMap: Map<number, Gtk.Widget> = new Map();
  /**
   * We still use a regular array to store the widgets internally so it can manage subscribers for us.
   */
  private widgets: Variable<Array<Gtk.Widget>> = Variable([]);

  /**
   * Create a new instance of the notification map.
   */
  constructor() {
    const notifd = Notifd.get_default();

    /**
     * Uncomment this if you want to ignore timeout by senders and
     * enforce a custom timeout. Note that if the notification has any actions,
     * they might not work because the sender already treats them as resolved.
     */
    // notifd.ignoreTimeout = true;

    notifd.connect("notified", (_, id) => {
      this.set(
        id,
        Notification({
          notification: notifd.get_notification(id)!,

          // /**
          //  * When the user finishes hovering over the notification, we can remove it.
          //  * @returns 
          //  */
          // onHoverLost: () => this.delete(id),

          /**
           * By default, notifd doesn't close notifications until user input or the timeout specified by the sender.
           */
          setup: () => timeout(TIMEOUT_DELAY, () => {
            // Hide the notification after the timeout, but don't remove it.
            this.delete(id);
          }),
        })
      );
    });

    // Notifications can be closed by the outside before any user input
    notifd.connect("resolved", (_, id) => {
      this.delete(id);
    });
  }

  /**
   * Runs when our state changes to notify subscribers that the list of widgets has changed.
   */
  private notifiy() {
    this.widgets.set([...this.widgetMap.values()].reverse());
  }

  /**
   * Replace the widget for a notification ID.
   * @param key The notification ID.
   * @param value The new widget.
   */
  private set(key: number, value: Gtk.Widget) {
    // In case of replacecment, destroy the previous widget.
    this.widgetMap.set(key, value);
    this.notifiy();
  }

  /**
   * Delete a widget for a notification ID.
   * @param key The notification ID
   */
  private delete(key: number) {
    this.widgetMap.delete(key);
    this.notifiy();
  }

  /**
   * Get the list of widgets.
   */
  public get() {
    return this.widgets.get();
  }

  /**
   * Subscribe to changes in the list of widgets.
   * @param callback The callback to run when the list of widgets changes.
   */
  public subscribe(callback: (list: Array<Gtk.Widget>) => void) {
    return this.widgets.subscribe(callback);
  }
}

export default function NotificationPopups(gdkmonitor: Gdk.Monitor): Gtk.Window {
  const { TOP, RIGHT } = Astal.WindowAnchor;
  const notifs = new NotifiationMap();

  return <window
    cssClasses={["notificationPopups"]}
    namespace="ags-notifications"
    gdkmonitor={gdkmonitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={TOP | RIGHT}
  >
    <box vertical>{bind(notifs)}</box>
  </window> as Gtk.Window;
}
