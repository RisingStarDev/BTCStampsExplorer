import { signal } from "@preact/signals";
import { walletContext } from "./wallet.ts";
import { Wallet } from "./wallet.d.ts";
import { getBtcBalance } from "utils/btc.ts";

export const isOKXInstalled = signal<boolean>(false);

export const connectOKX = async (addToast) => {
  try {
    const okx = (window as any).okxwallet;
    if (!okx) {
      addToast(
        "OKX wallet not detected. Please install the OKX extension.",
        "error",
      );
      return;
    }
    const result = await okx.bitcoin.connect();
    await handleAccountsChanged([result.address]);
    addToast("Successfully connected to OKX wallet", "success");
  } catch (error) {
    addToast(`Failed to connect to OKX wallet: ${error.message}`, "error");
  }
};

export const checkOKX = () => {
  const okx = (window as any).okxwallet;
  if (okx && okx.bitcoin) {
    isOKXInstalled.value = true;
    okx.bitcoin.on("accountsChanged", handleAccountsChanged);
    return true;
  }
  isOKXInstalled.value = false;
  return false;
};

const handleAccountsChanged = async (accounts: string[]) => {
  if (accounts.length === 0) {
    walletContext.disconnect();
    return;
  }

  const okx = (window as any).okxwallet;
  const _wallet = {} as Wallet;
  _wallet.address = accounts[0];
  _wallet.accounts = accounts;

  const publicKey = await okx.bitcoin.getPublicKey();
  _wallet.publicKey = publicKey;

  const balance = await okx.bitcoin.getBalance();
  _wallet.btcBalance = {
    confirmed: balance.confirmed,
    unconfirmed: balance.unconfirmed,
    total: balance.total,
  };

  const basicInfo = await walletContext.getBasicStampInfo(accounts[0]);
  _wallet.stampBalance = basicInfo.stampBalance;
  _wallet.network = "mainnet";
  _wallet.provider = "okx";

  walletContext.isConnected.value = true;
  walletContext.updateWallet(_wallet);
};

const signMessage = async (message: string) => {
  const okx = (window as any).okxwallet;
  return await okx.bitcoin.signMessage(message);
};

const signPSBT = async (psbt: string) => {
  const okx = (window as any).okxwallet;
  return await okx.bitcoin.signPsbt(psbt);
};

const broadcastRawTX = async (rawTx: string) => {
  const okx = (window as any).okxwallet;
  return await okx.bitcoin.pushTx(rawTx);
};

const broadcastPSBT = async (psbtHex: string) => {
  const okx = (window as any).okxwallet;
  return await okx.bitcoin.pushPsbt(psbtHex);
};

export const okxProvider = {
  checkOKX,
  connectOKX,
  signMessage,
  signPSBT,
  broadcastRawTX,
  broadcastPSBT,
};
