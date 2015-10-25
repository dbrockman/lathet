import assert from 'assert';

export default function createLazyTask(...args) {
  const task = args.pop();
  assert.equal(typeof task, 'function', 'last argument must be a function');
  let lazy_result = null;
  return () => lazy_result || (
      lazy_result = Promise.all(args.map(
          val => typeof val === 'function' ? val() : val
      )).then(values => task(...values)));
}
