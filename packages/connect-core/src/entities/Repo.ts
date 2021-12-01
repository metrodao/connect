import {
  AragonArtifact,
  AragonArtifactRole,
  AragonManifest,
  RepoData,
} from '../types'

export default class Repo {
  readonly address: string
  readonly artifact: AragonArtifact
  readonly contentUri?: string
  readonly lastVersion?: string
  readonly manifest?: AragonManifest
  readonly name: string
  readonly registry?: string
  readonly registryAddress?: string
  readonly roles: AragonArtifactRole[]

  constructor(data: RepoData) {
    this.address = data.address
    this.artifact = data.artifact
    this.contentUri = data.contentUri
    this.lastVersion = data.lastVersion
    this.manifest = data.manifest
    this.name = data.name
    this.registry = data.registry
    this.registryAddress = data.registryAddress
    this.roles = data.roles
  }
}
