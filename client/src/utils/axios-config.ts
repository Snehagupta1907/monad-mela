import axios from "axios";

// Tokens array
const TOKENS = [
  { symbol: "LSD", address: "0x7fdF92a43C54171F9C278C67088ca43F2079d09b", decimals: 18 },
  { symbol: "USDC", address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea", decimals: 6 },
  { symbol: "APRMON", address: "0x0E1C9362CDeA1d556E5ff89140107126BAAf6b09", decimals: 18 },
  { symbol: "gMON", address: "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3", decimals: 18 },
  { symbol: "WBTC", address: "0x6BB379A2056d1304E73012b99338F8F581eE2E18", decimals: 8 },
  { symbol: "sMON", address: "0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5", decimals: 18 },
];

// Helper to get token by symbol
const TOKENS_BY_SYMBOL = TOKENS.reduce((acc, t) => {
  acc[t.symbol.toLowerCase()] = t;
  return acc;
}, {} as Record<string, typeof TOKENS[0]>);

// Function to get price
export async function getPrice({
  sellTokenSymbol,
  buyTokenSymbol,
  sellAmount,
  chainId,
}: {
  sellTokenSymbol: string;
  buyTokenSymbol: string;
  sellAmount: string; // string in human-readable units
  chainId: number;
}) {
  const sellToken = TOKENS_BY_SYMBOL[sellTokenSymbol.toLowerCase()];
  const buyToken = TOKENS_BY_SYMBOL[buyTokenSymbol.toLowerCase()];

  if (!sellToken || !buyToken) throw new Error("Invalid token");

  // Convert sellAmount to wei
  const amountInWei = (BigInt(Math.floor(parseFloat(sellAmount) * 10 ** sellToken.decimals))).toString();

  const params = new URLSearchParams({
    chainId: chainId.toString(),
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount: amountInWei,
  }).toString();
  console.log(params);

  const config = {
    method: "get",
    url: `https://api.0x.org/swap/allowance-holder/price?${params}`,
    headers: {
      "0x-api-key": "029e1b4a-671b-47d6-bb71-c4a4f0a80f78",
      "0x-version": "v2",
    },
  };

  try {
    const { data } = await axios(config);
    console.log("Price API called:", config.url);
    console.log("Price data:", data);
    return data; // full 0x price response
  } catch (error: any) {
    console.error("Error fetching price:", error.message);
    throw error;
  }
}
