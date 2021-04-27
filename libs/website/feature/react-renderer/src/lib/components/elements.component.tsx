/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */

import React from 'react'
import Website from '@aglyn/website/core'
import { ElementComponent, ElementComponentProps } from './element.component'
import { ComponentProp } from '@aglyn/shared/ui/react'


export interface ElementsComponentProps extends ComponentProp {
  elements?: Website.ElementData[]
  elementComponent?: ElementComponentProps['childrenComponent']
}

export function ElementsComponent(props: ElementsComponentProps) {
  const {
    component: Component,
    elementComponent: ElementRenderer,
    elements,
    ...rest
  } = props
  return (
    <Component {...rest}>
      {elements.map((data) => (
        <ElementRenderer
          key={data.$id}
          elementData={data}
          childrenComponent={ElementRenderer}
        />
      ))}
    </Component>
  )
}

ElementsComponent.defaultProps = {
  component: React.Fragment,
  elementComponent: ElementComponent,
  elements: [],
}

export default ElementsComponent
