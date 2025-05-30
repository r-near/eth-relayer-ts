import { ClientMode, Contract } from "./near.js";
import { publicClient } from "./execution.js";

const contract = new Contract()
const mode = await contract.getClientMode()
console.log(mode)

if (mode === ClientMode.SubmitLightClientUpdate) {
    const [
        finalizedBeaconBlockHash,
        finalizedBeaconBlockSlot,
        lightClientState
    ] = await Promise.all([
        contract.getFinalizedBeaconBlockHash(),
        contract.getFinalizedBeaconBlockSlot(),
        contract.getLightClientState()
    ])
    console.log(finalizedBeaconBlockHash, finalizedBeaconBlockSlot, lightClientState)
} else if (mode === ClientMode.SubmitHeader) {
    const blockNumber = await contract.getLastBlockNumber()
    const block = await publicClient.getBlock({ blockNumber })
    console.log(blockNumber, block)
}
// Check the submission mode
