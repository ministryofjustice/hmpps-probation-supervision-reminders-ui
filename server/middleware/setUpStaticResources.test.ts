import express from 'express'
import compression from 'compression'
import noCache from 'nocache'
import setUpStaticResources from './setUpStaticResources'

jest.mock('compression', () => jest.fn(() => 'compression-middleware'))
jest.mock('nocache', () => jest.fn(() => 'nocache-middleware'))
jest.mock('express', () => {
  return {
    static: jest.fn(() => 'static-middleware'),
    use: jest.fn(),
  }
})

const mockRouter = {
  use: jest.fn(),
}

const mockExpress = jest.mocked(express)

describe('setUpStaticResources', () => {
  it('should set up compression, static resources, and noCache', () => {
    mockExpress.Router = jest.fn().mockReturnValue(mockRouter)

    setUpStaticResources()

    expect(compression).toHaveBeenCalledTimes(1)
    expect(mockExpress.static).toHaveBeenCalledTimes(5)
    expect(noCache).toHaveBeenCalledTimes(1)

    expect(mockRouter.use).toHaveBeenCalledWith('/assets', 'static-middleware')
    expect(mockRouter.use).toHaveBeenCalledWith('compression-middleware')
    expect(mockRouter.use).toHaveBeenCalledWith('nocache-middleware')

    jest.clearAllMocks()
  })
})
