import { http, createPublicClient } from "viem"
import { sepolia } from "viem/chains"

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})
const block = await publicClient.getBlock()
console.log(block)
