import React, { useState, useContext } from 'react'
import { Menu, Image } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import { AuthContext } from '../context/auth'

function MenuBar() {

  const { user, logout } = useContext(AuthContext)

  const handleItemClick = (e, { name }) => setActiveItem(name)

  const pathname = window.location.pathname;
  const path = pathname === '/' ? 'home' : pathname.substr(1)

  const [activeItem, setActiveItem] = useState(path)

  const menuBar = user ? (
    <Menu inverted pointing className="stickyHeader" size="mini">
      <Menu.Item header>
        <Image size='mini' circular src='/lizardlogosmall.png' style={{ marginRight: '1.5em' }} />
          The Lizard Lounge
      </Menu.Item>
      <Menu.Item
        name="home"
        active={activeItem === 'home'}
        onClick={handleItemClick}
        as={Link}
        to="/"
      />
      <Menu.Menu position='right'>
        <Menu.Item
          name='logout'
          onClick={logout}
        />
        <Menu.Item
          as={Link}
          to="/account"
          name="account"
          active={activeItem === 'account'}
          onClick={handleItemClick}
        >
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  ) : (
      <Menu inverted className="stickyHeader" pointing size="mini" >
        <Menu.Item header>
          <Image circular size='mini' src='/lizardlogosmall.png' style={{ marginRight: '1.5em' }} />
          The Lizard Lounge
      </Menu.Item>
        <Menu.Item
          name='home'
          active={activeItem === 'home'}
          onClick={handleItemClick}
          as={Link}
          to="/"
        />
        <Menu.Menu position='right'>
          <Menu.Item
            name='login'
            active={activeItem === 'login'}
            onClick={handleItemClick}
            as={Link}
            to="/login"
          />
          <Menu.Item
            name='register'
            active={activeItem === 'register'}
            onClick={handleItemClick}
            as={Link}
            to="/register"
          />
        </Menu.Menu>
      </Menu>
    )

  return menuBar
}

export default MenuBar