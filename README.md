# plock
Promise-based locking

Provides simple `await`-able n-at-a-time locking

## API

### plock

```
import plock from 'plock'
const l = plock(width = 1)
```

Creates a promise-based lock, with the requested width. The `width` is the
maximum number of concurrent locks that can be taken before a requestor has to wait.

### lock

`await l.lock()`

Returns a promise which resolves when the lock has been granted to you.

The lock will stay with you until you `release` it.


### release

`l.release()`

Releases the lock, allowing the next waiting process to take it, if there is one.

### locks

Returns the number of locks currently held

### waiting

Returns the number of acquirers waiting for locks
