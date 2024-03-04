import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { CookieConsent, isCookieConsentRequired } from './Cookies'
import Navbar from './navbar/Navbar'
import Footer, { footerHeight } from './Footer'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${footerHeight});
`

export default function PageWrapper() {
  return (
    <>
      <Wrapper>
        <Navbar />
        {isCookieConsentRequired && <CookieConsent />}
        <Outlet />
      </Wrapper>
      <Footer />
    </>
  )
}
