import styled, { keyframes } from 'styled-components'
import theme from '../styles/theme'

const perkURIs = (() => {
  // I would much prefer to load these from bungie as needed than bundle them,
  // but the URLs change randomly
  const array = [
    new URL('../assets/auto-loading-holster.png', import.meta.url),
    new URL('../assets/explosive-payload.png', import.meta.url),
    new URL('../assets/kill-clip.png', import.meta.url),
    new URL('../assets/opening-shot.png', import.meta.url),
    new URL('../assets/quickdraw.png', import.meta.url),
    new URL('../assets/rampage.png', import.meta.url),
    new URL('../assets/rangefinder.png', import.meta.url),
    new URL('../assets/ricochet-rounds.png', import.meta.url),
  ]
  let m = array.length
  let i: number

  while (m) {
    i = Math.floor(Math.random() * m)
    m -= 1
    ;[array[m], array[i]] = [array[i], array[m]]
  }
  return array
})()

const changeImage = keyframes`${perkURIs
  .map(
    (URI, i) => `${Math.floor((i * 100) / perkURIs.length)}% {
      background-image: url(${URI})
  }
  `,
  )
  .join('')}100% {
    background-image: url(${perkURIs[0].toString()})
  }`

const rotate = keyframes`
  0% {
    transform: rotateX(0deg) translateZ(20px);
  }
  40% {
    transform: rotateX(90deg) translateZ(20px);
  }
  50% {
    transform: rotateX(180deg) translateZ(20px);
  }
  60% {
    transform: rotateX(270deg) translateZ(20px);
  }
  100% {
    transform: rotateX(360deg) translateZ(20px);
  }
`

const LoadingDiv = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`

const WebsiteName = styled.div`
  display: flex;
  justify-content: center;
  font-size: 3.5rem;
`

const SpinDiv = styled.div`
  display: flex;
  justify-content: center;
  animation-name: ${rotate};
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-delay: 0s;
  transform-style: preserve-3d;

  @media screen and (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const BorderDiv = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  align-self: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid ${theme.white};
  border-radius: 50%;
  transform-style: preserve-3d;
`

const PerkIconDiv = styled.div`
  width: 2.5rem;
  height: 2.5rem;

  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  animation-name: ${changeImage};
  animation-duration: ${perkURIs.length * 2}s;
  animation-iteration-count: infinite;
  animation-timing-function: step-start;
  animation-delay: 1.1s;
  backface-visibility: hidden;

  @media screen and (prefers-reduced-motion: reduce) {
    animation: none;
    background-image: url(${new URL(
      '../assets/kill-clip.png',
      import.meta.url,
    ).toString()});
  }
`

/**
 * The website logo with a rotating "roll" and a loading message.
 * Bug: On Firefox, retrieving the manifest from indexedDB seems to prevent the
 * background-image updates from properly occurring, which takes the fun out of
 * this loading screen. It also takes 8 times as long as Chrome.  This seems to
 * be the case on DIM as well.
 */
export default function LoadingScreen(props: { message: string }) {
  return (
    <LoadingDiv>
      <WebsiteName>
        d2
        <SpinDiv>
          r
          <BorderDiv>
            <PerkIconDiv />
          </BorderDiv>
          ll
        </SpinDiv>
        tracker
      </WebsiteName>
      {props.message}
    </LoadingDiv>
  )
}
