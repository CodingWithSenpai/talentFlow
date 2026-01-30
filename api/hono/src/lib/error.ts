import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

import { isLocal } from "@packages/env"
import { env } from "@packages/env/api-hono"
import { z } from "zod"

export const statuses = {
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  509: "Bandwidth Limit Exceeded",
  510: "Not Extended",
  511: "Network Authentication Required",
} as const

const toErrorCode = (status: keyof typeof statuses) =>
  statuses[status].toUpperCase().replace(/ /g, "_").replace(/'/g, "")

const jsonError =
  <S extends ContentfulStatusCode>(status: S) =>
  (c: Context, message?: string, extra?: { code?: string } & Record<string, unknown>) => {
    const { code, ...rest } = extra ?? {}
    return c.json(
      {
        error: {
          code: code ?? toErrorCode(status as keyof typeof statuses),
          message: message ?? statuses[status as keyof typeof statuses],
          ...rest,
        },
      },
      status,
    )
  }

export const error = {
  badRequest: jsonError(400),
  unauthorized: jsonError(401),
  paymentRequired: jsonError(402),
  forbidden: jsonError(403),
  notFound: jsonError(404),
  methodNotAllowed: jsonError(405),
  notAcceptable: jsonError(406),
  proxyAuthenticationRequired: jsonError(407),
  requestTimeout: jsonError(408),
  conflict: jsonError(409),
  gone: jsonError(410),
  lengthRequired: jsonError(411),
  preconditionFailed: jsonError(412),
  payloadTooLarge: jsonError(413),
  uriTooLong: jsonError(414),
  unsupportedMediaType: jsonError(415),
  rangeNotSatisfiable: jsonError(416),
  expectationFailed: jsonError(417),
  imATeapot: jsonError(418),
  misdirectedRequest: jsonError(421),
  unprocessableEntity: jsonError(422),
  locked: jsonError(423),
  failedDependency: jsonError(424),
  tooEarly: jsonError(425),
  upgradeRequired: jsonError(426),
  preconditionRequired: jsonError(428),
  tooManyRequests: jsonError(429),
  requestHeaderFieldsTooLarge: jsonError(431),
  unavailableForLegalReasons: jsonError(451),
  internalServerError: jsonError(500),
  notImplemented: jsonError(501),
  badGateway: jsonError(502),
  serviceUnavailable: jsonError(503),
  gatewayTimeout: jsonError(504),
  httpVersionNotSupported: jsonError(505),
  variantAlsoNegotiates: jsonError(506),
  insufficientStorage: jsonError(507),
  loopDetected: jsonError(508),
  notExtended: jsonError(510),
  networkAuthenticationRequired: jsonError(511),
}

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof z.ZodError) {
    return error.badRequest(c, "Invalid request payload", {
      code: "VALIDATION_ERROR",
      issues: err.issues,
    })
  }

  const message = isLocal(env.NODE_ENV) ? err.message : statuses[500]
  return error.internalServerError(c, message)
}
