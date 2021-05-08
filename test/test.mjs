import { test } from 'uvu'
import * as assert from 'uvu/assert'

import promiseGoodies from 'promise-goodies'

import PLock from '../src/index.mjs'

promiseGoodies()

test('acquire and release', async () => {
  const l = new PLock()

  assert.is(l.count, 0)
  await l.acquire()

  assert.is(l.count, 1)
  l.release()

  assert.is(l.count, 0)
})

test('waiting for lock', async () => {
  const l = new PLock()
  await l.acquire()

  const p1 = l.acquire()
  assert.not.ok(await p1.isResolved())

  l.release()
  assert.is(l.count, 1)
  assert.ok(await p1.isResolved())

  l.release()
  assert.is(l.count, 0)
})

test('multiple width lock', async () => {
  const l = new PLock({ width: 2 })

  await l.acquire()
  assert.is(l.count, 1)

  await l.acquire()
  assert.is(l.count, 2)

  const p3 = l.acquire()
  assert.is(l.waiting, 1)
  assert.not.ok(await p3.isResolved())

  l.release()
  assert.is(l.waiting, 0)
  assert.is(l.count, 2)

  l.release()
  assert.is(l.count, 1)

  await l.acquire()
  l.release()
  l.release()
  assert.is(l.count, 0)
})

test('over-release lock', async () => {
  const l = new PLock()
  await l.acquire()
  l.release()
  assert.is(l.count, 0)
  l.release()
  assert.is(l.count, 0)
})

test('exec', async () => {
  const l = new PLock()
  await l.acquire()

  const p = l.exec(() => 17)
  assert.not.ok(await p.isResolved())

  l.release()
  assert.ok(await p.isResolved())
  assert.is(await p, 17)

  const e = new Error('oops')

  await l
    .exec(() => {
      throw e
    })
    .then(
      () => {
        assert.unreachable()
      },
      err => {
        assert.is(err, e)
      }
    )

  assert.is(l.count, 0)
})

test('synonyms', () => {
  const l = new PLock()
  assert.is(l.acquire, l.lock)
  assert.is(l.release, l.unlock)
})

test.run()
