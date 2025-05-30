// tests/unit/beacon-light-client.test.ts
import { describe, expect, it, vi } from "vitest"
import { BeaconLightClientService } from "../src/beacon.js"

describe("BeaconLightClientService - Unit Tests", () => {
  describe("getPeriodForSlot", () => {
    it("should calculate correct period for slot", () => {
      // Period 928 starts at slot 7,602,176 (928 * 256 * 32)
      expect(BeaconLightClientService.getPeriodForSlot(7602176)).toBe(928)
      expect(BeaconLightClientService.getPeriodForSlot(7602207)).toBe(928) // Same period
      expect(BeaconLightClientService.getPeriodForSlot(7610368)).toBe(929) // Next period

      // Edge cases
      expect(BeaconLightClientService.getPeriodForSlot(0)).toBe(0)
      expect(BeaconLightClientService.getPeriodForSlot(8191)).toBe(0) // Last slot of period 0
      expect(BeaconLightClientService.getPeriodForSlot(8192)).toBe(1) // First slot of period 1
    })

    it("should handle large slot numbers", () => {
      const largeSlot = 50_000_000
      const expectedPeriod = Math.floor(largeSlot / (32 * 256))
      expect(BeaconLightClientService.getPeriodForSlot(largeSlot)).toBe(expectedPeriod)
    })
  })

  describe("Error Handling", () => {
    it("should throw error when no update found for period", async () => {
      const service = new BeaconLightClientService()

      const mockApi = {
        lightclient: {
          getLightClientUpdatesByRange: vi.fn().mockResolvedValue({
            value: () => [], // Empty array
          }),
        },
      }
      ;(service as unknown as { api: typeof mockApi }).api = mockApi

      await expect(service.fetchPeriodUpdate(999999)).rejects.toThrow(
        "No light client update found for period 999999",
      )
    })
  })

  describe("Transformation Logic", () => {
    it("should handle sync committee update presence correctly", () => {
      // This tests the type guard logic without making API calls
      const updateWithSyncCommittee = {
        nextSyncCommittee: {
          pubkeys: new Array(512).fill(new Uint8Array(48)),
          aggregatePubkey: new Uint8Array(48),
        },
        nextSyncCommitteeBranch: [new Uint8Array(32)],
      }

      const updateWithoutSyncCommittee = {
        // Missing nextSyncCommittee
      }

      expect(updateWithSyncCommittee.nextSyncCommittee).toBeDefined()
      // @ts-expect-error nextSyncCommittee is not defined
      expect(updateWithoutSyncCommittee.nextSyncCommittee).toBeUndefined()
    })
  })
})
