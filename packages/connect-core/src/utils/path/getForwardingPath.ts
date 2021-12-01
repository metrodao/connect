import type { Address } from '@1hive/connect-types'

import { calculateTransactionPath } from './calculatePath'
import App from '../../entities/App'
import ForwardingPath from '../../entities/ForwardingPath'
import { ConnectionContext } from '../..'

/**
 * Calculate the transaction path for a transaction to `destination`
 * that invokes `methodSignature` with `params`.
 *
 * @param  {string} destination
 * @param  {string} methodSignature
 * @param  {Array<*>} params
 * @param  {string} [finalForwarder] Address of the final forwarder that can perfom the action
 * @return {Promise<Array<Object>>} An array of Ethereum transactions that describe each step in the path
 */
export async function getForwardingPath(
  sender: Address,
  destinationApp: App,
  methodSignature: string,
  params: any[],
  installedApps: App[],
  connection: ConnectionContext,
  finalForwarder?: Address
): Promise<ForwardingPath> {
  const { path, transactions } = await calculateTransactionPath(
    sender,
    destinationApp,
    methodSignature,
    params,
    installedApps,
    connection,
    finalForwarder
  )

  return new ForwardingPath(
    {
      destination: destinationApp,
      path,
      transactions,
    },
    installedApps,
    connection
  )
}
