import { test } from 'node:test'
import assert from 'node:assert/strict'

import { Config } from '../src/config-schema.ts'

test('Config fills defaults and exposes ipPool as a volatile reference', () => {
  const parsed = Config({}) as unknown as { mode: string; providerId: string; refreshSeconds: number; ipPool: { get(): Record<string, unknown> } }
  assert.equal(parsed.mode, 'adapter')
  assert.equal(parsed.providerId, 'opencode2dsh')
  assert.equal(parsed.refreshSeconds, 300)
  assert.equal(typeof parsed.ipPool.get, 'function')
  const ipPool = parsed.ipPool.get()
  assert.equal(ipPool.enabled, false)
  assert.equal(ipPool.maxConcurrentProbes, 3)
})

test('Config keeps unnamed keys and the legacy ipPool.subscriptions spelling', () => {
  const parsed = Config({ agentPath: '/a', ipPool: { enabled: true, subscriptions: ['https://s/1'] } }) as unknown as {
    agentPath?: string
    ipPool: { get(): Record<string, unknown> }
  }
  assert.equal(parsed.agentPath, '/a')
  assert.deepEqual(parsed.ipPool.get().subscriptions, ['https://s/1'])
})

test('Config marks exactly the ipPool field volatile', () => {
  const json = Config.toJSON() as { refs: Record<string, { type: string; meta: { volatile?: boolean }; dict?: Record<string, number> }> }
  const root = Object.values(json.refs).find((node) => node.type === 'object' && node.dict && 'ipPool' in node.dict)!
  const volatileKeys = Object.entries(root.dict!).filter(([, ref]) => json.refs[String(ref)]!.meta.volatile).map(([key]) => key)
  assert.deepEqual(volatileKeys, ['ipPool'])
})
