import { interopDefault } from '@aglyn/shared-util-tools'


export * from './lib/api'
export * from './lib/aglyn-components.types'

export const loader = () => require('./lib/models/aglyn-components.extension').default
