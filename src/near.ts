import { b } from "@zorsh/zorsh"

const H64 = b.array(b.u64(), 8)
const H160 = b.array(b.u64(), 20)
const H256 = b.array(b.u64(), 32)
const Bloom = b.array(b.u64(), 256)

const U256 = b.array(b.u64(), 4)

const Address = H160

const PublicKeyBytesSchema = b.array(b.u8(), 48)
export type PublicKeyBytes = b.infer<typeof PublicKeyBytesSchema>

const SyncCommitteePublicKeysSchema = b.vec(PublicKeyBytesSchema)
export type SyncCommitteePublicKeys = b.infer<typeof SyncCommitteePublicKeysSchema>

const SyncCommitteeSchema = b.struct({
  pubkeys: SyncCommitteePublicKeysSchema,
  aggregate_pubkey: PublicKeyBytesSchema,
})
export type SyncCommittee = b.infer<typeof SyncCommitteeSchema>

const BeaconBlockHeaderSchema = b.struct({
  slot: b.u64(),
  proposer_index: b.u64(),
  parent_root: H256,
  state_root: H256,
  body_root: H256,
})
export type BeaconBlockHeader = b.infer<typeof BeaconBlockHeaderSchema>

const ExtendedBeaconBlockHeaderSchema = b.struct({
  header: BeaconBlockHeaderSchema,
  beacon_block_root: H256,
  execution_block_hash: H256,
})
export type ExtendedBeaconBlockHeader = b.infer<typeof ExtendedBeaconBlockHeaderSchema>

const BlockHeaderSchema = b.struct({
  parent_hash: H256,
  uncles_hash: H256,
  author: Address,
  state_root: H256,
  transactions_root: H256,
  receipt_root: H256,
  log_bloom: Bloom,
  difficulty: U256,
  number: b.u64(),
  gas_limit: U256,
  gas_used: U256,
  timestamp: b.u64(),
  extra_data: b.vec(b.u8()),
  mix_hash: H256,
  nonce: H64,
  base_fee_per_gas: b.option(b.u64()),
  withdrawals_root: b.option(H256),
  blob_gas_used: b.option(b.u64()),
  excess_blob_gas: b.option(b.u64()),
  parent_beacon_block_root: b.option(H256),
  requests_hash: b.option(H256),
  hash: b.option(H256),
  partial_hash: b.option(H256),
})
export type BlockHeader = b.infer<typeof BlockHeaderSchema>

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

const SlotSchema = b.u64()
export type Slot = b.infer<typeof SlotSchema>

const SyncCommitteeBitsSchema = b.array(b.u8(), 64)
export type SyncCommitteeBits = b.infer<typeof SyncCommitteeBitsSchema>

const SignatureBytesSchema = b.array(b.u8(), 96)
export type SignatureBytes = b.infer<typeof SignatureBytesSchema>

const SyncAggregateSchema = b.struct({
  sync_committee_bits: SyncCommitteeBitsSchema,
  sync_committee_signature: SignatureBytesSchema,
})
export type SyncAggregate = b.infer<typeof SyncAggregateSchema>

const HeaderUpdateSchema = b.struct({
  beacon_header: BeaconBlockHeaderSchema,
  execution_block_hash: H256,
  execution_hash_branch: b.vec(H256),
})
export type HeaderUpdate = b.infer<typeof HeaderUpdateSchema>

const FinalizedHeaderUpdateSchema = b.struct({
  header_update: HeaderUpdateSchema,
  finality_branch: b.vec(H256),
})
export type FinalizedHeaderUpdate = b.infer<typeof FinalizedHeaderUpdateSchema>

const SyncCommitteeUpdateSchema = b.struct({
  next_sync_committee: SyncCommitteeSchema,
  next_sync_committee_branch: b.vec(H256),
})
export type SyncCommitteeUpdate = b.infer<typeof SyncCommitteeUpdateSchema>

const LightClientUpdateSchema = b.struct({
  attested_beacon_header: BeaconBlockHeaderSchema,
  sync_aggregate: SyncAggregateSchema,
  signature_slot: SlotSchema,
  finality_update: FinalizedHeaderUpdateSchema,
  sync_committee_update: b.option(SyncCommitteeUpdateSchema),
})
export type LightClientUpdate = b.infer<typeof LightClientUpdateSchema>
