import type { BitArray } from "@chainsafe/ssz"

export function hexToU8Array(parentRoot: Uint8Array | BitArray): number[] {
  if (parentRoot instanceof Uint8Array) {
    return Array.from(parentRoot)
  }
  return Array.from(parentRoot.uint8Array)
}
