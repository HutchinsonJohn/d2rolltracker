export const serverURI = import.meta.env.PROD
  ? 'https://api.d2rolltracker.com'
  : `http://localhost:${import.meta.env.VITE_SERVER_PORT ?? '1337'}`

export const websiteURI = import.meta.env.PROD
  ? 'https://d2rolltracker.com'
  : 'https://localhost:3000'
