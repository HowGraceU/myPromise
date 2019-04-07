describe('Promise测试', function () {
    var getData100 = function () {
        return new _Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve('100ms');
            }, 100);
        });
    }
    
    var getData200 = function () {
        return new _Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve('200ms');
            }, 200);
        });
    }
    var getData300 = function () {
        return new _Promise(function (resolve, reject) {
            setTimeout(function () {
                reject('error');
            }, 300);
        });
    }
    var getData50 = function () {
        return new _Promise(function (resolve, reject) {
            setTimeout(function () {
                reject('error50');
            }, 50);
        });
    }

    it('正常Promise是否可用', function () {
        return getData100().then(data => {
            expect(data).toBe('100ms');
        });
    });

    it('链式Promise是否可用', function (done) {
        let promise100 = getData100();

        promise100.then(data => {
            expect(data).toBe('100ms');
            return 1;
        })
        promise100.then(data => {
            expect(data).toBe('100ms');
        })

        promise100.then(data => {
            expect(data).toBe('100ms');
            return 1;
        }).then(data => {
            expect(data).toBe(1);
        });

        promise100.then(data => {
            expect(data).toBe('100ms');
            return getData200();
        }).then(data => {
            expect(data).toBe('200ms');
            return getData300();
        }).then(() => {}, reason => {
            expect(reason).toBe('error');
            done();
        });
    });

    it('Promise.all是否可用', function (done) {
        _Promise.all([getData100(), getData200()]).then(data => {
            expect(data).toEqual(['100ms', '200ms']);
        })

        _Promise.all([getData200(), getData300(), getData100()]).then(data => {}, reason => {
            console.log(reason)
            expect(reason).toBe('error');
        })

        setTimeout(() => {
            done();
        }, 500);
    });

    it('Promise.race是否可用', function (done) {
        _Promise.race([getData100(), getData200(), getData300()]).then(data => {
            expect(data).toBe('100ms');
        })

        _Promise.race([getData50(), getData200(), getData300()]).then(data => {}, reason => {
            expect(reason).toBe('error50');
        })

        setTimeout(() => {
            done();
        }, 500);
    });
})