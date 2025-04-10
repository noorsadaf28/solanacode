import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import idl from "./my_solana_dapp.json"; // The path to your JSON IDL file
console.log("Program ID", idl.address)
const programID = new PublicKey(idl.address);
const network = "http://127.0.0.1:8898"; // Adjust for your environment: local, devnet, or mainnet-beta
const opts = { preflightCommitment: "processed" };

const App = () => {
  const wallet = useAnchorWallet();
  const { connected } = useWallet();
  const [greetingAccountPublicKey, setGreetingAccountPublicKey] =
    useState(null);
  const [error, setError] = useState("");

  const getProvider = () => {
    if (!wallet) return null;
    const connection = new Connection(network, opts.preflightCommitment);
    return new AnchorProvider(connection, wallet, opts.preflightCommitment);
  };

  const createGreeting = async () => {
    setError("");
    if (!connected) {
      setError("Wallet is not connected.");
      return;
    }
    const provider = getProvider();
    if (!provider) {
      setError("Provider is not available.");
      return;
    }
    const program = new Program(idl, programID, provider);
    try {
      // const greetingAccount = Keypair.generate();
      // console.log("🚀 ~ createGreeting ~ greetingAccount:", greetingAccount)

      // Generate a new Keypair
      const greetingAccount = Keypair.generate();
      console.log('Generated Public Key:', greetingAccount.publicKey.toBase58());

      // Request airdrop of 1 SOL
      const connection = new Connection(network, opts.preflightCommitment);
      const airdropSignature = await connection.requestAirdrop(
        greetingAccount.publicKey,
        LAMPORTS_PER_SOL// 1 SOL
      );

      // Confirm the transaction
      await connection.confirmTransaction(airdropSignature, 'confirmed');

      // Check balance
      const balance = await connection.getBalance(greetingAccount.publicKey);
      console.log('Balance after airdrop:', balance / LAMPORTS_PER_SOL, 'SOL');

      // await program.rpc.createGreeting({
      //   accounts: {
      //     greeting_account: greetingAccount.publicKey,
      //     user: provider.wallet.publicKey,
      //     system_program: SystemProgram.programId,
      //   },
      //   signers: [greetingAccount],
      // });
      await program.methods
      .createGreeting()
      .accounts({
        greetingAccount: greetingAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([greetingAccount])
      .rpc();
      console.log("Greeting account created!");
      setGreetingAccountPublicKey(greetingAccount.publicKey.toString());
    } catch (err) {
      console.error("Error creating greeting account:", err);
      setError("Failed to create greeting account. Please try again.");
    }
  };

  const incrementGreeting = async () => {
    setError("");
    if (!connected) {
      setError("Wallet is not connected.");
      return;
    }
    if (!greetingAccountPublicKey) {
      setError("Greeting account not created or public key not set.");
      return;
    }
    const provider = getProvider();
    if (!provider) {
      setError("Provider is not available.");
      return;
    }
    const program = new Program(idl, programID, provider);
    try {
      await program.rpc.incrementGreeting({
        accounts: {
          greetingAccount: new PublicKey(greetingAccountPublicKey),
          user: provider.wallet.publicKey,
        },
        signers: [],
      });
      console.log("Greeting incremented!");
    } catch (err) {
      console.error("Error incrementing greeting:", err);
      setError("Failed to increment greeting. Please try again.");
    }
  };

  return (
    <div>
      <WalletMultiButton />
      <WalletDisconnectButton />
      <button onClick={createGreeting}>Create Greeting</button>
      {greetingAccountPublicKey && (
        <button onClick={incrementGreeting}>Increment Greeting</button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default App;



// import React, { useState } from "react";
// import {
//   Connection,
//   PublicKey,
//   SystemProgram,
// } from "@solana/web3.js";
// import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
// import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
// import {
//   WalletMultiButton,
//   WalletDisconnectButton,
// } from "@solana/wallet-adapter-react-ui";
// import idl from "./my_solana_dapp.json"; // Your generated IDL file
// import {Buffer} from "buffer";
// const programID = new PublicKey(idl.address); // Make sure IDL address matches deployed program
// const network = "http://127.0.0.1:8898"; // Local validator port
// const opts = { preflightCommitment: "processed" };
// const GREETING_SEED = "greeting";

// const App = () => {
//   const wallet = useAnchorWallet();
//   const { connected } = useWallet();
//   const [greetingAccountPubkey, setGreetingAccountPubkey] = useState(null);
//   const [error, setError] = useState("");
//   const [counter, setCounter] = useState(null);

//   const getProvider = () => {
//     if (!wallet) return null;
//     const connection = new Connection(network, opts.preflightCommitment);
//     return new AnchorProvider(connection, wallet, opts);
//   };

//   const getPDA = async () => {
//     if (!wallet) return null;
//     return await PublicKey.findProgramAddressSync(
//       [Buffer.from(GREETING_SEED), wallet.publicKey.toBuffer()],
//       programID
//     );
//   };

//   const createGreeting = async () => {
//     setError("");
//     const provider = getProvider();
//     if (!provider) {
//       setError("Wallet not connected or provider not ready.");
//       return;
//     }

//     const program = new Program(idl, programID, provider);
//     const [greetingPDA] = await getPDA();

//     try {
//       await program.methods
//         .createGreeting()
//         .accounts({
//           greetingAccount: greetingPDA,
//           user: provider.wallet.publicKey,
//           systemProgram: SystemProgram.programId,
//         })
//         .rpc();

//         // await program.rpc.createGreeting({
//         //           accounts: {
//         //             greeting_account: greetingPDA,
//         //             user: provider.wallet.publicKey,
//         //             system_program: SystemProgram.programId,
//         //           },
//         //           signers: [greetingAccount],
//         //         });

//       console.log("Greeting account created:", greetingPDA.toBase58());
//       setGreetingAccountPubkey(greetingPDA.toBase58());
//     } catch (err) {
//       console.error("Create greeting failed:", err);
//       setError("Failed to create greeting account.");
//     }
//   };

//   const incrementGreeting = async () => {
//     setError("");
//     const provider = getProvider();
//     if (!provider) {
//       setError("Wallet not connected or provider not ready.");
//       return;
//     }

//     const program = new Program(idl, programID, provider);
//     const [greetingPDA] = await getPDA();

//     try {
//       await program.methods
//         .incrementGreeting()
//         .accounts({
//           greetingAccount: greetingPDA,
//         })
//         .rpc();

//       console.log("Greeting incremented!");
//       await fetchGreeting();
//     } catch (err) {
//       console.error("Increment failed:", err);
//       setError("Failed to increment greeting.");
//     }
//   };

//   const fetchGreeting = async () => {
//     const provider = getProvider();
//     const program = new Program(idl, programID, provider);
//     const [greetingPDA] = await getPDA();

//     try {
//       const account = await program.account.greetingAccount.fetch(greetingPDA);
//       setCounter(account.counter.toString());
//       setGreetingAccountPubkey(greetingPDA.toBase58());
//     } catch (err) {
//       console.error("Fetch failed:", err);
//       setError("Could not fetch greeting account.");
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Solana Greeting DApp</h1>
//       <WalletMultiButton />
//       <WalletDisconnectButton />
//       <div style={{ marginTop: "20px" }}>
//         <button onClick={createGreeting}>Create Greeting</button>
//         <button onClick={incrementGreeting} disabled={!greetingAccountPubkey}>
//           Increment Greeting
//         </button>
//         <button onClick={fetchGreeting} disabled={!greetingAccountPubkey}>
//           Refresh Counter
//         </button>
//         {greetingAccountPubkey && (
//           <p>Greeting Account: {greetingAccountPubkey}</p>
//         )}
//         {counter !== null && <p>Counter: {counter}</p>}
//         {error && <p style={{ color: "red" }}>{error}</p>}
//       </div>
//     </div>
//   );
// };

// export default App;