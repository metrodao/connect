import {
  IpfsResolver,
  ErrorUnexpectedResult,
  PermissionData,
  Role,
  RoleData,
  resolveArtifact,
} from '@1hive/connect-core'
import { QueryResult } from '../types'

function _parseRole(role: any, app: any, artifact: any): Role {
  const artifactRoleData = artifact.roles?.find(
    (r: any) => r.bytes === role.hash
  )

  const roleData: RoleData = {
    ...role,
    appAddress: role?.appAddress,
    hash: role?.roleHash,
    manager: role?.manager,
    appId: app?.appId,
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

  return new Role(roleData)
}

export async function parseRoles(
  result: QueryResult,
  ipfs: IpfsResolver
): Promise<Role[]> {
  const app = result?.data?.app
  const roles = app?.roles

  if (!app || !Array.isArray(roles)) {
    throw new ErrorUnexpectedResult('Unable to parse roles.')
  }

  const artifact = resolveArtifact(
    ipfs,
    app?.version?.artifact,
    app?.version?.contentUriri,
    app?.appId
  )

  return roles.map((role: any) => _parseRole(role, app, artifact))
}
