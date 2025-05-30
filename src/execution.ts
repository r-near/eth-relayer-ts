import { http, createPublicClient } from "viem"
import { sepolia } from "viem/chains"

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(undefined, { batch: true }),
})

/**
 * Fetches a range of blocks from the RPC provider in a single batch request.
 * @param startBlock The starting block number (inclusive).
 * @param endBlock The ending block number (inclusive).
 * @returns An array of block objects.
 */
export async function fetchBlockRange(startBlock: number, endBlock: number) {
  const blockNumbers = Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i)
  return await Promise.all(
    blockNumbers.map((blockNumber) => publicClient.getBlock({ blockNumber: BigInt(blockNumber) })),
  )
}

console.log(await fetchBlockRange(8440252, 8440255))
