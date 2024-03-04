import styled from 'styled-components'

export default function About() {
  const AboutContainer = styled.div`
    max-width: 800px;
    margin: auto;
  `

  return (
    <AboutContainer>
      <h1>About</h1>
      For an overview of the features of the website, check out the video below:
      <div>
        This website is created by{' '}
        <a href="https://github.com/HutchinsonJohn">John Hutchinson</a> and is
        not affiliated with Bungie.
      </div>
    </AboutContainer>
  )
}
