import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import applicationInfoSupplier from '../applicationInfo'

import createRedisClient from './redisClient'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import logger from '../../logger'
import ProbationFrontendComponentsApiClient from './probationFrontendComponentsClient'

const applicationInfo = applicationInfoSupplier()

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    hmppsAuthClient,
    probationFrontendComponentsApiClient: new ProbationFrontendComponentsApiClient(),
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  }
}

export { AuthenticationClient, HmppsAuditClient, ProbationFrontendComponentsApiClient }
