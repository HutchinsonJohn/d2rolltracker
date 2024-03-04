import { importSPKI, jwtVerify } from 'jose'

const ACCESS_TOKEN_PUBLIC_KEY = (
  import.meta.env.VITE_ACCESS_TOKEN_PUBLIC_KEY || ''
).replace(/\\n/g, '\n')
const REFRESH_TOKEN_PUBLIC_KEY = (
  import.meta.env.VITE_REFRESH_TOKEN_PUBLIC_KEY || ''
).replace(/\\n/g, '\n')

export default async function verifyJwt(
  token: string,
  keyName: 'ACCESS_TOKEN_PUBLIC_KEY' | 'REFRESH_TOKEN_PUBLIC_KEY',
) {
  const secret = await importSPKI(
    keyName === 'ACCESS_TOKEN_PUBLIC_KEY'
      ? ACCESS_TOKEN_PUBLIC_KEY
      : REFRESH_TOKEN_PUBLIC_KEY,
    'RS256',
  )

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      valid: true,
      expired: false,
      decoded: payload,
    }
  } catch (error) {
    return {
      valid: false,
      expired: true,
      decoded: null,
    }
  }
}
