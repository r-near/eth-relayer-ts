import type { LightClientUpdate } from "../../src/borsh.js"

export const mockValidLightClientUpdate: LightClientUpdate = {
  attested_beacon_header: {
    slot: 7569408n,
    proposer_index: 123n,
    parent_root: new Array(32).fill(0),
    state_root: new Array(32).fill(1),
    body_root: new Array(32).fill(2),
  },
  sync_aggregate: {
    sync_committee_bits: new Array(64).fill(255), // All validators participating
    sync_committee_signature: new Array(96).fill(42),
  },
  signature_slot: 7569409n,
  finality_update: {
    header_update: {
      beacon_header: {
        slot: 7569400n,
        proposer_index: 122n,
        parent_root: new Array(32).fill(3),
        state_root: new Array(32).fill(4),
        body_root: new Array(32).fill(5),
      },
      execution_block_hash: new Array(32).fill(6),
      execution_hash_branch: [new Array(32).fill(7), new Array(32).fill(8), new Array(32).fill(9)],
    },
    finality_branch: [new Array(32).fill(10), new Array(32).fill(11)],
  },
  sync_committee_update: {
    next_sync_committee: {
      pubkeys: new Array(512).fill(new Array(48).fill(12)),
      aggregate_pubkey: new Array(48).fill(13),
    },
    next_sync_committee_branch: [new Array(32).fill(14), new Array(32).fill(15)],
  },
}

export const mockLightClientUpdatePreBellatrix = {
  attestedHeader: {
    beacon: {
      slot: 1000, // Very early slot, before Bellatrix
      proposerIndex: 1,
      parentRoot: new Uint8Array(32),
      stateRoot: new Uint8Array(32),
      bodyRoot: new Uint8Array(32),
    },
  },
  finalizedHeader: {
    beacon: {
      slot: 999,
      proposerIndex: 1,
      parentRoot: new Uint8Array(32),
      stateRoot: new Uint8Array(32),
      bodyRoot: new Uint8Array(32),
    },
  },
  syncAggregate: {
    syncCommitteeBits: new Uint8Array(64),
    syncCommitteeSignature: new Uint8Array(96),
  },
  signatureSlot: 1001,
  finalityBranch: [new Uint8Array(32)],
  nextSyncCommittee: null,
  nextSyncCommitteeBranch: [],
}
