import createLazyTask from '../src/index';

describe('createLazyTask', () => {

  describe('when created and called without any dependencies', () => {

    it('should return a promise resolved with the return value', () => {
      const task = createLazyTask(() => 'a');
      return task().should.eventually.eql('a');
    });

    it('should invoke the function without any arguments', () => {
      const task = createLazyTask((...args) => {
        args.should.have.length(0);
      });
      return task(1, 2, 3);
    });

    it('should not run the function until needed', () => {
      const spy = sinon.spy();
      createLazyTask(spy);
      spy.should.have.callCount(0);
    });

    it('should only run the function once', () => {
      const spy = sinon.stub().returns('a');
      const task = createLazyTask(spy);
      return Promise.all([task(), task(), task()])
          .should.eventually.eql(['a', 'a', 'a'])
          .then(() => {
            spy.callCount.should.eql(1);
          });
    });

  });

  describe('when depending on a task', () => {

    it('should invoke the function with the result of the dependency', () => {
      const task_a = createLazyTask((...args) => {
        args.should.have.length(0);
        return 'a';
      });
      const task_b = createLazyTask(task_a, (...args) => {
        args.should.eql(['a']);
        return 'b';
      });
      return task_b().should.eventually.eql('b');
    });

  });

  describe('when depending on multiple tasks', () => {

    it('should invoke the function with the result of all dependencies', () => {
      const task_a = createLazyTask((...args) => {
        args.should.eql([]);
        return 'a';
      });
      const task_b = createLazyTask(task_a, (...args) => {
        args.should.eql(['a']);
        return 'b';
      });
      const task_c = createLazyTask(task_a, (...args) => {
        args.should.eql(['a']);
        return 'c';
      });
      const task_d = createLazyTask(task_b, task_c, (...args) => {
        args.should.eql(['b', 'c']);
        return 'd';
      });
      return task_d().should.eventually.eql('d');
    });

    it('should only invoke each function once', () => {
      const fn_a = sinon.stub().returns('a');
      const fn_b = sinon.stub().returns('b');
      const fn_c = sinon.stub().returns('c');
      const fn_d = sinon.stub().returns('d');
      const task_a = createLazyTask(fn_a);
      const task_b = createLazyTask(task_a, fn_b);
      const task_c = createLazyTask(task_a, fn_c);
      const task_d = createLazyTask(task_b, task_c, fn_d);
      return task_d().then(() => {
        fn_a.should.have.callCount(1);
        fn_b.should.have.callCount(1);
        fn_c.should.have.callCount(1);
        fn_d.should.have.callCount(1);
      });
    });

  });

  describe('when a dependency fails', () => {

    it('should reject without calling the function', () => {
      const fn_a = sinon.stub().throws(new Error('test error'));
      const fn_b = sinon.stub().returns('b');
      const task_a = createLazyTask(fn_a);
      const task_b = createLazyTask(task_a, fn_b);
      return task_b().should.be.rejectedWith('test error').then(() => {
        fn_b.should.have.callCount(0);
      });
    });

  });

  describe('when depending on a promise', () => {

    it('should call the function with the resolved value', () => {
      const task = createLazyTask(Promise.resolve('a'), Promise.resolve('b'), (...args) => {
        args.should.eql(['a', 'b']);
        return 'c';
      });
      return task().should.eventually.eql('c');
    });

  });

  describe('when depending on a rejected promise', () => {

    it('should reject without calling the function', () => {
      const rejected = Promise.reject(new Error('test error'));
      const spy = sinon.spy();
      const task = createLazyTask(rejected, spy);
      return task().should.be.rejectedWith('test error').then(() => {
        spy.should.have.callCount(0);
      });
    });

  });

  describe('when the last argument is not a function', () => {

    it('should reject the resulting promise', () => {
      const task = createLazyTask();
      return task().should.be.rejected();
    });

  });

});
