function plock () {
  let _locked = false;
  let _waiters = [];
  return {
    lock,
    release,
    get locked () {
      return _locked
    }
  }
  function lock () {
    if (!_locked) {
      _locked = true;
      return Promise.resolve()
    }
    return new Promise(resolve => _waiters.push(resolve))
  }
  function release () {
    if (!_locked) return
    if (_waiters.length) {
      _waiters.shift()();
    } else {
      _locked = false;
    }
  }
}

export default plock;
