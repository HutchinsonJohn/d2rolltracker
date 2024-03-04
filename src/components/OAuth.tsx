import { Navigate } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import ErrorScreen from './error/ErrorScreen'
import { getAxiosError } from '../utils/error'
import { useLoginQuery } from '../api/queries'

export default function OAuth() {
  const { pathname, search } = new URL(window.location.href)
  const code = new URLSearchParams(search).get('code')
  const authState = new URLSearchParams(search).get('state')

  const loginQuery = useLoginQuery(pathname, authState, code)

  if (loginQuery.isLoading) {
    return <LoadingScreen message="Logging you in" />
  }

  if (loginQuery.isError) {
    return <ErrorScreen {...getAxiosError(loginQuery.error)} />
  }

  const redirectTo = localStorage.getItem('redirectTo')

  if (loginQuery.isSuccess) {
    return <Navigate to={redirectTo == null ? '/' : redirectTo} />
  }

  return (
    <ErrorScreen message="An unknown error occurred, please try again later." />
  )
}
