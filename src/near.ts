import { getTestnetRpcProvider, callViewMethod } from '@near-js/client';
import { LightClientStateSchema, LightClientUpdateSchema, LightClientState } from './borsh.js';
import { b } from '@zorsh/zorsh'
import { H256 } from './borsh.js';

enum ClientMode {
    SubmitLightClientUpdate,
    SubmitHeader
}
const ClientModeSchema = b.nativeEnum(ClientMode)

const ACCOUNT_ID = 'client-eth2.sepolia.testnet'

class Contract {
    private async callContractView<T>(
        methodName: string,
        schema: { deserialize: (buffer: Buffer) => T },
        postProcess?: (data: T) => any
    ): Promise<T | any> {
        const data = await callViewMethod({
            account: ACCOUNT_ID,
            method: methodName,
            deps: { rpcProvider: getTestnetRpcProvider() },
            args: {}
        });

        const result = schema.deserialize(Buffer.from(data.result));
        return postProcess ? postProcess(result) : result;
    }


    async getFinalizedBeaconBlockHash(): Promise<string> {
        const hash = await this.callContractView('finalized_beacon_block_root', H256);
        return '0x' + Buffer.from(hash).toString('hex');
    }

    async getFinalizedBeaconBlockSlot(): Promise<bigint> {
        return this.callContractView('finalized_beacon_block_slot', b.u64());
    }

    async getClientMode(): Promise<string> {
        return this.callContractView(
            'get_client_mode',
            ClientModeSchema,
            (mode) => ClientMode[mode]
        );
    }

    async getLightClientState() {
        return this.callContractView('get_light_client_state', LightClientStateSchema);
    }

    async getLastBlockNumber(): Promise<bigint> {
        return this.callContractView('last_block_number', b.u64());
    }

    async getUnfinalizedTailBlockNumber(): Promise<bigint | null> {
        return this.callContractView('get_unfinalized_tail_block_number', b.option(b.u64()));
    }

}

const contract = new Contract()
console.log('Client Mode:', await contract.getClientMode());
console.log('Beacon Slot:', await contract.getFinalizedBeaconBlockSlot());
console.log('Block Hash:', await contract.getFinalizedBeaconBlockHash());
console.log('Light Client State:', await contract.getLightClientState());
console.log('Last Block Number:', await contract.getLastBlockNumber());
console.log('Unfinalized Tail:', await contract.getUnfinalizedTailBlockNumber());
