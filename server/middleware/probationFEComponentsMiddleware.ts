import type { RequestHandler } from 'express'
import ProbationComponentsService from '../services/ProbationComponentsService'
import logger from '../../logger'
import config from '../config'

export default function getFrontendComponents(probationComponentsService: ProbationComponentsService): RequestHandler {
  return async (req, res, next) => {
    const cached = req.session?.feComponents

    res.locals.cookies = config.apis.cookies.url
    res.locals.privacy = config.apis.privacy.url
    res.locals.accessibility = config.apis.accessibility.url

    if (cached?.header && cached?.footer) {
      res.locals.feComponents = cached
      return next()
    }

    const token: string | undefined = res.locals?.user?.token
    if (!token) {
      return next()
    }
    let header: { html?: string; css?: string[]; javascript?: string[] } | undefined
    let footer: { html?: string; css?: string[]; javascript?: string[] } | undefined
    try {
      ;({ header, footer } = await probationComponentsService.getProbationFEComponents(['header', 'footer'], token))
    } catch (error) {
      logger.info(error, 'Failed to fetch probation front end components')
      return next()
    }

    res.locals.feComponents = {
      header: replaceHashWithSlash(header?.html),
      footer: footer?.html,
    }

    if (req?.session) {
      req.session.feComponents = res.locals.feComponents
    }

    return next()
  }
}

function replaceHashWithSlash(source: string | null | undefined): string | null {
  if (source === null || source === undefined) return null
  const input = String(source)
  if (!input.includes('#')) return input
  return input.replace(/=(['"])#\1/g, '=$1/$1')
}
