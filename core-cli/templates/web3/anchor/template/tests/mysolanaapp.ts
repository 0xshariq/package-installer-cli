import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Mysolanaapp } from "../target/types/mysolanaapp";
import assert from "assert";

describe("mysolanaapp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Mysolanaapp as Program<Mysolanaapp>;
  const baseAccount = anchor.web3.Keypair.generate();

  it("Initialize the account!", async () => {
    await program.methods.initialize()
      .accounts({
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([baseAccount])
      .rpc();

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    assert.ok(account.data.eq(new anchor.BN(42)));
  });
});
