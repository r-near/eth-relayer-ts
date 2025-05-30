import { Tree } from "@chainsafe/persistent-merkle-tree"
import { getClient } from "@lodestar/api"
import { createChainForkConfig } from "@lodestar/config"
import { sepoliaChainConfig } from "@lodestar/config/networks"
import { type ForkPostBellatrix, isForkPostBellatrix } from "@lodestar/params"
import type {
  BeaconBlockBody,
  LightClientFinalityUpdate as LodestarLightClientFinalityUpdate,
  LightClientUpdate as LodestarLightClientUpdate,
} from "@lodestar/types"
import { type SSZTypesFor, ssz } from "@lodestar/types"
import type { LightClientUpdate } from "./borsh.js"
import { hexToU8Array } from "./utils.js"

type LodestarUpdate = LodestarLightClientUpdate | LodestarLightClientFinalityUpdate

// Type guard to check if update has sync committee data
function hasSyncCommitteeUpdate(update: LodestarUpdate): update is LodestarLightClientUpdate {
  return "nextSyncCommittee" in update && update.nextSyncCommittee !== undefined
}

export class BeaconLightClientService {
  private readonly config = createChainForkConfig(sepoliaChainConfig)
  private readonly api = getClient(
    { baseUrl: "http://unstable.sepolia.beacon-api.nimbus.team/" },
    { config: this.config },
  )

  /**
   * Fetch light client update for a specific period (includes sync committee update)
   */
  async fetchPeriodUpdate(period: number): Promise<LightClientUpdate> {
    const response = await this.api.lightclient.getLightClientUpdatesByRange({
      startPeriod: period,
      count: 1,
    })

    const update = response.value()[0]
    if (!update) {
      throw new Error(`No light client update found for period ${period}`)
    }

    return this.transformUpdate(update)
  }

  /**
   * Fetch latest finality update (no sync committee update)
   */
  async fetchFinalityUpdate(): Promise<LightClientUpdate> {
    const response = await this.api.lightclient.getLightClientFinalityUpdate()
    return this.transformUpdate(response.value())
  }

  /**
   * Get the last finalized slot from the beacon chain
   */
  async getLastFinalizedSlot(): Promise<bigint> {
    const response = await this.api.beacon.getStateFinalityCheckpoints({ stateId: "head" })
    return BigInt(response.value().finalized.epoch * 32) // Convert epoch to slot
  }

  /**
   * Check if the beacon node is syncing
   */
  async isSyncing(): Promise<boolean> {
    const response = await this.api.node.getSyncingStatus()
    return response.value().isSyncing
  }

  /**
   * Transform Lodestar API response to our BORSH format
   */
  private async transformUpdate(update: LodestarUpdate): Promise<LightClientUpdate> {
    // Fetch beacon block body for execution proof
    const finalizedSlot = update.finalizedHeader.beacon.slot
    const beaconBlockBody = await this.api.beacon.getBlockV2({ blockId: finalizedSlot })
    const blockBody = beaconBlockBody.value().message.body as BeaconBlockBody<ForkPostBellatrix>

    const fork = this.config.getForkName(finalizedSlot)
    if (!isForkPostBellatrix(fork)) {
      throw new Error(`Unsupported fork: ${fork}`)
    }

    const executionBlockHashProof = this.getExecutionBlockHashProof(fork, blockBody)
    const executionHashBranch = executionBlockHashProof.map((proof) => Array.from(proof))

    return {
      attested_beacon_header: {
        slot: BigInt(update.attestedHeader.beacon.slot),
        proposer_index: BigInt(update.attestedHeader.beacon.proposerIndex),
        parent_root: hexToU8Array(update.attestedHeader.beacon.parentRoot),
        state_root: hexToU8Array(update.attestedHeader.beacon.stateRoot),
        body_root: hexToU8Array(update.attestedHeader.beacon.bodyRoot),
      },
      sync_aggregate: {
        sync_committee_bits: hexToU8Array(update.syncAggregate.syncCommitteeBits),
        sync_committee_signature: hexToU8Array(update.syncAggregate.syncCommitteeSignature),
      },
      signature_slot: BigInt(update.signatureSlot),
      finality_update: {
        header_update: {
          beacon_header: {
            slot: BigInt(update.finalizedHeader.beacon.slot),
            proposer_index: BigInt(update.finalizedHeader.beacon.proposerIndex),
            parent_root: hexToU8Array(update.finalizedHeader.beacon.parentRoot),
            state_root: hexToU8Array(update.finalizedHeader.beacon.stateRoot),
            body_root: hexToU8Array(update.finalizedHeader.beacon.bodyRoot),
          },
          execution_block_hash: Array.from(blockBody.executionPayload.blockHash),
          execution_hash_branch: executionHashBranch,
        },
        finality_branch: update.finalityBranch.map(hexToU8Array),
      },
      // Type-safe sync committee update handling
      sync_committee_update: this.transformSyncCommitteeUpdate(update),
    }
  }

  /**
   * Transform sync committee update with proper type checking
   */
  private transformSyncCommitteeUpdate(update: LodestarUpdate) {
    if (!hasSyncCommitteeUpdate(update)) {
      return null
    }

    return {
      next_sync_committee: {
        pubkeys: update.nextSyncCommittee.pubkeys.map(hexToU8Array),
        aggregate_pubkey: hexToU8Array(update.nextSyncCommittee.aggregatePubkey),
      },
      next_sync_committee_branch: update.nextSyncCommitteeBranch.map(hexToU8Array),
    }
  }

  /**
   * Generate merkle proof for execution block hash within beacon block body
   */
  private getExecutionBlockHashProof(
    fork: ForkPostBellatrix,
    body: BeaconBlockBody<ForkPostBellatrix>,
  ): Uint8Array[] {
    const { gindex } = ssz[fork].BeaconBlockBody.getPathInfo(["execution_payload", "block_hash"])
    const bodyView = (
      ssz[fork].BeaconBlockBody as SSZTypesFor<ForkPostBellatrix, "BeaconBlockBody">
    ).toView(body)
    return new Tree(bodyView.node).getSingleProof(BigInt(gindex))
  }

  /**
   * Calculate sync committee period for a given slot
   */
  static getPeriodForSlot(slot: number): number {
    const SLOTS_PER_EPOCH = 32
    const EPOCHS_PER_PERIOD = 256
    return Math.floor(slot / (SLOTS_PER_EPOCH * EPOCHS_PER_PERIOD))
  }
}
