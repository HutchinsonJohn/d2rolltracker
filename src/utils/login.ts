import { v4 as uuid } from 'uuid'

export default function login() {
  const authState = uuid()
  const { pathname } = window.location
  // Essential cookies
  localStorage.setItem('authState', authState)
  // the redirect could be encoded into the authState in the future
  localStorage.setItem('redirectTo', pathname)
  window.location.href = `https://www.bungie.net/en/OAuth/Authorize?client_id=${
    import.meta.env.VITE_OAUTH_ID
  }&response_type=code&state=${authState}&reauth=true`
}
