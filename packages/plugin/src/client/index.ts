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
// Type-only: pulls the plugin-manager SlotMap merge ('plugins.row.config',
// 'plugins.bundle.config').
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
// Type-only: pulls the settings Context merge (ctx.configForms).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { IpPoolBundlePage, IpPoolCard } from './IpPoolCard.tsx'
import type { IpPoolBundleInjected, IpPoolCardInjected } from './IpPoolCard.tsx'
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

/** The bundle package name (the `plugins.bundle.config` key). */
const PKG_NAME = '@opencode2dsh/dsh-plugin'

/** The Host plugin entry id the bundle patch declares (its config namespace). */
const ENTRY_ID = 'opencode2dsh'

/** `<package name>#<row id>`: the row the bundle patch declares. */
const ROW_KEY = '@opencode2dsh/dsh-plugin#opencode2dsh'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'configForms']

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

  // The same page on the bundle's own detail view: the package card on the
  // Plugins page shows the form directly, without the row's Configure step.
  // Mounted only while the Host serves this entry's config namespace.
  ctx.effect(() => ctx.configForms.whileServed([ENTRY_ID], () => {
    const entryForm = ctx.configForms.get<Record<string, unknown>>(ENTRY_ID)
    const ipPoolForm: IpPoolBundleInjected['ipPoolForm'] = {
      getSnapshot: () => entryForm.getSnapshot(),
      subscribe: (listener) => entryForm.subscribe(listener),
      mutate: (ops, revision) => entryForm.mutate(ops, revision),
    }
    const face = (): IpPoolBundleInjected => ({ t, ipPoolForm })
    try {
      return ctx.slots.inject('plugins.bundle.config', () =>
        ctx.slots.register({ name: 'plugins.bundle.config', key: PKG_NAME, locale: NS, inject: face }, IpPoolBundlePage))
    } catch (err) {
      // Same containment as the row page: a rejected card must not fail the fiber.
      console.warn(`opencode2dsh: bundle configuration card rejected by this DSH build (${err instanceof Error ? err.message : String(err)})`)
      return () => {}
    }
  }), 'opencode2dsh: bundle configuration card')

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
