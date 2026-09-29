import Schema from '@deepseek-ai/schemastery'

import { IpPoolConfigSchema } from './ip-pool-settings/namespace.ts'

/**
 * The plugin entry's Config schema (DSH reads `Config` off the module).
 *
 * `ipPool` is a volatile field: the Plugins page edits it live through the
 * host's Config-derived form and the loader commits it into the running fiber
 * without a remount (`loader/volatile-update`), so pool changes apply with no
 * restart. Everything else stays ordinary configuration; keys this schema does
 * not name (sidecar-mode options such as `agentPath`) pass through untouched.
 */
export const Config = Schema.object({
  mode: Schema.union(['adapter', 'sidecar']).default('adapter'),
  providerId: Schema.string().default('opencode2dsh'),
  refreshSeconds: Schema.number().default(300),
  ipPool: IpPoolConfigSchema.default({}).volatile(),
})
