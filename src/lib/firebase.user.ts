import { firebase } from './firebase'
import { _isFn } from './tools/guards'

export interface User {
  id: firebase.User['uid']
  email: firebase.User['email']
  token?: any
}

export const mapFirebaseUser = async (user: firebase.User): Promise<User> => {
  const { email, uid } = user
  const token = await user.getIdToken(true) as any
  return {
    id: uid,
    email,
    token
  }
}

export const signUpUser = async (email: string, password: string) => {
  let [_user, _error] = [null, null]
  await firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((user) => {
      _user = user
    })
    .catch((error) => {
      _error = error
    })
  return [_user, _error]
}

export const signInUser = async (email: string, password: string) => {
  let [_user, _error] = [null, null]
  await firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
      _user = user
    })
    .catch((error) => {
      _error = error
    })
  return [_user, _error]
}

export const signOutUser = async (onSuccess?: () => void, onError?: () => void) => {
  await firebase.auth().signOut()
    .then(() => {
      _isFn(onSuccess) && onSuccess()
    })
    .catch((error) => {
      _isFn(onError) && onError(error)
    })
}