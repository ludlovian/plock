import test from 'ava'
import promiseGoodies from 'promise-goodies'
import PLock from '../src'

promiseGoodies()

test('acquire and release', async t => {
  const l = new PLock()

  t.is(l.count, 0)
  await l.acquire()

  t.is(l.count, 1)
  l.release()

  t.is(l.count, 0)
})

test('waiting for lock', async t => {
  const l = new PLock()
  await l.acquire()

  const p1 = l.acquire()
  t.false(await p1.isResolved())

  l.release()
  t.is(l.count, 1)
  t.true(await p1.isResolved())

  l.release()
  t.is(l.count, 0)
})

test('multiple width lock', async t => {
  const l = new PLock({ width: 2 })

  await l.acquire()
  t.is(l.count, 1)

  await l.acquire()
  t.is(l.count, 2)

  const p3 = l.acquire()
  t.is(l.waiting, 1)
  t.false(await p3.isResolved())

  l.release()
  t.is(l.waiting, 0)
  t.is(l.count, 2)

  l.release()
  t.is(l.count, 1)

  await l.acquire()
  l.release()
  l.release()
  t.is(l.count, 0)
})

test('over-release lock', async t => {
  const l = new PLock()
  await l.acquire()
  l.release()
  t.is(l.count, 0)
  l.release()
  t.is(l.count, 0)
})

test('exec', async t => {
  const l = new PLock()
  await l.acquire()

  const p = l.exec(() => 17)
  t.false(await p.isResolved())

  l.release()
  t.true(await p.isResolved())
  t.is(await p, 17)

  const e = new Error('oops')

  const err = await t.throwsAsync(() =>
    l.exec(() => {
      throw e
    })
  )

  t.is(err, e)
  t.is(l.count, 0)
})
