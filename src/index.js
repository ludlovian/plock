'use strict'

/**
 * @module plock
 * @description Creates a plock (promise-based lock)
 * @param {number} [width=1] The width/concurrency of the lock
 * @returns {Object} the created plock
 *
 * @example
 * const l = plock()
 */

export default function plock (width = 1) {
  let _used = 0
  let _waiters = []

  return Object.defineProperties(
    {},
    {
      lock: { configurable: true, enumerable: true, value: lock },
      release: { configurable: true, enumerable: true, value: release },
      locks: { configurable: true, enumerable: true, get: locks },
      waiting: { configurable: true, enumerable: true, get: waiting }
    }
  )

  /**
   * @method plock#lock
   * @description Acquires a lock. The lock stays with you until released.
   * @returns {Promise} promise that resolves once the lock is acquired
   * @example
   * await l.lock()
   *
   */
  function lock () {
    if (_used < width) {
      _used++
      return Promise.resolve()
    }

    return new Promise(resolve => _waiters.push(resolve))
  }

  /**
   *
   * @method plock#release
   * @description Releases a lock, allowing the next acquirer to take it.
   * @example
   * l.release()
   */
  function release () {
    if (!_used) return
    if (_waiters.length) {
      _waiters.shift()()
    } else {
      _used--
    }
  }

  /***
   *
   * @property plock#locks
   * @description Returns the number of locks currently held
   */
  function locks () {
    return _used
  }

  /***
   *
   * @property plock#waiting
   * @description Returns the number of acquirers waiting for locks
   */
  function waiting () {
    return _waiters.length
  }
}
