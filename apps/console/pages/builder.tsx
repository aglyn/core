import React from 'react'
import Website from '@aglyn/website/feature-core'

/* eslint-disable-next-line */
export interface BuilderProps {}

export function Builder(props: BuilderProps) {

  console.log('page:/builder', Website.app.App.getInstance())
  return (
    <div>
      <h1>Welcome to builder!</h1>
    </div>
  )
}

export default Builder
