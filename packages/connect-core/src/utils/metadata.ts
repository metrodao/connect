import { AragonArtifact } from "../types"
import { ErrorInvalid, IpfsResolver } from ".."
import { getApmInternalAppInfo, getAragonOsInternalAppInfo, hasAppInfo } from "./overrides"


function parseMetadata(name: string, metadata: string): any {
  try {
    return JSON.parse(metadata)
  } catch (error) {
    throw new ErrorInvalid(`Can’t parse ${name}: invalid JSON.`)
  }
}

async function fetchMetadata(
  ipfs: IpfsResolver,
  fileName: string,
  contentUri: string
): Promise<object> {
  const cid = contentUri.match(/ipfs:(.*)/)?.[1]
  return cid ? ipfs.json(cid, fileName) : {}
}

export async function resolveMetadata(
  ipfs: IpfsResolver,
  fileName: string,
  contentUri?: string | null,
  metadata?: string | null
): Promise<any> {
  if (metadata) {
    return parseMetadata(fileName, metadata)
  }
  if (contentUri) {
    return fetchMetadata(ipfs, fileName, contentUri)
  }
  return {}
}

export async function resolveArtifact(
  ipfs: IpfsResolver,
  artifact?: string | null,
  contentUri?: string,
  appId?: string
): Promise<AragonArtifact> {
  if (appId && hasAppInfo(appId, 'apm')) {
    return getApmInternalAppInfo(appId)
  }
  if (appId && hasAppInfo(appId, 'aragon')) {
    return getAragonOsInternalAppInfo(appId)
  }
  return resolveMetadata(ipfs, 'artifact.json', contentUri, artifact)
}
