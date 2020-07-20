import { SubscriptionHandler } from '@aragon/connect-types'
import { GraphQLWrapper, QueryResult } from '@aragon/connect-thegraph'
import { IVotingConnector } from '../types'
import Vote from '../entities/Vote'
import Cast from '../entities/Cast'
import * as queries from './queries'
import { parseVotes, parseCasts } from './parsers'

export function subgraphUrlFromChainId(chainId: number) {
  if (chainId === 1) {
    return 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-mainnet'
  }
  if (chainId === 4) {
    return 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby'
  }
  return null
}

export default class VotingConnectorTheGraph implements IVotingConnector {
  #gql: GraphQLWrapper

  constructor(subgraphUrl: string, verbose: boolean = false) {
    if (!subgraphUrl) {
      throw new Error(
        'VotingConnectorTheGraph requires subgraphUrl to be passed.'
      )
    }
    this.#gql = new GraphQLWrapper(subgraphUrl, verbose)
  }

  async votesForApp(
    appAddress: string,
    first: number,
    skip: number
  ): Promise<Vote[]> {
    return this.#gql.performQueryWithParser(
      queries.ALL_VOTES('query'),
      { appAddress, first, skip },
      (result: QueryResult) => parseVotes(result, this)
    )
  }

  onVotesForApp(appAddress: string, callback: Function): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser(
      queries.ALL_VOTES('subscription'),
      { appAddress, first: 1000, skip: 0 },
      callback,
      (result: QueryResult) => parseVotes(result, this)
    )
  }

  async castsForVote(
    voteId: string,
    first: number,
    skip: number
  ): Promise<Cast[]> {
    return this.#gql.performQueryWithParser(
      queries.CASTS_FOR_VOTE('query'),
      { voteId, first, skip },
      (result: QueryResult) => parseCasts(result)
    )
  }

  onCastsForVote(voteId: string, callback: Function): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser(
      queries.CASTS_FOR_VOTE('subscription'),
      { voteId, first: 1000, skip: 0 },
      callback,
      (result: QueryResult) => parseCasts(result)
    )
  }
}