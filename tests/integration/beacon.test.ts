import { beforeAll, describe, expect, it } from "vitest"
import { BeaconLightClientService } from "../../src/beacon.js"
import { LightClientUpdateSchema } from "../../src/borsh.js"

describe("Beacon API Integration Tests", () => {
  let service: BeaconLightClientService

  beforeAll(() => {
    service = new BeaconLightClientService()
  })

  it("should connect to beacon node and check sync status", async () => {
    const isSyncing = await service.isSyncing()
    expect(typeof isSyncing).toBe("boolean")
  })

  it("should fetch last finalized slot", async () => {
    const slot = await service.getLastFinalizedSlot()
    expect(slot).toBeGreaterThan(0n)
    expect(typeof slot).toBe("bigint")
  })

  it("should fetch period update with sync committee", async () => {
    const update = await service.fetchPeriodUpdate(928)

    expect(update).toBeDefined()
    expect(update.attested_beacon_header.slot).toBeGreaterThan(0n)
    expect(update.sync_committee_update).not.toBeNull() // Period updates should have sync committee
    expect(update.finality_update).toBeDefined()
    expect(update.sync_aggregate).toBeDefined()

    // Validate sync committee structure
    expect(update.sync_committee_update?.next_sync_committee.pubkeys).toHaveLength(512)
    expect(update.sync_committee_update?.next_sync_committee.aggregate_pubkey).toHaveLength(48)
  })

  it("should fetch finality update without sync committee", async () => {
    const update = await service.fetchFinalityUpdate()

    expect(update).toBeDefined()
    expect(update.attested_beacon_header.slot).toBeGreaterThan(0n)
    expect(update.sync_committee_update).toBeNull() // Finality updates don't have sync committee
    expect(update.finality_update).toBeDefined()
    expect(update.sync_aggregate).toBeDefined()
  })

  it("should handle network errors gracefully", async () => {
    // Test with invalid period (too far in future)
    const futureEpoch = Math.floor(Date.now() / 1000 / 12 / 32 / 256) + 1000

    await expect(service.fetchPeriodUpdate(futureEpoch)).rejects.toThrow()
  })
})

it("should fetch, transform, and serialize period 928 update", async () => {
  const service = new BeaconLightClientService()

  // Fetch and transform
  const update = await service.fetchPeriodUpdate(928)

  // Validate structure
  expect(update.attested_beacon_header).toBeDefined()
  expect(update.sync_aggregate).toBeDefined()
  expect(update.finality_update).toBeDefined()
  expect(update.sync_committee_update).not.toBeNull()

  // Serialize
  const serialized = LightClientUpdateSchema.serialize(update)
  expect(serialized).toBeInstanceOf(Uint8Array)
  expect(serialized.length).toBeGreaterThan(1000) // Should be substantial

  // Deserialize and verify round trip
  const deserialized = LightClientUpdateSchema.deserialize(Buffer.from(serialized))
  expect(deserialized).toEqual(update)

  // Compare with Rust reference
  expect(Buffer.from(serialized)).toMatchSnapshot("light-client-update-period-928-borsh")
})

it("should produce consistent results across multiple fetches", async () => {
  const service = new BeaconLightClientService()

  // Fetch the same period twice
  const [update1, update2] = await Promise.all([
    service.fetchPeriodUpdate(928),
    service.fetchPeriodUpdate(928),
  ])

  // Should be identical (beacon chain data is immutable for past periods)
  expect(update1).toEqual(update2)
})
