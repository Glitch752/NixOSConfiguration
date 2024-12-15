import { bind, Binding } from "astal";
import { mergeBindings } from "astal/gtk3/astalify";
import Wp from "gi://AstalWp";
import { limitLength } from "../utils";
import { Gdk } from "astal/gtk3";

function EndpointControl({ endpoint }: { endpoint: Wp.Endpoint }) {
  const nameBinding =
    (mergeBindings([bind(endpoint, "name"), bind(endpoint, "description")]) as Binding<[string, string]>)
    .as(([name, description]) => !name || name === "" ? limitLength(description, 20) : name);

  return <centerbox tooltipText={bind(endpoint, "description")} className="endpointControl">
    <icon icon={bind(endpoint, "icon")} />
    <label label={nameBinding} />
    <slider
      onDragged={({ value }) => endpoint.volume = value}
      onButtonReleaseEvent={(self, event) => {
        if(event.get_button()[1] === Gdk.BUTTON_SECONDARY) {
          endpoint.mute = !endpoint.mute;
          return true;
        } else if(event.get_button()[1] === Gdk.BUTTON_MIDDLE) {
          endpoint.volume = 1;
          return true;
        } else if(event.get_button()[1] === Gdk.BUTTON_PRIMARY) {
          // Play a sound to test the volume
          
        }
      }}
      value={bind(endpoint, "volume")}
    />
  </centerbox>;
}

export default function AudioControls() {
  const wp = Wp.get_default();
  if(!wp) return null;

  const speakers = bind(wp.audio, "speakers");
  const microphones = bind(wp.audio, "microphones");

  // TODO:
  // - Put behind a collapsible box
  // - Separate playback, recording, outputs, inputs, and other into tabs
  // - List audio controllers and allow selecting profiles
  // - Allow editing channels individually for endpoints
  // - Add input/output level meters
  // - Allow muting and unmuting endpoints
  // - Allow setting volume to over 100% for endpoints
  // - Display output level in decibels as well as percentage

  // ...(basically just copy the main features of pavucontrol lol)
  
  return (
    <box vertical className="audioControls">
      <label label="Speakers" />
      {speakers.as((arr) => arr.map((speaker) => <EndpointControl endpoint={speaker} />))}
      <label label="Microphones" />
      {microphones.as((arr) => arr.map((microphone) => <EndpointControl endpoint={microphone} />))}
    </box>
  );
}