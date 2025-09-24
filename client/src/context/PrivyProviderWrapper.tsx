"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider } from '@privy-io/wagmi';
import {  mainnet, monadTestnet, sepolia } from 'viem/chains';
import { http } from 'wagmi';
import { PrivyProvider } from "@privy-io/react-auth";
import { ReactNode, StrictMode, useState } from "react";

export const config = createConfig({
  chains: [monadTestnet, mainnet],  // add any common chains
  transports: {
    [monadTestnet.id]: http(),
    [mainnet.id]: http()
  },
});
export default function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <StrictMode>
      <PrivyProvider
        appId="cmc088gpn00otjr0obj9o9ioe"
        config={{
          appearance: {
            theme: "dark",
            walletChainType: "ethereum-and-solana",
            showWalletLoginFirst: true,
          },
          loginMethods: ["google", "passkey", "wallet", "twitter", "email"],
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            {children}
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </StrictMode>
  );
}
