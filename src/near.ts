import { getTestnetRpcProvider, callViewMethod } from '@near-js/client';
import { LightClientStateSchema } from './borsh.js';
import { b } from '@zorsh/zorsh'
import { H256 } from './borsh.js';

export enum ClientMode {
    SubmitLightClientUpdate = 0,
    SubmitHeader = 1
}
const ClientModeSchema = b.nativeEnum(ClientMode)

const ACCOUNT_ID = 'client-eth2.sepolia.testnet'

export class Contract {
    private async callContractView<T>(
        methodName: string,
        schema: { deserialize: (buffer: Buffer) => T },
    ): Promise<T> {
        const data = await callViewMethod({
            account: ACCOUNT_ID,
            method: methodName,
            deps: { rpcProvider: getTestnetRpcProvider() },
            args: {}
        });

        return schema.deserialize(Buffer.from(data.result));
    }


    async getFinalizedBeaconBlockHash(): Promise<string> {
        const hash = await this.callContractView('finalized_beacon_block_root', H256);
        return `0x${Buffer.from(hash).toString('hex')}`;
    }

    async getFinalizedBeaconBlockSlot(): Promise<bigint> {
        return this.callContractView('finalized_beacon_block_slot', b.u64());
    }

    async getClientMode(): Promise<ClientMode> {
        return this.callContractView(
            'get_client_mode',
            ClientModeSchema,
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

export default Contract
