import { PermissionData, ParamData } from '../types'

export default class Permission implements PermissionData {
  readonly allowed!: boolean
  readonly appAddress!: string
  readonly granteeAddress!: string
  readonly params!: ParamData[]
  readonly roleHash!: string

  constructor(data: PermissionData) {
    this.allowed = data.allowed
    this.appAddress = data.appAddress
    this.granteeAddress = data.granteeAddress
    this.params = data.params
    this.roleHash = data.roleHash
  }
}
