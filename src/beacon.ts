import { getClient } from "@lodestar/api"
import { createChainForkConfig } from "@lodestar/config"
import { sepoliaChainConfig } from "@lodestar/config/networks"
import type { LightClientUpdate } from "@lodestar/types"

const config = createChainForkConfig(sepoliaChainConfig)
const api = getClient({ baseUrl: "http://unstable.sepolia.beacon-api.nimbus.team/" }, { config })

const response = await api.lightclient.getLightClientUpdatesByRange({
  startPeriod: 941,
  count: 1,
})
const update: LightClientUpdate[] = response.value()
console.log(update)

const syncing = await api.node.getSyncingStatus()
console.log(syncing.value().isSyncing)
