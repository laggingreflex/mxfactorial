import React from 'react'
import styled from 'styled-components'
import is from 'styled-is'
import { navigate } from '@reach/router'

import Hamburger from 'components/Hamburger'
import MobileNav from 'components/MobileNav'

export const MenuButton = styled.div`
  position: absolute;
  z-index: 1000;
  right: 1.5rem;
  bottom: 1rem;
`

export const Mask = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: 0.2s;
  transition-delay: 0.2s;
  display: none;
  ${is('active')`
      opacity: 1;
      display: block;
  `};
`

const Container = styled.div`
  width: 100vw;
  position: fixed;
  left: 0;
  bottom: 0;
`

class Menu extends React.Component {
  state = {
    active: false
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleEscClose)
  }

  componentWillUnMount() {
    document.removeEventListener('keydown', this.handleEscClose)
  }

  handleClose = () => this.setState({ active: false })
  handleEscClose = e => {
    if (e.key === 'Escape') {
      this.handleClose()
    }
  }

  handleToggle = () =>
    this.setState(state => ({
      active: !state.active
    }))

  handleSignOut = () => {
    const { signOut } = this.props
    signOut().then(() => navigate('/'))
  }

  render() {
    const { active } = this.state
    return (
      <Container>
        <Mask data-id="nav-mask" active={active} onClick={this.handleClose} />
        {this.state.active && <MobileNav signOut={this.handleSignOut} />}
        <MenuButton data-id="nav-button">
          <Hamburger active={active} onClick={this.handleToggle} />
        </MenuButton>
      </Container>
    )
  }
}

export default Menu