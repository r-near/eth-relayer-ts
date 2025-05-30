import { b } from "@zorsh/zorsh"

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

/** 64-bit hash (8 bytes) */
const H64 = b.array(b.u8(), 8)

/** 160-bit hash (20 bytes) - typically used for Ethereum addresses */
const H160 = b.array(b.u8(), 20)

/** 256-bit hash (32 bytes) - standard for most blockchain hashes */
const H256 = b.array(b.u8(), 32)

/** 256-bit unsigned integer represented as 4 x 64-bit words */
const U256 = b.array(b.u64(), 4)

/** Ethereum address (160-bit hash) */
const Address = H160

/** Bloom filter for efficient log filtering (256 x 64-bit words) */
const Bloom = b.array(b.u64(), 256)

/** Slot number in the beacon chain */
const Slot = b.u64()

// ============================================================================
// CRYPTOGRAPHIC TYPES
// ============================================================================

/** BLS public key (48 bytes) */
const PublicKeyBytesSchema = b.array(b.u8(), 48)
export type PublicKeyBytes = b.infer<typeof PublicKeyBytesSchema>

/** BLS signature (96 bytes) */
const SignatureBytesSchema = b.array(b.u8(), 96)
export type SignatureBytes = b.infer<typeof SignatureBytesSchema>

/** Sync committee participation bits (64 bytes, one bit per committee member) */
const SyncCommitteeBitsSchema = b.array(b.u8(), 64)
export type SyncCommitteeBits = b.infer<typeof SyncCommitteeBitsSchema>

// ============================================================================
// BEACON CHAIN / CONSENSUS LAYER TYPES
// ============================================================================

/** Collection of public keys for sync committee members */
const SyncCommitteePublicKeysSchema = b.vec(PublicKeyBytesSchema)
export type SyncCommitteePublicKeys = b.infer<typeof SyncCommitteePublicKeysSchema>

/** Sync committee structure containing member public keys and aggregate key */
const SyncCommitteeSchema = b.struct({
  pubkeys: SyncCommitteePublicKeysSchema,
  aggregate_pubkey: PublicKeyBytesSchema,
})
export type SyncCommittee = b.infer<typeof SyncCommitteeSchema>

/** Aggregated signature and participation bits from sync committee */
const SyncAggregateSchema = b.struct({
  sync_committee_bits: SyncCommitteeBitsSchema,
  sync_committee_signature: SignatureBytesSchema,
})
export type SyncAggregate = b.infer<typeof SyncAggregateSchema>

/** Beacon block header containing essential block metadata */
const BeaconBlockHeaderSchema = b.struct({
  slot: Slot,
  proposer_index: b.u64(),
  parent_root: H256,
  state_root: H256,
  body_root: H256,
})
export type BeaconBlockHeader = b.infer<typeof BeaconBlockHeaderSchema>

/** Extended beacon block header with additional execution layer information */
const ExtendedBeaconBlockHeaderSchema = b.struct({
  header: BeaconBlockHeaderSchema,
  beacon_block_root: H256,
  execution_block_hash: H256,
})
export type ExtendedBeaconBlockHeader = b.infer<typeof ExtendedBeaconBlockHeaderSchema>

// ============================================================================
// EXECUTION LAYER TYPES
// ============================================================================

/** Execution layer block header (similar to Ethereum 1.0 block header) */
const BlockHeaderSchema = b.struct({
  // Core block identification
  parent_hash: H256,
  uncles_hash: H256,
  author: Address,

  // State and transaction data
  state_root: H256,
  transactions_root: H256,
  receipt_root: H256,
  log_bloom: Bloom,

  // Block metadata
  difficulty: U256,
  number: b.u64(),
  gas_limit: U256,
  gas_used: U256,
  timestamp: b.u64(),
  extra_data: b.vec(b.u8()),
  mix_hash: H256,
  nonce: H64,

  // EIP-1559 and later features (optional for backward compatibility)
  base_fee_per_gas: b.option(b.u64()),
  withdrawals_root: b.option(H256),
  blob_gas_used: b.option(b.u64()),
  excess_blob_gas: b.option(b.u64()),
  parent_beacon_block_root: b.option(H256),
  requests_hash: b.option(H256),

  // Computed hashes (optional, may be calculated)
  hash: b.option(H256),
  partial_hash: b.option(H256),
})
export type BlockHeader = b.infer<typeof BlockHeaderSchema>

// ============================================================================
// LIGHT CLIENT UPDATE TYPES
// ============================================================================

/** Header update containing beacon header and execution block information */
const HeaderUpdateSchema = b.struct({
  beacon_header: BeaconBlockHeaderSchema,
  execution_block_hash: H256,
  execution_hash_branch: b.vec(H256),
})
export type HeaderUpdate = b.infer<typeof HeaderUpdateSchema>

/** Finalized header update with Merkle proofs */
const FinalizedHeaderUpdateSchema = b.struct({
  header_update: HeaderUpdateSchema,
  finality_branch: b.vec(H256),
})
export type FinalizedHeaderUpdate = b.infer<typeof FinalizedHeaderUpdateSchema>

/** Sync committee update with Merkle proofs */
const SyncCommitteeUpdateSchema = b.struct({
  next_sync_committee: SyncCommitteeSchema,
  next_sync_committee_branch: b.vec(H256),
})
export type SyncCommitteeUpdate = b.infer<typeof SyncCommitteeUpdateSchema>

/** Complete light client update containing all necessary information */
export const LightClientUpdateSchema = b.struct({
  attested_beacon_header: BeaconBlockHeaderSchema,
  sync_aggregate: SyncAggregateSchema,
  signature_slot: Slot,
  finality_update: FinalizedHeaderUpdateSchema,
  sync_committee_update: b.option(SyncCommitteeUpdateSchema),
})
export type LightClientUpdate = b.infer<typeof LightClientUpdateSchema>

export const LightClientStateSchema = b.struct({
  finalized_beacon_header: ExtendedBeaconBlockHeaderSchema,
  current_sync_committee: SyncCommitteeSchema,
  next_sync_committee: SyncCommitteeSchema,
})
export type LightClientState = b.infer<typeof LightClientStateSchema>


// ============================================================================
// INITIALIZATION TYPES
// ============================================================================

/** Initial configuration for light client */
const InitInputSchema = b.struct({
  network: b.string(),
  finalized_execution_header: BlockHeaderSchema,
  finalized_beacon_header: ExtendedBeaconBlockHeaderSchema,
  current_sync_committee: SyncCommitteeSchema,
  next_sync_committee: SyncCommitteeSchema,
  validate_updates: b.bool(),
  verify_bls_signatures: b.bool(),
  hashes_gc_threshold: b.u64(),
  trusted_signer: b.option(b.string()),
})
export type InitInput = b.infer<typeof InitInputSchema>

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Export commonly used primitive schemas for external use
export {
  H64,
  H160,
  H256,
  U256,
  Address,
  Bloom,
  Slot,
  BeaconBlockHeaderSchema,
  BlockHeaderSchema,
  SyncCommitteeSchema,
}