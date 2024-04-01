import { useState } from 'react'
import styled from 'styled-components'
import { set } from 'idb-keyval'
import theme from '../styles/theme'
import { useManifest } from '../context/ManifestContext'
import { manifestKey, manifestVersionKey } from '../utils/manifest'
import { Button, StyledLink } from './common/StyledComponents'

const CookiePolicyContainer = styled.div`
  max-width: 800px;
  margin: auto;
  padding: 1rem;
`

const CookieConsentDiv = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  background: ${theme.black}};
  padding: 20px;
  text-align: center;
  z-index: 1000;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`

const CookieNumberH3 = styled.h3`
  margin-top: 20px;
`

const CookieDisclaimerH5 = styled.h5`
  margin-top: 10px;
`

export default function CookiePolicy() {
  return (
    <CookiePolicyContainer>
      <h1>Cookie Policy</h1>

      <div>Last Updated: 12/20/2023</div>

      <CookieDisclaimerH5>
        We use cookies and similar technologies on our website. By using our
        website, you consent to the use of cookies in accordance with this
        Cookie Policy.
      </CookieDisclaimerH5>

      <CookieNumberH3>1. What are Cookies?</CookieNumberH3>
      <div>
        Cookies are small text files stored on your device (computer, tablet,
        smartphone) when you visit a website. They serve various purposes,
        including providing a better user experience, remembering preferences,
        and analyzing website traffic.
      </div>

      <CookieNumberH3>2. Types of Cookies We Use</CookieNumberH3>
      <div>We use the following types of cookies:</div>
      <div>
        Essential Cookies: Necessary for the functioning of the website.
      </div>
      <div>
        Functional Cookies: Enhance the user experience by remembering choices,
        preferences, and caching data.
      </div>

      <CookieNumberH3>3. How We Use Cookies</CookieNumberH3>
      <div>We use cookies for the following purposes:</div>
      <div>
        Website Functionality: To provide core functionality of the website.
      </div>

      <CookieNumberH3>4. Third-Party Cookies</CookieNumberH3>
      <div>We do not use third-party cookies.</div>

      <CookieNumberH3>5. Cookie Consent</CookieNumberH3>
      <div>
        By using our website, you consent to the use of cookies as described in
        this Cookie Policy. You can manage your cookie preferences through your
        browser settings. Please note that disabling certain cookies may affect
        the functionality of the website.
      </div>

      <CookieNumberH3>6. Your Choices</CookieNumberH3>
      <div>
        You can control and manage cookies in various ways. Your browser
        settings allow you to refuse or delete certain cookies. For more
        information on managing cookies, visit https://www.allaboutcookies.org/.
      </div>

      <CookieNumberH3>7. Changes to this Cookie Policy</CookieNumberH3>
      <div>
        We may update this Cookie Policy to reflect changes in our use of
        cookies. Check the date at the top for the latest version.
      </div>

      <CookieNumberH3>8. Contact Us</CookieNumberH3>
      <div>
        If you have questions about this Cookie Policy, contact us at{' '}
        <a href="mailto:d2rolltracker@gmail.com">d2rolltracker@gmail.com</a>
      </div>
    </CookiePolicyContainer>
  )
}

export const isCookieConsentRequired = false

export function CookieConsent() {
  const manifest = useManifest()

  const [acceptedCookies, setAcceptedCookies] = useState(() =>
    document.cookie.includes('cookie-consent=accepted'),
  )
  const [rejectedCookies, setRejectedCookies] = useState(false)

  const acceptCookies = () => {
    document.cookie = 'cookie-consent=accepted; max-age=31536000; path=/'
    setAcceptedCookies(true)
    if (localStorage.getItem(manifestVersionKey) == null) {
      set(manifestKey, manifest)
      localStorage.setItem(manifestVersionKey, manifest.version)
    }
  }

  if (acceptedCookies || rejectedCookies) {
    return null
  }

  return (
    <CookieConsentDiv>
      We only use cookies to be able to sign you in and cache the manifest. For
      more information, see our{' '}
      <StyledLink to="/cookies">Cookie Policy</StyledLink> and{' '}
      <StyledLink to="/privacy">Privacy Policy</StyledLink>.
      <ButtonContainer>
        <Button onClick={acceptCookies}>Accept All Cookies</Button>
        <Button onClick={() => setRejectedCookies(true)}>
          Accept Necessary Cookies Only
        </Button>
      </ButtonContainer>
    </CookieConsentDiv>
  )
}
