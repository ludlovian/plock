'use strict'

export default class PLock {
  constructor (width = 1) {
    this.width = width
    this.locks = 0
    this._awaiters = []
  }

  lock (priority) {
    if (this.locks < this.width) {
      this.locks++
      return Promise.resolve()
    }

    return new Promise(resolve => {
      if (priority) {
        this._awaiters.unshift(resolve)
      } else {
        this._awaiters.push(resolve)
      }
    })
  }

  release () {
    if (!this.locks) return
    if (this._awaiters.length) {
      this._awaiters.shift()()
    } else {
      this.locks--
    }
  }

  get waiting () {
    return this._awaiters.length
  }

  async exec (fn) {
    try {
      await this.lock()
      return await Promise.resolve(fn())
    } finally {
      this.release()
    }
  }
}
