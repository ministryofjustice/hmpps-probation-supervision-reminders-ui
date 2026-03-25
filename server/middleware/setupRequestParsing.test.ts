import express from 'express'
import setUpWebRequestParsing from './setupRequestParsing'

jest.mock('express')

const mockExpress = jest.mocked(express)

const mockRouter = {
  use: jest.fn(),
}

describe('setUpWebRequestParsing', () => {
  it('should set up JSON and URL-encoded parsing middleware', () => {
    const jsonMiddleware = jest.fn()
    const urlencodedMiddleware = jest.fn()

    mockExpress.Router = jest.fn().mockReturnValue(mockRouter)
    mockExpress.json = jest.fn().mockReturnValue(jsonMiddleware)
    mockExpress.urlencoded = jest.fn().mockReturnValue(urlencodedMiddleware)

    setUpWebRequestParsing()

    expect(mockExpress.json).toHaveBeenCalledTimes(1)
    expect(mockRouter.use).toHaveBeenCalledWith(jsonMiddleware)
    expect(mockExpress.urlencoded).toHaveBeenCalledWith({ extended: true })
    expect(mockRouter.use).toHaveBeenCalledWith(urlencodedMiddleware)

    jest.clearAllMocks()
  })
})
