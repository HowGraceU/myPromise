(function (window) {
    const PADDING = 'padding';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';

    let final = function (status, value) {
        if (this.status !== PADDING) {
            return
        };

        setTimeout(() => {
            let queue, fn;
            this.status = status;

            if (status === FULFILLED) {
                queue = this._resolves;
                this._value = value;
            } else if (status === REJECTED) {
                queue = this._rejects;
                this._reason = value;
            }

            while (fn = queue.shift()) {
                fn.call(this, value);
            }
        })
    };

    class _Promise {
        constructor(resolver) {
            if (typeof resolver !== 'function') {
                throw new Error('Promise resolver undefined is not a function');
            }

            this.status = PADDING;
            this._value;
            this._reason;
            // 回调函数队列
            this._resolves = [];
            this._rejects = [];

            let resolve = value => {
                final.call(this, FULFILLED, value);
            }

            let reject = reason => {
                final.call(this, REJECTED, reason);
            }

            resolver(resolve, reject);
        }

        then(onFulfilled, onRejected) {
            return new _Promise((res, rej) => {
                let sucCallback = value => {
                    let ret = typeof onFulfilled === 'function' && onFulfilled(value) || value;

                    if (_Promise.prototype.isPrototypeOf(ret)) {
                        ret.then(value => {
                            res(value);
                        }, reason => {
                            rej(reason);
                        })
                    } else {
                        res(ret);
                    }
                }

                let errCallback = reason => {
                    let err = typeof onRejected === 'function' && onRejected(reason) || reason;
                    rej(err);
                }

                if (this.status === PADDING) {
                    this._resolves.push(sucCallback);
                    this._rejects.push(errCallback);
                } else if (this.status === FULFILLED) {
                    sucCallback(this._value);
                } else if (this.status === REJECTED) {
                    errCallback(this._reason);
                }
            })
        }

        static all(promises) {
            return new Promise((res, rej) => {
                const ret = [];
                const promiseLen = promises.length;
                let count = 0;
    
                promises.forEach((pro, i) => {
                    pro.then(data => {
                        ret[i] = data;

                        if (++count === promiseLen) {
                            res(ret);
                        }
                    }, reason => {
                        rej(reason);
                    })
                })
            })
        }

        static race(promises) {
            return new _Promise((res, rej) => {
                promises.forEach(pro => {
                    pro.then(data => {
                        res(data);
                    }, reason => {
                        rej(reason);
                    })
                });
            })
        }
    }

    window._Promise = _Promise;
})(window)