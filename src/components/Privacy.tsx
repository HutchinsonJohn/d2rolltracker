import styled from 'styled-components'

const PrivacyPolicyContainer = styled.div`
  max-width: 800px;
  margin: auto;
`

const PrivacyNumberH3 = styled.h3`
  margin-top: 20px;
`

const PrivacyDisclaimerH5 = styled.h5`
  margin-top: 10px;
`

export default function PrivacyPolicy() {
  return (
    <PrivacyPolicyContainer>
      <h1>Privacy Policy</h1>

      <div>Last Updated: 12/20/2023</div>

      <PrivacyDisclaimerH5>
        We are committed to protecting your privacy. This Privacy Policy
        outlines how we collect, use, disclose, and safeguard your personal
        information. By using our website or services you agree to the terms of
        this Privacy Policy.
      </PrivacyDisclaimerH5>

      <PrivacyNumberH3>1. Information We Collect</PrivacyNumberH3>
      <div>We may collect the following types of personal information:</div>
      <div>
        Personal Information: Bungie.net and Destiny 2 account information.
      </div>
      <div>
        User-Generated Content: Any content you voluntarily submit to us.
      </div>

      <PrivacyNumberH3>2. How We Collect Information</PrivacyNumberH3>
      <div>We collect information through:</div>
      <div>
        Direct Interactions: Information you provide when using our website or
        services.
      </div>
      <div>
        Automated Technologies: Cookies, web beacons, and similar technologies
        when you interact with our website.
      </div>

      <PrivacyNumberH3>3. Use of Information</PrivacyNumberH3>
      <div>We use your information for:</div>
      <div>Providing Services: Delivering the services you requested.</div>
      <div>
        Legal Obligations: Complying with legal and regulatory requirements.
      </div>

      <PrivacyNumberH3>4. Sharing of Information</PrivacyNumberH3>
      <div>
        Third-Party Service Providers: Usage data is shared with Sentry.io for
        error reporting.
      </div>
      <div>
        Legal Compliance: When required to comply with applicable laws or
        regulations.
      </div>

      <PrivacyNumberH3>5. Your Rights</PrivacyNumberH3>
      <div>You have the right to:</div>
      <div>Access: Request access to your personal information.</div>
      <div>Erasure: Request deletion of your information.</div>
      <div>
        Data Portability: Receive your data in a structured, commonly used,
        machine-readable format.
      </div>

      <PrivacyNumberH3>6. Security</PrivacyNumberH3>
      <div>
        We implement appropriate technical and organizational measures to
        protect your information.
      </div>

      <PrivacyNumberH3>7. Cookies</PrivacyNumberH3>
      <div>
        We use cookies to enhance your experience. You can manage cookie
        preferences through your browser settings.
      </div>

      <PrivacyNumberH3>8. Children&apos;s Privacy</PrivacyNumberH3>
      <div>
        Our services are not intended for individuals under the age of 16. We do
        not knowingly collect personal information from children.
      </div>

      <PrivacyNumberH3>9. Changes to this Privacy Policy</PrivacyNumberH3>
      <div>
        We may update this Privacy Policy to reflect changes in our practices.
        Check the date at the top for the latest version.
      </div>

      <PrivacyNumberH3>10. Contact Us</PrivacyNumberH3>
      <div>
        If you have questions about this Privacy Policy, contact us at{' '}
        <a href="mailto:d2rolltracker@gmail.com">d2rolltracker@gmail.com</a>
      </div>
    </PrivacyPolicyContainer>
  )
}
