/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */

import { ComponentType, ElementType, isValidElement } from 'react'

const is: { str: (value) => boolean; func: (value) => boolean } = {
  func: (value): boolean => typeof value === 'function',
  str: (value): boolean => typeof value === 'string'
}


/**
 * EXAMPLE:
 * CLASS BASED COMPONENT
 * class Foo extends React.Component {
 *   render(){
 *       return <h1>Hello</h1>;
 *   }
 * }
 *
 * const foo = <Foo />;
 *
 * FUNCTIONAL COMPONENT
 * function Bar (props) { return <h1>World</h1> }
 * const bar = <Bar />;
 *
 * REACT ELEMENT
 * const header = <h1>Title</h1>;
 *
 * TEST
 * isReactElement(Foo); // false
 * isReactElement(<Foo />) // true
 * isReactElement(Bar); // false
 * isReactElement(<Bar />) // true
 *
 * @param element
 * @returns {boolean}
 */
export function isReactElement(element: any): boolean {
  return isValidElement(element)
}

/**
 * EXAMPLE:
 * CLASS BASED COMPONENT
 * class Foo extends React.Component {
 *   render(){
 *       return <h1>Hello</h1>;
 *   }
 * }
 *
 * const foo = <Foo />;
 *
 * FUNCTIONAL COMPONENT
 * function Bar (props) { return <h1>World</h1> }
 * const bar = <Bar />;
 *
 * REACT ELEMENT
 * const header = <h1>Title</h1>;
 *
 * TEST
 * isReactClassComponent(Foo); // true
 * isReactClassComponent(Bar); // false
 *
 * @param component
 * @returns {boolean}
 */
export function isReactClassComponent(component): boolean {
  const hasProperty: (v: PropertyKey) => boolean = Object.prototype.hasOwnProperty
  return is.func(component) && hasProperty.call(component?.prototype ?? {}, 'isReactComponent')
}

/**
 * EXAMPLE:
 * CLASS BASED COMPONENT
 * class Foo extends React.Component {
 *   render(){
 *       return <h1>Hello</h1>;
 *   }
 * }
 *
 * const foo = <Foo />;
 *
 * FUNCTIONAL COMPONENT
 * function Bar (props) { return <h1>World</h1> }
 * const bar = <Bar />;
 *
 * REACT ELEMENT
 * const header = <h1>Title</h1>;
 *
 * TEST
 * isReactFunctionComponent(Foo); // false
 * isReactFunctionComponent(Bar); // true
 *
 * @param component
 * @returns {boolean}
 */
export function isReactFunctionComponent(component): boolean {
  return is.func(component) && String(component).includes('return React.createElement')
}

/**
 * EXAMPLE:
 * CLASS BASED COMPONENT
 * class Foo extends React.Component {
 *   render(){
 *       return <h1>Hello</h1>;
 *   }
 * }
 *
 * const foo = <Foo />;
 *
 * FUNCTIONAL COMPONENT
 * function Bar (props) { return <h1>World</h1> }
 * const bar = <Bar />;
 *
 * REACT ELEMENT
 * const header = <h1>Title</h1>;
 *
 * TEST
 * `isReactComponent(<Bar />) // false`
 * `isReactComponent(Bar); // true`
 * `isReactComponent(<Foo />) // false`
 * `isReactComponent(Foo); // true`
 *
 * @param component
 * @returns {component is React.ComponentType<P>}
 */
export function isReactComponent<P>(component): component is ComponentType<P> {
  return isReactClassComponent(component) || isReactFunctionComponent(component)
}

/**
 * EXAMPLE:
 * CLASS BASED COMPONENT
 * class Foo extends React.Component {
 *   render(){
 *       return <h1>Hello</h1>;
 *   }
 * }
 *
 * const foo = <Foo />;
 *
 * FUNCTIONAL COMPONENT
 * function Bar (props) { return <h1>World</h1> }
 * const bar = <Bar />;
 *
 * REACT ELEMENT
 * const header = <h1>Title</h1>;
 *
 * TEST
 * `isReactComponent(<Bar />) // false`
 * `isReactComponent(Bar); // true`
 * `isReactComponent(<Foo />) // false`
 * `isReactComponent(Foo); // true`
 * `isReactComponent('div'); // true`
 *
 * @param component
 * @returns {component is React.ComponentType<P>}
 */
export function isReactElementType<P>(component): component is ElementType<P> {
  return isReactClassComponent(component)
    || isReactFunctionComponent(component)
    || is.str(component)
}

/**
 * EXAMPLE:
 * CLASS BASED COMPONENT
 * class Foo extends React.Component {
 *   render(){
 *       return <h1>Hello</h1>;
 *   }
 * }
 *
 * const foo = <Foo />;
 *
 * FUNCTIONAL COMPONENT
 * function Bar (props) { return <h1>World</h1> }
 * const bar = <Bar />;
 *
 * REACT ELEMENT
 * const header = <h1>Title</h1>;
 *
 * TEST
 * `isReactDOMTypeElement(<Bar />) // false`
 * `isReactDOMTypeElement(<Foo />) // false`
 *
 * @param element
 * @returns {boolean}
 */
export function isReactDOMTypeElement(element): boolean {
  return isReactElement(element) && is.str(element?.type)
}

/**
 * EXAMPLE:
 * CLASS BASED COMPONENT
 * class Foo extends React.Component {
 *   render(){
 *       return <h1>Hello</h1>;
 *   }
 * }
 *
 * const foo = <Foo />;
 *
 * FUNCTIONAL COMPONENT
 * function Bar (props) { return <h1>World</h1> }
 * const bar = <Bar />;
 *
 * REACT ELEMENT
 * const header = <h1>Title</h1>;
 *
 * TEST
 * `isReactCompositeTypeElement(<Bar />) // true`
 * `isReactCompositeTypeElement(<Foo />) // true`
 *
 * @param element
 * @returns {boolean}
 */
export function isReactCompositeTypeElement(element): boolean {
  return isReactElement(element) && is.func(element?.type)
}
