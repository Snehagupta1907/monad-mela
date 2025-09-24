export const WMON_TOKEN_ADDRESS = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701" as const;
export const MON_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as const;
export const USDC_TESTNET_ADDRESS = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea" as const;
export const LSD_TOKEN_ADDRESS = "0x7fdF92a43C54171F9C278C67088ca43F2079d09b" as const;
export const APRMON_TOKEN_ADDRESS = "0x0E1C9362CDeA1d556E5ff89140107126BAAf6b09" as const;
export const GMON_TOKEN_ADDRESS = "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3" as const;
export const WBTC_TOKEN_ADDRESS = "0x6BB379A2056d1304E73012b99338F8F581eE2E18" as const;
export const SMON_TOKEN_ADDRESS = "0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5" as const;

// 0x API configuration
export const ZERO_EX_API_BASE_URL = "https://api.0x.org/swap/allowance-holder" as const;

// Token information with URLs
export const TOKENS = {
  WMON: {
    address: WMON_TOKEN_ADDRESS,
    symbol: "WMON",
    name: "Wrapped MON",
    decimals: 18,
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/WMON.png/public",
  },
  MON: {
    address: MON_TOKEN_ADDRESS,
    symbol: "MON",
    name: "MON Token",
    decimals: 18,
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/MON.png/public",
  },
  USDC: {
    address: USDC_TESTNET_ADDRESS,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/usdc.png/public",
  },
  LSD: {
    address: LSD_TOKEN_ADDRESS,
    symbol: "LSD",
    name: "LSD Token",
    decimals: 18,
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/Curvance-lusd.png/public",
  },
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
  WBTC: {
    address: WBTC_TOKEN_ADDRESS,
    symbol: "WBTC",
    name: "Wrapped BTC",
    decimals: 8,
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/Curvance-wbtc.png/public",
  },
  sMON: {
    address: SMON_TOKEN_ADDRESS,
    symbol: "sMON",
    name: "sMON Token",
    decimals: 18,
    logo: "https://kintsu-logos.s3.us-east-1.amazonaws.com/sMON.svg",
  },
} as const;
