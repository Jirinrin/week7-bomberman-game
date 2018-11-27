import {ADD_USER, UPDATE_USER, UPDATE_USERS} from '../actions/users'
import {USER_LOGOUT} from '../actions/users'
  
/*
The state will contain the player data
*/

export default (state = null, {type, payload}) => {
  switch (type) {      
    case UPDATE_PLAYER:
      return {
        ...state,
        [payload.id]: payload
      }

    default:
      return state
  }
}