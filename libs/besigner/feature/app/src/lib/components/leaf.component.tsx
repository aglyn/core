/**
 * @license
 * Copyright 2022 Aglyn LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Leaf, type LeafProps } from '@aglyn/aglyn-node-renderer'
import * as Besigner from '@aglyn/besigner'
import { useForkedRefs, useIsomorphicLayoutEffect } from '@aglyn/shared-ui-jsx'
import { Box } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { useRenderedCanvasElements } from '../contexts/rendered-canvas-elements'
import useLeafDrag from '../hooks/use-leaf-drag'
import useLeafDrop from '../hooks/use-leaf-drop'

export interface ElementLeafComponentProps extends LeafProps {}

const RawLeafComponent = forwardRef<any, ElementLeafComponentProps>(
  (props, forwardRef) => {
    const { node, ...rest } = props
    const localRef = useRef<HTMLElement>(null)
    const [nodeRef, setNodeRef] = useState<HTMLElement>()

    const {
      setNodeRef: setDraggableNodeRef,
      attributes,
      listeners,
      transform,
    } = useLeafDrag(node, Besigner.DragType.CANVAS)
    const { setNodeRef: setDroppableNodeRef } = useLeafDrop(node)
    const { setElementRef, deleteElementRef } = useRenderedCanvasElements()
    const ref = useForkedRefs<HTMLElement>(
      forwardRef,
      setDraggableNodeRef,
      setDroppableNodeRef,
      // dragPreview,
      // dropRef,
      setNodeRef,
      localRef,
    )
    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          cursor: 'grab',
        }
      : undefined

    /**
     * Update context element ref
     */
    useEffect(() => {
      setElementRef(node?.$id, {
        $id: node?.$id,
        node: nodeRef,
        dragHandle: {
          ...listeners,
          style: transform ? { cursor: 'grab' } : { cursor: 'move' },
        },
      })
      return () => {
        deleteElementRef(node?.$id)
      }
    })

    const handleOnMouseOver = useCallback(
      (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        Besigner.focus.setHoveredNode(node)
      },
      [node],
    )
    const handleOnMouseDown = useCallback(
      (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        Besigner.focus.handleNodeSelection(node)
      },
      [node],
    )
    const isSelected = Besigner.focus.isNodeSelected(node)

    useIsomorphicLayoutEffect(() => {
      const el = localRef.current
      if (el) {
        el.addEventListener('mouseover', handleOnMouseOver)
        el.addEventListener('mousedown', handleOnMouseDown)

        return () => {
          el.removeEventListener('mouseover', handleOnMouseOver)
          el.removeEventListener('mousedown', handleOnMouseDown)
        }
      }
    }, [handleOnMouseOver, handleOnMouseDown])

    return (
      <>
        <Leaf
          ref={ref}
          node={node}
          data-aglyn-selected={isSelected ? 'selected' : undefined}
          style={style}
          {...attributes}
          {...rest}
        />
        <Box
          sx={{
            position: 'absolute',
            pointerEvents: 'none',
            top: 0,
            left: 0,
            opacity: 0.2,
            width: () => nodeRef?.offsetWidth,
            height: () => nodeRef?.offsetHeight,
            transform: () =>
              `translate3d(${nodeRef?.offsetLeft}px,${nodeRef?.offsetTop}px,0)`,
          }}
        >
          <Box sx={{}}>top</Box>
        </Box>
      </>
    )
  },
)
RawLeafComponent.displayName = 'BesignerLeafComponent'
RawLeafComponent.aglyn = true

export const LeafComponent = observer<ElementLeafComponentProps, any>(
  RawLeafComponent,
)
export default LeafComponent
