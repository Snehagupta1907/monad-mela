"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { parseUnits, formatUnits } from "ethers";
import { getPrice } from "../utils/axios-config"; // import your getPrice function

// Tokens array
const TOKENS = [
  {
    symbol: "LSD",
    address: "0x7fdF92a43C54171F9C278C67088ca43F2079d09b",
    decimals: 18,
    logoURI: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/Curvance-lusd.png",
  },
  {
    symbol: "USDC",
    address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
    decimals: 6,
    logoURI: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/usdc.png",
  },
  {
    symbol: "APRMON",
    address: "0x0E1C9362CDeA1d556E5ff89140107126BAAf6b09",
    decimals: 18,
    logoURI: "https://pbs.twimg.com/profile_images/1821177411796410369/GtzmUXok_400x400.jpg",
  },
  {
    symbol: "gMON",
    address: "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3",
    decimals: 18,
    logoURI: "https://www.magmastaking.xyz/gMON.png",
  },
  {
    symbol: "WBTC",
    address: "0x6BB379A2056d1304E73012b99338F8F581eE2E18",
    decimals: 8,
    logoURI: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/Curvance-wbtc.png",
  },
  {
    symbol: "sMON",
    address: "0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5",
    decimals: 18,
    logoURI: "https://kintsu-logos.s3.us-east-1.amazonaws.com/sMON.svg",
  },
];

// Map for quick lookup
const TOKENS_BY_SYMBOL = TOKENS.reduce((acc, t) => {
  acc[t.symbol.toLowerCase()] = t;
  return acc;
}, {} as Record<string, typeof TOKENS[0]>);

export default function SwapPriceFetcher({
  chainId,
  onPrice,
}: {
  chainId: number;
  onPrice: (price: any) => void;
}) {
  const [sellToken, setSellToken] = useState("lsd");
  const [buyToken, setBuyToken] = useState("usdc");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  const sellTokenObj = TOKENS_BY_SYMBOL[sellToken];
  const buyTokenObj = TOKENS_BY_SYMBOL[buyToken];

  useEffect(() => {
    if (!sellAmount) return;

    async function fetchPrice() {
      try {
        const data = await getPrice({
          sellTokenSymbol: sellToken,
          buyTokenSymbol: buyToken,
          sellAmount,
          chainId,
        });

        console.log("Fetched price data:", data);

        if (data?.buyAmount) {
          // Convert from wei to human-readable
          const buyAmountHuman = Number(data.buyAmount) / 10 ** buyTokenObj.decimals;
          setBuyAmount(buyAmountHuman.toFixed(4));

          // Return full price data to parent
          onPrice({
            ...data,
            sellAmountHuman: Number(sellAmount).toFixed(4),
            buyAmountHuman: buyAmountHuman.toFixed(4),
            sellTokenSymbol: sellTokenObj.symbol,
            buyTokenSymbol: buyTokenObj.symbol,
            sellTokenDecimals: sellTokenObj.decimals,
            buyTokenDecimals: buyTokenObj.decimals,
          });
        }
      } catch (err) {
        console.error("Error fetching price:", err);
      }
    }

    fetchPrice();
  }, [sellAmount, sellToken, buyToken, chainId, onPrice]);

  return (
    <div className="space-y-4 text-black">
      {/* Sell Token */}
      <div className="flex items-center space-x-2">
        <select
          value={sellToken}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSellToken(e.target.value)
          }
          className="h-12 w-20 bg-transparent text-black"
        >
          {TOKENS.map((token) => (
            <option key={token.address} value={token.symbol.toLowerCase()}>
              {token.symbol}
            </option>
          ))}
        </select>
        <img
          src={sellTokenObj.logoURI}
          alt={sellTokenObj.symbol}
          width={32}
          height={32}
        />
        <input
          type="number"
          value={sellAmount}
          placeholder="0.0"
          className="border px-2 py-1 rounded text-black"
          onChange={(e) => setSellAmount(e.target.value)}
        />
      </div>

      {/* Buy Token */}
      <div className="flex items-center space-x-2">
        <select
          value={buyToken}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setBuyToken(e.target.value)
          }
          className="h-12 w-20 bg-transparent text-black"
        >
          {TOKENS.map((token) => (
            <option key={token.address} value={token.symbol.toLowerCase()}>
              {token.symbol}
            </option>
          ))}
        </select>
        <img
          src={buyTokenObj.logoURI}
          alt={buyTokenObj.symbol}
          width={32}
          height={32}
        />
        <input
          type="number"
          value={buyAmount}
          placeholder="0.0"
          disabled
          className="border px-2 py-1 rounded bg-gray-100 text-black"
        />
      </div>
    </div>
  );
}
