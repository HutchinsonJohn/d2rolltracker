import {
  createBrowserRouter,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
} from 'react-router-dom'
import {
  init,
  BrowserTracing,
  Replay,
  wrapCreateBrowserRouter,
  reactRouterV6Instrumentation,
  ErrorBoundary,
} from '@sentry/react'
import { useCallback, useEffect } from 'react'
import { useQueryClient } from 'react-query'
import Weapon from './components/Weapon'
import Home from './components/Home'
import OAuth from './components/OAuth'
import ManifestProvider from './context/ManifestContext'
import AccountStateProvider from './context/AccountStateContext'
import UserSettings from './components/UserSettings'
import LoadingScreen from './components/LoadingScreen'
import { getAxiosError, getBungieError, isBungieError } from './utils/error'
import ErrorScreen from './components/error/ErrorScreen'
import {
  LOGIN,
  USER_ROLLS,
  useLoginQuery,
  useManifestQuery,
} from './api/queries'
import { Tokens, saveTokensToLocalStorage } from './utils/oauth'
import CookiePolicy from './components/Cookies'
import PrivacyPolicy from './components/Privacy'
import PageWrapper from './components/PageWrapper'
import About from './components/About'

function App() {
  useEffect(() => {
    if (import.meta.env.PROD && import.meta.env.SENTRY_ENABLE === 'true') {
      init({
        dsn: 'https://e0be4f11e79a4c19b826cb1695f8d2e1@o4505570124234752.ingest.sentry.io/4505570125742080',
        integrations: [
          new BrowserTracing({
            routingInstrumentation: reactRouterV6Instrumentation(
              useEffect,
              useLocation,
              useNavigationType,
              createRoutesFromChildren,
              matchRoutes,
            ),
          }),
          new Replay(),
        ],

        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,

        // Capture Replay for 10% of all sessions,
        // plus for 100% of sessions with an error
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      })
    }
  }, [])

  const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createBrowserRouter)

  const router = sentryCreateBrowserRouter([
    {
      path: '/',
      element: <PageWrapper />,
      children: [
        {
          path: '',
          element: <Home />,
        },
        {
          path: 'w/:hash',
          element: <Weapon />,
        },
        {
          path: 'r/:rollId',
          element: <Weapon />,
        },
        {
          path: 'OAuth',
          element: <OAuth />,
        },
        {
          path: 'about',
          element: <About />,
        },
        { path: 'settings', element: <UserSettings /> },
        {
          path: 'cookies',
          element: <CookiePolicy />,
        },
        {
          path: 'privacy',
          element: <PrivacyPolicy />,
        },
        {
          path: '/*',
          element: <ErrorScreen status={404} message="Page not found" />,
        },
      ],
    },
  ])

  const { pathname, search } = new URL(window.location.href)
  const code = new URLSearchParams(search).get('code')
  const authState = new URLSearchParams(search).get('state')

  const loginQuery = useLoginQuery(pathname, authState, code)

  const queryClient = useQueryClient()

  const updateTokens = useCallback(
    (tokens: Tokens) => {
      saveTokensToLocalStorage(tokens)
      queryClient.setQueryData(LOGIN, { ...loginQuery.data, ...tokens })
    },
    [loginQuery, queryClient],
  )
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('bungieTokens')
    localStorage.removeItem('authState')
    localStorage.removeItem('redirectTo')
    queryClient.setQueryData(LOGIN, undefined)
  }, [queryClient])
  const updateDefaultMembership = useCallback(
    (membershipId: string, membershipType: number) => {
      queryClient.setQueryData(LOGIN, {
        ...loginQuery.data,
        defaultDestinyMembershipId: membershipId,
        defaultDestinyMembershipType: membershipType,
      })
      localStorage.setItem('defaultDestinyMembershipId', membershipId)
      localStorage.setItem(
        'defaultDestinyMembershipType',
        membershipType.toString(),
      )
      queryClient.removeQueries(USER_ROLLS, { exact: true })
    },
    [loginQuery, queryClient],
  )
  const manifestQuery = useManifestQuery()
  if (manifestQuery.isLoading) {
    return (
      <>
        <LoadingScreen message="Loading Manifest" />
      </>
    )
  }

  if (manifestQuery.isError || manifestQuery.data == null) {
    return (
      <ErrorScreen
        {...(isBungieError(manifestQuery.error)
          ? getBungieError(manifestQuery.error)
          : getAxiosError(manifestQuery.error))}
      />
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <ErrorScreen message="Something went wrong.  We'll be looking into this as soon as possible." />
      }
    >
      <ManifestProvider value={manifestQuery.data}>
        <AccountStateProvider
          accountState={loginQuery.data}
          updateTokens={updateTokens}
          logout={logout}
          updateDefaultMembership={updateDefaultMembership}
        >
          <RouterProvider router={router} />
        </AccountStateProvider>
      </ManifestProvider>
    </ErrorBoundary>
  )
}

export default App
