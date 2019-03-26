# plock
Promise-based locking

Provides simple `await`-able one-at-a-time locking

## API

### plock

```
import plock from 'plock'
const l = plock()
```

Creates a promise-based lock

### lock

`await l.lock()`

Returns a promise which resolves when the lock has been granted to you. You **must** release the lock when finished.

### release

`l.release()`

Releases the lock, which can be taken by the next one waiting, if there is one.

### locked

`if (l.locked) { ... }`

Returns whether the lock is currently locked.
