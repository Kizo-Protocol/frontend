export const urlExplorer = ({
  chainId = 84532,
  address,
  txHash,
}: {
  chainId?: ChainSupported;
  address?: string;
  txHash?: string;
}) => {
  const chainMetaMap: {
    [key: number]: {
      explorer: string;
    };
  } = {
    11155111: {
      explorer: "https://sepolia.etherscan.io",
    },
    84532: {
      explorer: "https://sepolia.basescan.org",
    },
    421614: {
      explorer: "https://sepolia.arbiscan.io",
    },
    43113: {
      explorer: "https://subnets-test.avax.network/c-chain",
    },
  };

  const chainMeta = chainMetaMap[chainId];

  if (!chainMeta) return "";

  if (address) {
    return `${chainMeta.explorer}/address/${address}`;
  }

  if (txHash) {
    return `${chainMeta.explorer}/tx/${txHash}`;
  }

  return "";
};

export const formatAddress = (address: string) => {
  if (!address) return "";

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
