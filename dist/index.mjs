import PSwitch from 'pswitch';

const priv = Symbol('priv');
const resolved = Promise.resolve();
class PLock {
  constructor (width = 1) {
    Object.defineProperty(this, priv, {
      value: {
        width,
        locks: 0,
        waiting: [],
        busy: new PSwitch(false)
      }
    });
  }
  lock (priority) {
    const p = this[priv];
    p.busy.set(true);
    if (p.locks < p.width) {
      p.locks++;
      return resolved
    }
    return new Promise(resolve =>
      priority ? p.waiting.unshift(resolve) : p.waiting.push(resolve)
    )
  }
  release () {
    const p = this[priv];
    if (!p.locks) return
    if (p.waiting.length) {
      p.waiting.shift()();
    } else {
      if (--p.locks === 0) p.busy.set(false);
    }
  }
  get waiting () {
    return this[priv].waiting.length
  }
  get locks () {
    return this[priv].locks
  }
  whenIdle () {
    return this[priv].busy.when(false)
  }
  whenBusy () {
    return this[priv].busy.when(true)
  }
  async exec (fn) {
    try {
      await this.lock();
      return await Promise.resolve(fn())
    } finally {
      this.release();
    }
  }
}

export default PLock;
