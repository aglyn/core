import { render } from '@testing-library/react'

import FeatureReact from './feature-react'

describe('FeatureReact', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureReact />)
    expect(baseElement).toBeTruthy()
  })
})
