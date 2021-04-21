/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */

import {
  _isBool,
  _isNumT,
} from './guards'

describe('Guards:_isBool', () => {
  it('should work', () => {
    expect(_isBool(true)).toEqual(true)
  })
})


describe('_isNumT', () => {
  it('should work', () => {
    expect(_isNumT(1)).toEqual(true)
  })
})
