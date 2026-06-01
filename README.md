# VaultPay - Completed Implementation

This project implements a complete EVM payment dApp with a virtual ERC20 token (`tUSD`). All requirements have been successfully implemented and tested using a local Hardhat environment (no mainnet or real assets).

## Implemented Features

### Smart Contract (`contracts/VaultPay.sol`)

The following functions have been implemented and tested:

- `createPayment` – escrows `tUSD`, stores payment details, emits `PaymentCreated`  
- `claimPayment` – only the recipient can claim; emits `PaymentClaimed`  
- `cancelPayment` – only the payer can cancel after the deadline; refunds the payer and emits `PaymentCancelled`  
- `getPayment` – returns the full payment details for a given payment ID  

### React UI (`frontend/`)

The frontend provides a complete user interface with:

- Wallet connection (MetaMask)  
- Display of `tUSD` balance  
- Faucet to request test tokens  
- Token approval for the VaultPay contract  
- Create / Claim / Cancel payment flows  
- Real‑time transaction status feedback  

### Testing

All contract functions are covered by automated tests (`test/VaultPay.test.ts`). Tests pass successfully.

## How to Run the Completed Project

From the repository root:

```bash
npm install
npm run compile
npm run test
```

Then run the local stack in **three separate terminals** (keep each process running):

| Terminal | Command                        | Purpose                                                       |
|----------|--------------------------------|---------------------------------------------------------------|
| 1        | `npm run node`                 | Hardhat JSON‑RPC server on port 8545                         |
| 2        | `npm run deploy:local`         | Deploys `MockTUSD` and `VaultPay` (run after terminal 1 is up) |
| 3        | `cd frontend && npm install && npm run dev` | Vite dev server on port 5173                          |

After deployment, copy the printed contract addresses into  
`frontend/src/config.ts`:

```ts
export const TOKEN_ADDRESS = "0x...";
export const VAULTPAY_ADDRESS = "0x...";
```

### Open the App

In your browser, go to **http://127.0.0.1:5173/** (recommended on Windows).  
`http://localhost:5173/` also works once the server listens on IPv4.

### Configure MetaMask

1. Add a custom network:  
   - RPC URL: `http://127.0.0.1:8545`  
   - Chain ID: `31337`  
2. Import a test account private key shown in the `npm run node` output.  
   **Important:** Do **not** use port `5173` for MetaMask – that port is only for the web UI.

### Troubleshooting `ERR_CONNECTION_REFUSED`

If you see this error, the dev server is not running or is bound only to IPv6.  
Stop the frontend (`Ctrl+C`), run `npm run dev` again from the `frontend/` folder, then use `http://127.0.0.1:5173/` (not port 8545).  

Verify with:
```bash
netstat -ano | findstr 5173
```
It should show `0.0.0.0:5173` or `127.0.0.1:5173`, not only `[::1]:5173`.

