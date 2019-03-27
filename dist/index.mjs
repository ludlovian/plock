function plock (width = 1) {
  let _used = 0;
  let _waiters = [];
  return Object.defineProperties(
    {},
    {
      lock: { configurable: true, enumerable: true, value: lock },
      release: { configurable: true, enumerable: true, value: release },
      locks: { configurable: true, enumerable: true, get: locks },
      waiting: { configurable: true, enumerable: true, get: waiting }
    }
  )
  function lock () {
    if (_used < width) {
      _used++;
      return Promise.resolve()
    }
    return new Promise(resolve => _waiters.push(resolve))
  }
  function release () {
    if (!_used) return
    if (_waiters.length) {
      _waiters.shift()();
    } else {
      _used--;
    }
  }
  function locks () {
    return _used
  }
  function waiting () {
    return _waiters.length
  }
}

export default plock;
