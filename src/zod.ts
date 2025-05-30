import { z } from "zod"

// Helper to convert hex string to byte array
const hexToBytes = (hex: string): number[] => {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
    const bytes = []
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.slice(i, i + 2), 16))
    }
    return bytes
}

// Zod schema that transforms hex strings to byte arrays
export const LightClientUpdateZodSchema = z.object({
    attested_beacon_header: z.object({
        slot: z.string().transform((slot) => BigInt(slot)),
        proposer_index: z.string().transform((index) => BigInt(index)),
        parent_root: z.string().transform(hexToBytes),
        state_root: z.string().transform(hexToBytes),
        body_root: z.string().transform(hexToBytes),
    }),
    sync_aggregate: z.object({
        sync_committee_bits: z.string().transform(hexToBytes),
        sync_committee_signature: z.string().transform(hexToBytes),
    }),
    signature_slot: z.string().transform((slot) => BigInt(slot)),
    finality_update: z.object({
        header_update: z.object({
            beacon_header: z.object({
                slot: z.string().transform((slot) => BigInt(slot)),
                proposer_index: z.string().transform((index) => BigInt(index)),
                parent_root: z.string().transform(hexToBytes),
                state_root: z.string().transform(hexToBytes),
                body_root: z.string().transform(hexToBytes),
            }),
            execution_block_hash: z.string().transform(hexToBytes),
            execution_hash_branch: z.array(z.string().transform(hexToBytes)),
        }),
        finality_branch: z.array(z.string().transform(hexToBytes)),
    }),
    sync_committee_update: z.null().or(
        z.object({
            next_sync_committee: z.object({
                pubkeys: z.array(z.string().transform(hexToBytes)), // Array of 48-byte pubkeys
                aggregate_pubkey: z.string().transform(hexToBytes), // Single 48-byte pubkey
            }),
            next_sync_committee_branch: z.array(z.string().transform(hexToBytes)), // Array of 32-byte hashes
        })
    ),
})
