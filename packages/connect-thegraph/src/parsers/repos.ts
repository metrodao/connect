import {
  ErrorNotFound,
  ErrorUnexpectedResult,
  IpfsResolver,
  Repo,
  RepoData,
} from '@1hive/connect-core'
import { resolveMetadata } from '../metadata'
import { QueryResult } from '../types'

export async function parseRepo(
  result: QueryResult,
  ipfs: IpfsResolver
): Promise<Repo> {
  const repo = result?.data?.app?.repo

  if (repo === null) {
    throw new ErrorNotFound('No repo found.')
  }

  if (!repo) {
    throw new ErrorUnexpectedResult('Unable to parse repo.')
  }

  const contentUri = repo?.lastVersion?.contentUri

  const artifact = await resolveMetadata(
    ipfs,
    'artifact.json',
    contentUri,
    repo?.lastVersion?.artifact
  )

  const data: RepoData = {
    address: repo?.address,
    artifact: artifact,
    contentUri: contentUri,
    lastVersion: repo?.lastVersion?.semanticVersion?.replace(/,/g, '.'),
    manifest: await resolveMetadata(
      ipfs,
      'manifest.json',
      contentUri,
      repo?.lastVersion?.manifest
    ),
    name: repo?.name,
    registry: repo?.registry?.name,
    registryAddress: repo?.registry?.address,
    roles: artifact.roles,
  }

  return new Repo(data)
}
