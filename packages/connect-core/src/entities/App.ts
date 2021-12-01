import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'

import { appIntent } from '../utils/intent'
import {
  Abi,
  AragonArtifact,
  AragonManifest,
  AppData,
  PathOptions,
} from '../types'
import ForwardingPath from './ForwardingPath'
import Organization from './Organization'
import Repo from './Repo'
import Role from './Role'

// TODO:
// [ ] (ipfs) contentUrl 	String 	The HTTP URL of the app content. Uses the IPFS HTTP provider. E.g. http://gateway.ipfs.io/ipfs/QmdLEDDfi…/ (ContentUri passing through the resolver)

export default class App {
  readonly address: string
  readonly appId: string
  readonly artifact: AragonArtifact
  readonly codeAddress: string
  readonly contentUri?: string
  readonly isForwarder?: boolean
  readonly isUpgradeable?: boolean
  readonly kernelAddress: string
  readonly manifest?: AragonManifest
  readonly name?: string
  readonly organization: Organization
  readonly registry?: string
  readonly registryAddress: string
  readonly repoAddress?: string
  readonly repo: Repo
  readonly roles: Role[]
  readonly version?: string

  constructor(data: AppData, organization: Organization) {
    this.address = data.address
    this.appId = data.appId
    this.artifact = data.artifact
    this.codeAddress = data.codeAddress
    this.contentUri = data.contentUri
    this.isForwarder = data.isForwarder
    this.isUpgradeable = data.isUpgradeable
    this.kernelAddress = data.kernelAddress
    this.manifest = data.manifest
    this.name = data.name
    this.organization = organization
    this.registry = data.registry
    this.registryAddress = data.registryAddress
    this.repoAddress = data.repoAddress
    this.version = data.version
    this.repo = new Repo(data.repoData)
    this.roles = data.rolesData.map((roleData) => new Role(roleData)) || []
  }

  get provider(): Provider {
    return this.organization.connection.ethersProvider
  }

  get abi(): Abi {
    return this.artifact.abi
  }

  toJSON() {
    return {
      ...this,
      // Organization creates a cycling reference that makes
      // the object impossible to pass through JSON.stringify().
      organization: null,
    }
  }

  ethersContract(): Contract {
    if (!this.abi) {
      throw new Error(
        `No ABI specified in app for ${this.address}. Make sure the metada for the app is available`
      )
    }
    return new Contract(this.address, this.abi, this.provider)
  }

  ethersInterface(): Interface {
    if (!this.abi) {
      throw new Error(
        `No ABI specified in app for ${this.address}. Make sure the metada for the app is available`
      )
    }
    return new Interface(this.abi)
  }

  /**
   * Calculate the forwarding path for an app action
   * that invokes `methodSignature` with `params`.
   *
   * @param  {string} methodSignature
   * @param  {Array<*>} params
   * @param  {Object} options
   * @return {Promise<ForwardingPath>} An object that represents the forwarding path corresponding to an action.
   */
  async intent(
    methodSignature: string,
    params: any[],
    options: PathOptions = {}
  ): Promise<ForwardingPath> {
    const sender = options.actAs || this.organization.connection.actAs
    if (!sender) {
      throw new Error(
        `No sender address specified. Use 'actAs' option or set one as default on your organization connection.`
      )
    }

    const installedApps = await this.organization.apps()

    return appIntent(
      sender,
      this,
      methodSignature,
      params,
      installedApps,
      this.provider
    )
  }
}
