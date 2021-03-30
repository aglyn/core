export * from './lib/guards'
export * from './lib/uid'
export * from './lib/utils'


import deepEqual from 'deep-equal'
import deepMerge from 'deepmerge'
export {
  deepEqual,
  deepMerge
}

/**
 * Transform a string between camelCase, PascalCase, Capital Case, snake_case,
 * param-case, CONSTANT_CASE and others.
 */
export * as changeCase from 'change-case'
