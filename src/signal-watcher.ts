/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/** Based on https://github.com/lit/lit/blob/aa4fc3eff349b202861e597ef7554934b9eaa19a/packages/labs/preact-signals/src/lib/signal-watcher.ts */
import type { ReactiveElement } from "lit";
import { Signal } from "signal-polyfill";

type ReactiveElementConstructor = abstract new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => ReactiveElement;

/**
 * Adds the ability for a LitElement or other ReactiveElement class to
 * watch for access to signals during the update lifecycle and
 * trigger a new update when signals values change.
 */
export function SignalWatcher<T extends ReactiveElementConstructor>(
  Base: T,
): T {
  abstract class SignalWatcher extends Base {
    private __dispose?: () => void;
    private w = new Signal.subtle.Watcher(() => {
      this.requestUpdate();
    });

    override performUpdate() {
      // ReactiveElement.performUpdate() also does this check, so we want to
      // also bail early so we don't erroneously appear to not depend on any
      // signals.
      if (this.isUpdatePending === false) {
        return;
      }
      // If we have a previous effect, dispose it
      const lastDispose = this.__dispose;

      const c = new Signal.Computed(() => {
        super.performUpdate();
      });
      this.w.watch(c);
      this.__dispose = () => {
        this.w.unwatch(c);
      };
      c.get();
      lastDispose?.();
    }

    override connectedCallback(): void {
      super.connectedCallback();
      // In order to listen for signals again after re-connection, we must
      // re-render to capture all the current signal accesses.
      this.requestUpdate();
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this.__dispose?.();
    }
  }
  return SignalWatcher;
}
