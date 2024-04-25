# lit-signal-watcher

Lit mixin to use [signals](https://github.com/tc39/proposal-signals) to read and manage state.

## Installation

```bash
npm install lit-signal-watcher
```

## Usage

Import the `SignalWatcher` mixin and use it to define your base class together with `LitElement`:

```ts
import { LitElement, html } from "lit";
import { Signal } from "signal-polyfill";
import { SignalWatcher } from "lit-signal-watcher";

let signal = new Signal.State(0);

setInterval(() => {
  signal.set(signal.get() + 1);
}, 1000);

@customElement('sample-element')
export class SampleElement extends SignalWatcher(LitElement) { // Note the use of `SignalWatcher`
  render() {
    return html`Count: ${signal.get()}`;
  }
}
```

Every time one of the signals that's read in the `render` function gets updated, the element will request an update, updating the HTML template to reflect the new values for the signals.
