/* eslint-disable max-classes-per-file */
import { AxiosError } from 'axios'

/**
 * Error for when something goes wrong fetching data from Bungie
 */
export class BungieError extends Error {
  cause: {
    ErrorCode: number
    ThrottleSeconds: number
    ErrorStatus: string
    Message: string
    MessageData: Record<string, string>
  }

  constructor(errorResponse: {
    ErrorCode: number
    ThrottleSeconds: number
    ErrorStatus: string
    Message: string
    MessageData: Record<string, string>
  }) {
    super(`${errorResponse.ErrorStatus.toString()}: ${errorResponse.Message}`)
    this.cause = errorResponse
    this.name = 'BungieError'
  }
}

export function isBungieError(error: unknown): error is BungieError {
  return (
    error != null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string' &&
    'name' in error &&
    error.name === 'BungieError' &&
    'cause' in error &&
    typeof error.cause === 'object' &&
    error.cause != null &&
    'ErrorCode' in error.cause &&
    typeof error.cause.ErrorCode === 'number' &&
    'ErrorStatus' in error.cause &&
    typeof error.cause.ErrorStatus === 'string' &&
    'Message' in error.cause &&
    typeof error.cause.Message === 'string' &&
    'MessageData' in error.cause &&
    typeof error.cause.MessageData === 'object' &&
    'ThrottleSeconds' in error.cause &&
    typeof error.cause.ThrottleSeconds === 'number'
  )
}

export function getBungieError(bungieError: unknown): {
  message: string
  cause: BungieError
} {
  const error: BungieError = bungieError as BungieError
  return {
    message:
      error.cause.ErrorCode === 5
        ? 'Bungie.net servers are down for maintenance'
        : 'An unknown problem occurred while fetching the Destiny manifest',
    cause: error,
  }
}

/**
 * When the user makes an acceptable error, like not selecting a perk before saving
 * Will not be reported to Sentry
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserError'
  }
}

export function isUserError(error: unknown): error is UserError {
  return (
    error != null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string' &&
    'name' in error &&
    error.name === 'UserError'
  )
}

export function getAxiosError(axiosError: unknown): {
  message: string
  status: number | undefined
  cause: AxiosError
} {
  const error: AxiosError = axiosError as AxiosError
  return {
    message:
      // Error thrown by zod on server side
      (error.response?.data as { message: string }[])?.at(0)?.message ||
      // Error thrown by express on server side
      (typeof error.response?.data === 'string' && error.response?.data) ||
      // Error thrown on client side
      error.message ||
      'An unknown error occurred, please try again later.',
    status: error.response?.status,
    cause: error,
  }
}
