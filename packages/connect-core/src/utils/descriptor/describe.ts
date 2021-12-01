/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-empty */
import {
  tryEvaluatingRadspec,
  tryDescribingUpdateAppIntent,
  postprocessRadspecDescription,
} from '../radspec/index'
import { StepDecoded, StepDescribed, PostProcessDescription } from '../../types'
import { ConnectionContext } from '../..'
import App from '../../entities/App'
import Transaction from '../../entities/Transaction'

export async function describeStep(
  step: StepDecoded,
  installedApps: App[],
  connection: ConnectionContext
): Promise<StepDescribed> {
  let decoratedStep
  // TODO: Add intent Basket support

  // Single transaction step
  // First see if the step can be handled with a specialized descriptor
  try {
    decoratedStep = await tryDescribingUpdateAppIntent(step, installedApps)
  } catch (err) {}

  // Finally, if the step wasn't handled yet, evaluate via radspec normally
  if (!decoratedStep) {
    try {
      decoratedStep = await tryEvaluatingRadspec(
        step,
        installedApps,
        connection
      )
    } catch (err) {}
  }

  // Annotate the description, if one was found
  if (decoratedStep?.description) {
    try {
      const { description, annotatedDescription } =
        await postprocessRadspecDescription(
          decoratedStep.description,
          installedApps
        )
      decoratedStep.description = description
      decoratedStep.annotatedDescription = annotatedDescription ?? []
    } catch (err) {}
  }

  if (decoratedStep?.children) {
    decoratedStep.children = await describePath(
      decoratedStep.children,
      installedApps,
      connection
    )
  }

  return decoratedStep || { ...step, description: '' }
}

/**
 * Use radspec to create a human-readable description for each step in the given `path`
 *
 */
export async function describePath(
  path: StepDecoded[],
  installedApps: App[],
  connection: ConnectionContext
): Promise<StepDescribed[]> {
  return Promise.all(
    path.map(async (step) => describeStep(step, installedApps, connection))
  )
}

export async function describeTransaction(
  transaction: Transaction,
  installedApps: App[],
  connection: ConnectionContext
): Promise<PostProcessDescription> {
  if (!transaction.to) {
    throw new Error(`Could not describe transaction: missing 'to'`)
  }
  if (!transaction.data) {
    throw new Error(`Could not describe transaction: missing 'data'`)
  }

  let description
  try {
    description = await tryEvaluatingRadspec(
      transaction,
      installedApps,
      connection
    )

    if (description) {
      return postprocessRadspecDescription(
        description.description,
        installedApps
      )
    }
  } catch (err) {
    throw new Error(`Could not describe transaction: ${err}`)
  }

  return {
    description,
  }
}
