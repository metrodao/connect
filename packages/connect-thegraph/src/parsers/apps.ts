import {
  App,
  AppData,
  PermissionData,
  ErrorNotFound,
  ErrorUnexpectedResult,
  Organization,
  resolveArtifact,
} from '@1hive/connect-core'

import { QueryResult } from '../types'

function _getAppVerson(app: any): any {
  return app.repo?.versions
    .sort(
      (v1: any, v2: any) =>
        parseInt(v2.semanticVersion.replace(/,/g, '')) -
        parseInt(v1.semanticVersion.replace(/,/g, ''))
    )
    .find((version: any) => version.codeAddress === app.version?.codeAddress)
}

function _parseApp(
  app: any,
  version: any,
  artifact: any,
  organization: Organization
): App {
  const rolesData = app.roles?.map((role: any) => {
    const artifactRoleData = artifact.roles.find(
      (r: any) => r.bytes === role.hash
    )
    return {
      ...role,
      appAddress: app.appAddress,
      appId: app.appId,
      id: artifactRoleData?.id,
      grantees: role?.grantees?.map(
        (permission: any): PermissionData => ({
          appAddress: permission?.appAddress,
          allowed: permission?.allowed,
          granteeAddress: permission?.granteeAddress,
          params:
            permission?.params?.map((param: any) => ({
              argumentId: param?.argumentId,
              operationType: param?.operationType,
              argumentValue: param?.argumentValue,
            })) || [],
          roleHash: permission?.roleHash,
        })
      ),
      name: artifactRoleData?.name,
      params: artifactRoleData?.params,
    }
  })

  const data: AppData = {
    address: app.address,
    appId: app.appId,
    artifact: artifact,
    codeAddress: app.version?.codeAddress,
    contentUri: version?.contentUri,
    isForwarder: app.isForwarder,
    isUpgradeable: app.isUpgradeable,
    kernelAddress: app.organization?.address,
    manifest: app.manifest,
    name: app.repoName,
    registry: app.repo?.registry?.name,
    registryAddress: app.repo?.registry?.address,
    repoData: app.repo,
    repoAddress: app.repo?.address,
    rolesData: rolesData,
    version: version?.semanticVersion.replace(/,/g, '.'),
  }

  return new App(data, organization)
}

export async function parseApp(
  result: QueryResult,
  organization: Organization
): Promise<App> {
  const app = result?.data?.app

  if (app === null) {
    throw new ErrorNotFound('No app found.')
  }

  if (!app) {
    throw new ErrorUnexpectedResult('Unable to parse app.')
  }

  const version = _getAppVerson(app)

  const artifact = resolveArtifact(
    organization.connection.ipfs,
    version?.artifact,
    version?.contentUriri,
    app.appId
  )

  return _parseApp(app, version, artifact, organization)
}

export async function parseApps(
  result: QueryResult,
  organization: Organization
): Promise<App[]> {
  const data = result?.data
  const apps = data?.organization?.apps

  if (!apps || data?.organization === null) {
    throw new ErrorUnexpectedResult('Unable to parse apps.')
  }

  const artifacts = await Promise.all(
    apps.map((app: any) => {
      const version = _getAppVerson(app)
      return resolveArtifact(
        organization.connection.ipfs,
        version?.artifact,
        version?.contentUriri,
        app.appId
      )
    })
  )

  return apps.map((app: any, index: number) => {
    const version = _getAppVerson(app)
    return _parseApp(app, version, artifacts[index], organization)
  })
}
