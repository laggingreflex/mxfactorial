import React from 'react'
import ReactDOM from 'react-dom'
import { shallow } from 'enzyme'
import App from '../App'

it('renders without crashing', () => {
  const wrapper = shallow(<App />)
  expect(wrapper.exists()).toBeTruthy()
})
