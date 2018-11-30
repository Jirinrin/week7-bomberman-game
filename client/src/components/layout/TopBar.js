import React from 'react'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import {withRouter} from 'react-router'
import {userId} from '../../jwt'
import {connect} from 'react-redux'
import AccountIcon from 'material-ui-icons/AccountBox'


const TopBar = (props) => {
  const { location, history, user } = props

 
  return (
    <AppBar position="absolute"  style={{zIndex:10, backgroundColor: '#121212'}}>
      <Toolbar>
        <Typography variant="title" color="inherit" style={{flex: 1}}>
          BomberMan 
        </Typography>
        {
          user &&
          <Button color="inherit" style={{backgroundColor: '#121212'}}><AccountIcon /> { user.firstName }</Button>
        }

        {
          location.pathname.indexOf('signup') > 0 &&
          <Button color="inherit"  style={{backgroundColor: '#121212'}} onClick={() => history.push('/login')}>Login</Button>
        }
        {
          location.pathname.indexOf('login') > 0 &&
          <Button color="inherit" style={{backgroundColor: '#121212'}} onClick={() => history.push('/signup')}>Sign up</Button>
        }
        {
          location.pathname.indexOf('games/') > 0 &&
          <Button color="inherit" style={{backgroundColor: '#121212'}} onClick={() => history.push('/games')}>All Games</Button>
        }
        {
          /games$/.test(location.pathname) &&
          <Button color="inherit" style={{backgroundColor: '#121212'}} onClick={() => history.push('/logout')}>Log out</Button>
        }
      </Toolbar>
    </AppBar>
  )
}

const mapStateToProps = state => ({
  user: state.currentUser && state.users &&
    state.users[userId(state.currentUser.jwt)]
})

export default withRouter(
  connect(mapStateToProps)(TopBar)
)
