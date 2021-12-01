import { AragonArtifact } from '@1hive/connect-core'

import { getAppInfo } from './interfaces'

export function getAragonOsInternalAppInfo(appId: string): AragonArtifact {
  return getAppInfo(appId, 'aragon')
}

export function getApmInternalAppInfo(appId: string): AragonArtifact {
  return getAppInfo(appId, 'apm')
}

export { hasAppInfo, getAppInfo } from './interfaces'
