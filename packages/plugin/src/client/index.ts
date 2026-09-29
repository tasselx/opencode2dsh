/**
 * opencode2dsh — browser half. Registers the IP 池 configuration page on the
 * Plugins page as this plugin row's own page (`plugins.row.config`, keyed
 * `<package>#<row id>`; the row id is the `opencode2dsh` entry the bundle patch
 * inserts). The page owner hands the component the entry's Config form
 * (`form.state` / `form.mutate`); the volatile `ipPool` field is what it edits.
 * Runtime state + probe actions ride the plugin's own bridge.
 *
 * Export discipline: cross-plugin collaboration goes through cordis services
 * (`slots`, `locale`); the bundle purity gate forbids value imports of other
 * @deepseek-ai packages (type-only imports are erased).
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the slots plugin's Context merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the renderer plugin's Context merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the plugin-manager SlotMap merge ('plugins.row.config').
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import { IpPoolCard } from './IpPoolCard.tsx'
import type { IpPoolCardInjected } from './IpPoolCard.tsx'
import { en, zh, type IpPoolKey } from './locales.ts'

export type { IpPoolCardInjected, IpPoolCardProps, IpPoolSettingsValue } from './IpPoolCard.tsx'
export type { IpPoolKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The IP 池 page copy. */
    'settings.ip-pool': IpPoolKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'settings.ip-pool'

/** `<package name>#<row id>`: the row the bundle patch declares. */
const ROW_KEY = '@opencode2dsh/dsh-plugin#opencode2dsh'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale']

/**
 * Register the IP 池 page once the `plugins.row.config` declaration is on the
 * ledger.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'opencode2dsh: copy dictionaries')

  // One bound translate for the inject face; copy freshness rides the locale revision.
  const t = ctx.locale.bind(NS) as IpPoolCardInjected['t']
  const injected = (): IpPoolCardInjected => ({ t })

  ctx.slots.inject('plugins.row.config', () => {
    try {
      return ctx.slots.register({ name: 'plugins.row.config', key: ROW_KEY, locale: NS, inject: injected }, IpPoolCard)
    } catch (err) {
      // A rejected page must not fail the plugin fiber (the boot screen would
      // list the whole plugin as failed); model routing is unaffected.
      console.warn(`opencode2dsh: configuration page rejected by this DSH build (${err instanceof Error ? err.message : String(err)}) — model routing is unaffected; upgrade DSH to >= 0.1.7 for the configuration page`)
      return () => {}
    }
  })
}
