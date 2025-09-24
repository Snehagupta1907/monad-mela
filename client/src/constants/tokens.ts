export const APRMON_TOKEN_ADDRESS = "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A" as const;
export const GMON_TOKEN_ADDRESS = "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3" as const;
export const SMON_TOKEN_ADDRESS = "0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5" as const;
export const SHMON_TOKEN_ADDRESS = "0x3a98250F98Dd388C211206983453837C8365BDc1" as const;

// 0x API configuration
export const ZERO_EX_API_BASE_URL = "https://api.0x.org/swap/allowance-holder" as const;

// Token information with URLs (support these four only)
export const TOKENS = {
  APRMON: {
    address: APRMON_TOKEN_ADDRESS,
    symbol: "APRMON",
    name: "APRMON Token",
    decimals: 18,
    logo: "https://pbs.twimg.com/profile_images/1821177411796410369/GtzmUXok_400x400.jpg",
  },
  gMON: {
    address: GMON_TOKEN_ADDRESS,
    symbol: "gMON",
    name: "gMON Token",
    decimals: 18,
    logo: "https://www.magmastaking.xyz/gMON.png",
  },
  sMON: {
    address: SMON_TOKEN_ADDRESS,
    symbol: "sMON",
    name: "sMON Token",
    decimals: 18,
    logo: "https://kintsu-logos.s3.us-east-1.amazonaws.com/sMON.svg",
  },
  shMON: {
    address: SHMON_TOKEN_ADDRESS,
    symbol: "shMON",
    name: "shMON Token",
    decimals: 18,
    logo: "https://kintsu-logos.s3.us-east-1.amazonaws.com/sMON.svg",
  },
} as const;
