import { Request, Response, NextFunction } from 'express'
import config from './config'
import { defaultName } from './utils/azureAppInsights'

const baseController = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.locals.applicationInsightsConnectionString = config.appInsights.connectionString
    res.locals.applicationInsightsRoleName = defaultName()
    return next()
  }
}

export default baseController
