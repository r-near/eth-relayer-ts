import { type LightClientUpdate, LightClientUpdateSchema } from "./near";
import { LightClientUpdateZodSchema } from "./zod";
import fs from "node:fs";


function deserialize() {
    // Deserialize truth
    const buffer = fs.readFileSync("first_light_client_update_borsh.bin")
    const update = LightClientUpdateSchema.deserialize(buffer)
    console.log(update)
}

function serialize() {
    // Serialize
    const buffer = fs.readFileSync("light_client_updates_goerli_5262172-5262492.json")
    const updates = JSON.parse(buffer.toString())
    const update: LightClientUpdate = updates[0]
    const parsedUpdate = LightClientUpdateZodSchema.parse(update)
    const borshSerialized = LightClientUpdateSchema.serialize(parsedUpdate)
    console.log(borshSerialized)
    // Write it as hex
    const hex = Buffer.from(borshSerialized).toString("hex")
    // Write it to a file
    fs.writeFileSync("data.bin", hex)
}

serialize()

