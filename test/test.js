'use strict'

import test from 'ava'
import PLock from '../src'

const isResolved = (p, ms = 20) =>
  new Promise(resolve => {
    p.then(() => resolve(true))
    setTimeout(() => resolve(false), ms)
  })

test('lock and release', async t => {
  const l = new PLock()

  t.is(l.locks, 0)
  await l.lock()

  t.is(l.locks, 1)
  l.release()

  t.is(l.locks, 0)
})

test('waiting for lock', async t => {
  const l = new PLock()
  await l.lock()

  const p1 = l.lock()
  t.false(await isResolved(p1))

  l.release()
  t.is(l.locks, 1)
  t.true(await isResolved(p1))

  l.release()
  t.is(l.locks, 0)
})

test('multiple width lock', async t => {
  const l = new PLock(2)

  await l.lock()
  t.is(l.locks, 1)

  await l.lock()
  t.is(l.locks, 2)

  const p3 = l.lock()
  t.is(l.waiting, 1)
  t.false(await isResolved(p3))

  l.release()
  t.is(l.waiting, 0)
  t.is(l.locks, 2)

  l.release()
  t.is(l.locks, 1)

  await l.lock()
  l.release()
  l.release()
  t.is(l.locks, 0)
})

test('over-release lock', async t => {
  const l = new PLock(2)
  await l.lock()
  l.release()
  t.is(l.locks, 0)
  l.release()
  t.is(l.locks, 0)
})

test('exec', async t => {
  const l = new PLock()
  await l.lock()

  const p = l.exec(() => 17)
  t.false(await isResolved(p))

  l.release()
  t.true(await isResolved(p))
  t.is(await p, 17)

  await t.throwsAsync(() =>
    l.exec(() => {
      throw new Error('oops')
    })
  )

  t.is(l.locks, 0)
})

test('priority locks', async t => {
  const l = new PLock()
  await l.lock()
  const p1 = l.lock()
  const p2 = l.lock(true)

  l.release()
  t.true(await isResolved(p2))
  t.false(await isResolved(p1))
})
