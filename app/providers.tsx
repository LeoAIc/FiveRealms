'use client';

import * as React from 'react';


import { SessionProvider } from "next-auth/react";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 
const { networkConfig } = createNetworkConfig({
	localnet: { url: getFullnodeUrl('localnet') },
	mainnet: { url: getFullnodeUrl('mainnet') },
});
const queryClient = new QueryClient();

export function RainProviders({ children }: { children: React.ReactNode}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <>
      <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="localnet">
      <WalletProvider autoConnect={true} stashedWallet={{
				name: 'The Five Realms',
			}}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              font-family: "DM Sans";
            }

            html[data-dark] {
              font-family: 'DM Sans';
            }
          `,
        }}
      />
        {mounted && children}
        </WalletProvider>
        </SuiClientProvider>
        </QueryClientProvider>
      </>

  );
}

type Props = {
  children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};