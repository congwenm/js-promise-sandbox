describe('Promise', function() {
  it('exists', ()=> {
    expect(Promise).toBeDefined()

    // possible due to setting global.window = global, vice-versa;
    expect(global.Promise).toBeDefined() 
    expect(window.Promise).toBeDefined() 
  });

  beforeEach(function() {
    this.resolution = jasmine.createSpy('resolution');
    this.rejection = jasmine.createSpy('reject');
  })

  it('resolves', function (done) {
    var {resolution, rejection} = this;
    var promise = new Promise(function (resolve, reject) {
      resolve('haha')
    })
    promise.then(resolution, rejection)
      .then(res =>  {
        expect(resolution.calls.count()).toBe(1);
        expect(resolution.calls.first()).toEqual(jasmine.objectContaining({
          object: window,
          args: ['haha'],
        }));

        expect(rejection.calls.count()).toBe(0);
        done();
      });
  });

  it('rejects', function (done) {
    var promise = new Promise(function (resolve, reject) {
      reject('oh no')
    })
    promise.then(this.resolution, this.rejection)
      .then(res =>  {
        var {resolution, rejection} = this;
        expect(resolution.calls.count()).toBe(0);
        
        expect(rejection.calls.count()).toBe(1);
        expect(rejection.calls.first()).toEqual(jasmine.objectContaining({
          object: window,
          args: ['oh no'],
        }));
        done()
      })
  })

  // INTERESTING: cant do => throw new Error
  // INTERESTING: cant test pending promise gets
  //   Error: Timeout - Async callback was not 
  //   invoked within timeout specified by 
  //   jasmine.DEFAULT_TIMEOUT_INTERVAL.

  // xit('stalemate', function() {
  //   var promise = new Promise(function (resolve, reject) {})
  //   promise.then(this.resolution, this.rejection)
  //     .then(res => {
  //       throw new Error('should not be resolving')
  //     })
  //     .catch(res => {
  //       throw new Error('should not be rejecting either')
  //     })
  // })

  describe('chaining', function() {
    it('chain a {value} should be success with {value}', function (done) {
      var {resolution, rejection} = this;
      var promise = new Promise(function (resolve, reject) {
        resolve('haha')
      }).then(function() { 
        return {
          msg: 'haha', 
          num: 5, 
          swag: true, 
          obj: {name: 'object1'}
        };
      }).then(a=>a).then(b=>b); // that's something

      promise.then(resolution, rejection)
        .then(res =>  {
          expect(resolution.calls.count()).toBe(1);
          expect(resolution.calls.first()).toEqual(jasmine.objectContaining({
            object: window,
            args: [{
              msg: 'haha', 
              num: 5, 
              swag: true, 
              obj: {name: 'object1'}
            }],
          }));

          expect(rejection.calls.count()).toBe(0);
          done();
        });
    })

    it('chain a {promise wrapped value} should be success with {promise resolved value}', function (done) {
      var {resolution, rejection} = this;
      var promise = new Promise(function (resolve, reject) {
        resolve('haha')
      }).then(function() { 
        return new Promise((resolve) => {
          resolve({
            msg: 'haha', 
            num: 5, 
            swag: true, 
            obj: {name: 'object1'}
          });
        })
      }).then(a => {
        return new Promise(r1=> r1(a))
      }).then(b => {
        return new Promise(r1=> r1(b))
      });

      promise.then(resolution, rejection)
        .then(res =>  {
          expect(resolution.calls.count()).toBe(1);
          expect(resolution.calls.first()).toEqual(jasmine.objectContaining({
            object: window,
            args: [{
              msg: 'haha', 
              num: 5, 
              swag: true, 
              obj: {name: 'object1'}
            }],
          }));

          expect(rejection.calls.count()).toBe(0);
          done();
        });
    })
  })
})