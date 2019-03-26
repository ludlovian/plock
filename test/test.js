'use strict'

import test from 'ava'
import plock from '../src'

const isResolved = (p, ms = 20) =>
  new Promise(resolve => {
    p.then(() => resolve(true))
    setTimeout(() => resolve(false), ms)
  })

test('lock and release', async t => {
  const lock = plock()

  t.false(lock.locked)
  await lock.lock()

  t.true(lock.locked)
  lock.release()

  t.false(lock.locked)
})

test('waiting for lock', async t => {
  const lock = plock()
  await lock.lock()

  const p1 = lock.lock()
  t.false(await isResolved(p1))

  lock.release()
  t.true(lock.locked)
  t.true(await isResolved(p1))

  lock.release()
  t.false(lock.locked)
})

test('over-release lock', async t => {
  const lock = plock()
  await lock.lock()
  lock.release()
  t.false(lock.locked)
  lock.release()
  t.false(lock.locked)
})
