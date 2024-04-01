import styled from 'styled-components'

export default function About() {
  const AboutContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 800px;
    margin: auto;
    gap: 1rem;
    padding: 1rem;
  `

  const VideoIframe = styled.iframe`
    aspect-ratio: 16 / 9;
  `

  return (
    <AboutContainer>
      <h1>About</h1>
      <div>
        This website is created by{' '}
        <a href="https://github.com/HutchinsonJohn">John Hutchinson</a> and is
        not affiliated with Bungie.
      </div>
      For an overview of the features of the website, check out the video below:
      <VideoIframe
        src="https://www.youtube-nocookie.com/embed/iDzuxailV-0?si=0rqAI3GSdTyuUuId"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </AboutContainer>
  )
}
