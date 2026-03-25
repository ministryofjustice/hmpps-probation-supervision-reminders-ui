import jwt from 'jsonwebtoken'
import httpMocks from 'node-mocks-http'
import authorisationMiddleware from './authorisationMiddleware'

const req = httpMocks.createRequest()
const next = jest.fn()

const buildResponse = (token: Array<string>) => {
  const res = httpMocks.createResponse({
    locals: {
      user: {
        token: jwt.sign({ authorities: token }, 'secret'),
      },
    },
  })

  jest.spyOn(res, 'redirect')
  return res
}

describe('authorisationMiddleware', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return next when no required roles', () => {
    const res = buildResponse([])

    authorisationMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect when user has no authorised roles', () => {
    const res = buildResponse(['TEST'])

    authorisationMiddleware(['ROLE_REQUIRED'])(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should return next when required role is unprefixed and user has authorised role', () => {
    const res = buildResponse(['ROLE_REQUIRED'])

    authorisationMiddleware(['REQUIRED'])(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should return next when user has authorised role', () => {
    const res = buildResponse(['ROLE_REQUIRED'])

    authorisationMiddleware(['ROLE_REQUIRED'])(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })
})
