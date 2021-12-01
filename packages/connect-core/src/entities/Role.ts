import { RoleData } from '../types'
import Permission from './Permission'

export default class Role {
  readonly appAddress!: string
  readonly appId!: string
  readonly description?: string
  readonly hash!: string
  readonly params?: string[]
  readonly permissions?: Permission[]
  readonly manager?: string
  readonly name?: string

  constructor(data: RoleData) {
    this.appAddress = data.appAddress
    this.appId = data.appId
    this.description = data?.name
    this.hash = data.hash
    this.manager = data.manager
    this.name = data?.id
    this.params = data?.params
    this.permissions = data.grantees?.map((grantee) => new Permission(grantee))
  }
}
