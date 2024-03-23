declare module 'core-js/actual/async-iterator/filter.js' {
  global {
    interface AsyncIterator<T> {
      filter<S extends T>(predicate: (value: T, index: number) => value is S): AsyncIterator<S>
    }
  }
}

declare module 'core-js/actual/async-iterator/map.js' {
  global {
    interface AsyncIterator<T> {
      map<U>(callbackfn: (value: T, index: number) => U): AsyncIterator<U>
    }
  }
}
