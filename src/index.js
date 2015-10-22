export default function createLazyTask(...args) {
  const task = args.pop();
  let lazy_result = null;
  return () => lazy_result || (
      lazy_result = Promise.all(args.map(
          val => typeof val === 'function' ? val() : val
      )).then(values => task(...values)));
}
