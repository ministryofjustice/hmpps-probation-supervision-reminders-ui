import jwt from 'jsonwebtoken'

interface TokenPayload {
  user_name: string
  scope: string[]
  auth_source: string
  authorities: string[]
  jti: string
  client_id: string
}

export default function createUserToken(payload: Partial<TokenPayload> = {}): string {
  const defaultPayload: TokenPayload = {
    user_name: 'user1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities: [],
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign({ ...defaultPayload, ...payload }, 'secret', { expiresIn: '1h' })
}
