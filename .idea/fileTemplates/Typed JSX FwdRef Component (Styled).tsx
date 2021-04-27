/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */

import { ElementType, forwardRef, ReactNode } from 'react'
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles'
import clsx from 'clsx'


export const ${NAME}Styles = (theme: Theme) => createStyles({
  root: {},
})

export interface ${NAME}Props {
  children?: ReactNode
  component?: ElementType
}

export const ${NAME} = forwardRef<any, ${NAME}Props & {} & WithStyles<typeof ${NAME}Styles>>(
  function RefRenderFn(props, ref) {
    const { 
      children,
      component: Component,
      className: propClass,
      ...rest
    } = props
    const className = clsx(classes.root, propClass)

    return (
      <Component 
        ref={ref}
        className={className} 
        {...rest}
      >
        {children}
      </Component>
    )
  }
)

${NAME}.displayName = '${NAME}'
${NAME}.defaultProps = {
  component: 'div',
}

export default withStyles(${NAME}Styles, {name: '${NAME}'})(${NAME})
