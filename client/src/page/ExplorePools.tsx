import React, { useEffect, useRef, useState } from "react";
import { TOKENS } from "@/constants/tokens";

import { Boundary, House, Sprite } from "@/classes/classes";
import { collision } from "@/data/collision";
import { motion } from "framer-motion";
import LoginButton from "@/components/LoginButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  checkForHouseCollision,
  checkForTreeCollision,
  rectangularCollision,
} from "@/classes/helper";
import { houses } from "@/data/houses";
import { trees } from "@/data/trees";

const offset = {
  x: -675,
  y: -1570,
};

const collisionMap = [];
for (let i = 0; i < collision.length; i += 150) {
  collisionMap.push(collision.slice(i, 150 + i));
}

const houseMap = [];
for (let i = 0; i < houses.length; i += 150) {
  houseMap.push(houses.slice(i, 150 + i));
}

const treeNumber = 30;
const treeMap = [];
for (let i = 0; i < trees.length; i += 150) {
  treeMap.push(trees.slice(i, 150 + i));
}

const boundaries = [];
collisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

const housesMap = [];
houseMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol !== 0)
      housesMap.push(
        new House({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          dialogue: ["...", "Hey mister, have you seen my Doggochu?"],
        })
      );
  });
});

const tree1Image = new Image();
tree1Image.src = "/tree1.png";

const tree2Image = new Image();
tree2Image.src = "/tree2.png";

const tree3Image = new Image();
tree3Image.src = "/tree3.png";

const treeZones = [];
treeMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 258)
      treeZones.push(
        new Sprite({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          scale: 3.2,
          image: tree1Image,
        })
      );

    if (symbol === 294)
      treeZones.push(
        new Sprite({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          scale: 3.2,
          image: tree2Image,
        })
      );
  });
});

function getRandomTreeZones(treeZones, treeNumber) {
  const selectedZones = [];
  const usedIndices = new Set();

  while (
    selectedZones.length < treeNumber &&
    usedIndices.size < treeZones.length
  ) {
    const randomIndex = Math.floor(Math.random() * treeZones.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedZones.push(treeZones[randomIndex]);
    }
  }

  return selectedZones;
}
const newTreeZones = getRandomTreeZones(treeZones, treeNumber);
treeZones.length = 0; // Clear original treeZones
treeZones.push(...newTreeZones);
console.log(treeZones);

const ExplorePools: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showNpcButton, setShowNpcButton] = useState(false);
  const showNpcButtonRef = useRef<boolean>(false);
  const [showSwapPrompt, setShowSwapPrompt] = useState(false);
  const [acceptedSwap, setAcceptedSwap] = useState(false);
  const acceptedSwapRef = useRef<boolean>(false);
  const [forceShowButtons, setForceShowButtons] = useState(false);
  const forceShowButtonsRef = useRef<boolean>(false);
  const [swapAnchor, setSwapAnchor] = useState<{ x: number; y: number } | null>(
    null
  );
  const [marketLine, setMarketLine] = useState<string | null>(null);
  const TOKENS_ARRAY = Object.values(TOKENS);
  const getTokenBySymbol = (symbol: string) => TOKENS_ARRAY.find((t) => t.symbol === symbol);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [fromTokenSymbol, setFromTokenSymbol] = useState<string>(TOKENS_ARRAY[0]?.symbol ?? "");
  const [toTokenSymbol, setToTokenSymbol] = useState<string>("");
  const [sellAmountInput, setSellAmountInput] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Router/Permit2 config from your deployment
  const ROUTER_CONFIG = {
    router: "0x959eBb7b46DCbdA2746781b77F3c0aAA668D2329",
    permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    lstPool: "0x0aef4B9C7887D80C9CF3108ff07bAB7d23865CB8",
  } as const;

  // Minimal ABIs
  const ERC20_ABI = [
    { inputs: [{ name: "owner", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
    { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  ] as const;

  const PERMIT2_ABI = [
    {
      inputs: [
        { internalType: "address", name: "token", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint160", name: "amount", type: "uint160" },
        { internalType: "uint48", name: "expiration", type: "uint48" },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ] as const;

  const ROUTER_ABI = [
    {
      inputs: [
        { name: "pool", type: "address" },
        { name: "tokenIn", type: "address" },
        { name: "tokenOut", type: "address" },
        { name: "exactAmountIn", type: "uint256" },
        { name: "minAmountOut", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "wethIsEth", type: "bool" },
        { name: "userData", type: "bytes" },
      ],
      name: "swapSingleTokenExactIn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ] as const;

  function getDeadline(secondsFromNow = 1800): bigint {
    return BigInt(Math.floor(Date.now() / 1000) + secondsFromNow);
  }

  function pct(amount: bigint, bps: number): bigint {
    return (amount * BigInt(bps)) / 10000n;
  }

  async function performSwapRouter() {
    const toastId = toast.loading("Preparing swap...");
    setIsSwapping(true);
    try {
      if (!fromTokenSymbol || !toTokenSymbol || !sellAmountInput) {
        setMarketLine("Please select tokens and enter amount.");
        setTimeout(() => setMarketLine(null), 2000);
        toast.dismiss(toastId);
        setIsSwapping(false);
        return;
      }

      const tokenIn = getTokenBySymbol(fromTokenSymbol);
      const tokenOut = getTokenBySymbol(toTokenSymbol);
      if (!tokenIn || !tokenOut) {
        setMarketLine("Token not found.");
        setTimeout(() => setMarketLine(null), 2000);
        return;
      }

      const eth = (window as any).ethereum;
      if (!eth) {
        setMarketLine("Wallet not found.");
        setTimeout(() => setMarketLine(null), 2000);
        toast.error("Wallet not found", { id: toastId });
        setIsSwapping(false);
        return;
      }
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const from = await signer.getAddress();

      const erc20In = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);
      const decimals: number = await erc20In.decimals();
      const parseUnits = (value: string, dec: number) => ethers.parseUnits(value, dec);
      const exactAmountIn = parseUnits(sellAmountInput, decimals);

      // Ensure balance
      const balIn: bigint = await erc20In.balanceOf(from);
      if (balIn < exactAmountIn) {
        setMarketLine("Insufficient balance.");
        setTimeout(() => setMarketLine(null), 2000);
        toast.error("Insufficient balance", { id: toastId });
        setIsSwapping(false);
        return;
      }

      // Approve token to Permit2 if needed
      const permit2Addr = ROUTER_CONFIG.permit2;
      const allowanceToPermit2: bigint = await erc20In.allowance(from, permit2Addr);
      if (allowanceToPermit2 < exactAmountIn) {
        setMarketLine("Approving Permit2...");
        toast.loading("Approving token to Permit2...", { id: toastId });
        await (await erc20In.approve(permit2Addr, exactAmountIn)).wait();
      }

      // Approve Permit2 to Router
      setMarketLine("Approving Router via Permit2...");
      toast.loading("Approving Router via Permit2...", { id: toastId });
      const permit2 = new ethers.Contract(permit2Addr, PERMIT2_ABI, signer);
      const MAX_UINT48 = 281474976710655n;
      await (await permit2.approve(tokenIn.address, ROUTER_CONFIG.router, exactAmountIn, MAX_UINT48)).wait();

      // Call router
      setMarketLine("Swapping...");
      toast.loading("Sending swap transaction...", { id: toastId });
      const router = new ethers.Contract(ROUTER_CONFIG.router, ROUTER_ABI, signer);
      console.log({router});
      const deadline = getDeadline(1800);
      const minOut = 0n; // TODO: add slippage controls
      const wethIsEth = false;
      const userData = "0x";
      console.log({deadline, minOut, wethIsEth, userData,tokenIn,tokenOut,exactAmountIn});
      const tx = await router.swapSingleTokenExactIn(
        ROUTER_CONFIG.lstPool,
        tokenIn.address,
        tokenOut.address,
        exactAmountIn,
        minOut,
        deadline,
        wethIsEth,
        userData
      );
      console.log(tx);
      toast.success("Tx submitted", { id: toastId });
      const receipt = await tx.wait();
      toast.success(`Swap confirmed in block ${receipt?.blockNumber}`);
      setMarketLine("Swap executed!");
      setTimeout(() => setMarketLine(null), 2500);
      setIsSwapOpen(false);
      setIsSwapping(false);
    } catch (error: any) {
      const reason = error?.shortMessage || error?.message || "Swap failed";
      setMarketLine(reason);
      setTimeout(() => setMarketLine(null), 3000);
      toast.error(reason);
      setIsSwapping(false);
    }
  }

  // TEMP: Hardcoded test swap shMON -> sMON amount 0.1, 1% slippage
  async function performSwapRouterHardcoded() {
    const toastId = toast.loading("Preparing test swap (0.1 shMON → sMON)...");
    setIsSwapping(true);
    try {
      const tokenIn = TOKENS.shMON;
      const tokenOut = TOKENS.sMON;
      const amountStr = "0.1";

      const eth = (window as any).ethereum;
      if (!eth) {
        setMarketLine("Wallet not found.");
        setTimeout(() => setMarketLine(null), 2000);
        toast.error("Wallet not found", { id: toastId });
        setIsSwapping(false);
        return;
      }
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const from = await signer.getAddress();

      const erc20In = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);
      const decimals: number = await erc20In.decimals();
      const exactAmountIn = ethers.parseUnits(amountStr, decimals);

      const balIn: bigint = await erc20In.balanceOf(from);
      if (balIn < exactAmountIn) {
        setMarketLine("Insufficient balance for test swap.");
        setTimeout(() => setMarketLine(null), 2000);
        toast.error("Insufficient balance", { id: toastId });
        setIsSwapping(false);
        return;
      }

      const permit2Addr = ROUTER_CONFIG.permit2;
      const allowanceToPermit2: bigint = await erc20In.allowance(from, permit2Addr);
      if (allowanceToPermit2 < exactAmountIn) {
        setMarketLine("Approving Permit2...");
        toast.loading("Approving token to Permit2...", { id: toastId });
        await (await erc20In.approve(permit2Addr, exactAmountIn)).wait();
      }

      setMarketLine("Approving Router via Permit2...");
      toast.loading("Approving Router via Permit2...", { id: toastId });
      const permit2 = new ethers.Contract(permit2Addr, PERMIT2_ABI, signer);
      const MAX_UINT48 = 281474976710655n;
      await (await permit2.approve(tokenIn.address, ROUTER_CONFIG.router, exactAmountIn, MAX_UINT48)).wait();

      const router = new ethers.Contract(ROUTER_CONFIG.router, ROUTER_ABI, signer);
      const deadline = getDeadline(1800);
      let minOut = 0n;
      try {
        const quotedOut: bigint = await router.swapSingleTokenExactIn.staticCall(
          ROUTER_CONFIG.lstPool,
          tokenIn.address,
          tokenOut.address,
          exactAmountIn,
          0n,
          deadline,
          false,
          "0x"
        );
        if (quotedOut > 0n) {
          minOut = quotedOut - pct(quotedOut, 100); // 1% slippage
        }
      } catch {}

      setMarketLine("Swapping (test)...");
      toast.loading("Sending test swap...", { id: toastId });
      const tx = await router.swapSingleTokenExactIn(
        ROUTER_CONFIG.lstPool,
        tokenIn.address,
        tokenOut.address,
        exactAmountIn,
        minOut,
        deadline,
        false,
        "0x"
      );
      toast.success("Tx submitted", { id: toastId });
      const receipt = await tx.wait();
      toast.success(`Test swap confirmed in block ${receipt?.blockNumber}`);
      setMarketLine("Test swap executed!");
      setTimeout(() => setMarketLine(null), 2500);
      setIsSwapOpen(false);
      setIsSwapping(false);
    } catch (error: any) {
      const reason = error?.shortMessage || error?.message || "Swap failed";
      setMarketLine(reason);
      setTimeout(() => setMarketLine(null), 3000);
      toast.error(reason);
      setIsSwapping(false);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas exists
    const c = canvas.getContext("2d");
    if (!c) return; // Ensure context exists

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Movement speed (pixels per frame)
    const SPEED = 5;

    // Load background image
    const backgroundImg = new Image();
    backgroundImg.src = "/GameMapFinal.png";

    const playerDownImage = new Image();
    playerDownImage.src = "/playerDown.png";

    const playerUpImage = new Image();
    playerUpImage.src = "/playerUp.png";

    const playerLeftImage = new Image();
    playerLeftImage.src = "/playerLeft.png";

    const playerRightImage = new Image();
    playerRightImage.src = "/playerRight.png";


    const background = new Sprite({
      position: { x: offset.x, y: offset.y },
      image: backgroundImg,
      frames: { max: 1 },
    });

    const player = new Sprite({
      position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2,
      },
      image: playerDownImage,
      frames: {
        max: 4,
        hold: 10,
      },
      sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage,
      },
    });

    // NPC (does not change existing order of trees/houses/boundaries)
    const npcImage = new Image();
    npcImage.src = "/playerDown.png";
    const npc = new Sprite({
      position: {
        // near the house path without overlapping fences
        x: offset.x + 36 * 43,
        y: offset.y + 36 * 29,
      },
      image: npcImage,
      frames: { max: 4, hold: 12 },
      animate: true,
    });

    // Second NPC in front of another house (to the right near the dock)
    const npc2 = new Sprite({
      position: {
        x: offset.x + 36 * 64,
        y: offset.y + 36 * 32,
      },
      image: npcImage,
      frames: { max: 4, hold: 12 },
      animate: true,
    });

    // Third NPC near the sea by another home
    const npcSea = new Sprite({
      position: {
        x: offset.x + 36 * 65,
        y: offset.y + 36 * 44,
      },
      image: npcImage,
      frames: { max: 4, hold: 12 },
      animate: true,
    });


    const keys = {
      w: {
        pressed: false,
      },
      a: {
        pressed: false,
      },
      s: {
        pressed: false,
      },
      d: {
        pressed: false,
      },
    };

    let lastKey = "";

    window.addEventListener('keydown', (e) => {
      if (player.isInteracting) {
        switch (e.key) {
          case ' ':
            if (player.interactionAsset.type === 'House') {
              player.isInteracting = false;
              player.interactionAsset.dialogueIndex = 0;
              document.querySelector('#houseDialogueBox').style.display = 'none';
            } else {
              // console.log(treeVal)
              //           document.querySelector('#characterDialogueBox').innerHTML = `
              //             <div>
              //             <h3>${pools[treeVal].name} (${pools[treeVal].symbol})</h3>
              //             <p>Chain: ${pools[treeVal].chain}</p>
              //             <ul>
              //               ${pools[treeVal].poolTokens
              //               .map(
              //                 (token) => `
              //                 <li>
              //                   ${token.name} (${token.symbol}): $${token.balanceUSD}
              //                 </li>
              //               `
              //               )
              //               .join('')}
              //             </ul>
              //           </div>
              // `;

              document.querySelector('#characterDialogueBox').innerHTML = `
    <div>
              Tree
  </div>
`;

              document.querySelector('#deleteTreeButton').addEventListener('click', () => {
                if (player.interactionAsset) {
                  const treeIndex = treeZones.indexOf(player.interactionAsset);
                  if (treeIndex > -1) {
                    treeZones[treeIndex].faint();
                  }
                  document.querySelector('#characterDialogueBox').style.display = 'none';
                  player.isInteracting = false;
                  console.log('Tree deleted!');
                }
              });

              // document.querySelector('#cancel').addEventListener('click', () => {
              //   if (player.interactionAsset) {
              //     // const treeIndex = treeZones.indexOf(player.interactionAsset);
              //     // if (treeIndex > -1) {
              //     //   treeZones[treeIndex].faint();
              //     // }
              //     document.querySelector('#characterDialogueBox').style.display = 'none';
              //     player.isInteracting = false;
              //     console.log('Tree deleted!');
              //   }
              // });
            }
            break;
        }
        return;
      }

      switch (e.key) {
        case ' ':
          if (!player.interactionAsset) return;
          if (player.interactionAsset.type === 'House') {
            const firstMessage = player.interactionAsset.dialogue[0];
            document.querySelector('#houseDialogueBox').innerHTML = firstMessage;
            document.querySelector('#houseDialogueBox').style.display = 'flex';
            player.isInteracting = true;
            // Also show swap prompt for demo when near house
            setShowSwapPrompt(true);
          } else {
            console.log(treeVal)

            document.querySelector('#characterDialogueBox').innerHTML = 'tree'
            document.querySelector('#characterDialogueBox').style.display = 'flex';
            player.isInteracting = true;
          }
          break;
        case 'w':
        case 'a':
        case 's':
        case 'd':
          keys[e.key].pressed = true;
          lastKey = e.key;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "w":
          keys.w.pressed = false;
          break;
        case "a":
          keys.a.pressed = false;
          break;
        case "s":
          keys.s.pressed = false;
          break;
        case "d":
          keys.d.pressed = false;
          break;
      }
    });

    // Keep original ordering intact; add NPCs at the end so trees/houses order stays the same
    const worldStatics = [npc, npc2, npcSea];

    const movables = [
      background,
      ...boundaries,
      ...housesMap,
      ...treeZones,
      ...worldStatics,
    ];
    const renderables = [
      background,
      ...boundaries,
      ...housesMap,
      player,
      ...treeZones,
      ...worldStatics,
    ];
    function isNear(rectangle1: Sprite, rectangle2: Sprite, padding: number = 30) {
      // Build a padded rectangle around rectangle2 for proximity detection
      const paddedRectangle2 = {
        ...rectangle2,
        position: {
          x: rectangle2.position.x - padding,
          y: rectangle2.position.y - padding,
        },
        width: (rectangle2.width ?? 48) + padding * 2,
        height: (rectangle2.height ?? 48) + padding * 2,
      };

      return rectangularCollision({ rectangle1, rectangle2: paddedRectangle2 });
    }

    const SHOW_RADIUS = 120; // distance to show UI
    const HIDE_RADIUS = 150; // larger distance to hide UI (hysteresis)

    function animate() {
      window.requestAnimationFrame(animate);

      // Clear the canvas
      // c.clearRect(0, 0, canvas.width, canvas.height);

      // // Draw background
      // background.draw(c);
      // boundaries.forEach((boundary) => {
      //   boundary.draw(c);
      // });
      // // testboundary.draw(c);
      // player.draw(c);
      renderables.forEach((renderable) => {
        renderable.draw(c);
      });

      // Draw player sprite
      let moving = true;
      player.animate = false;
      if (keys.w.pressed && lastKey === "w") {
        player.animate = true;
        player.image = player.sprites.up;

        // console.group(housesMap)

        checkForHouseCollision({
          housesMap,
          player,
          characterOffset: { x: 0, y: SPEED },
        });

        if (player.interactionAsset === null) {
          checkForTreeCollision({
            treeZones,
            player,
            characterOffset: { x: 0, y: SPEED },
          });
        }

        for (let i = 0; i < boundaries.length; i++) {
          const boundary = boundaries[i];
          // console.log(boundaries[i])
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {
                ...boundary,
                position: {
                  x: boundary.position.x,
                  y: boundary.position.y + SPEED,
                },
              },
            })
          ) {
            moving = false;
            break;
          }
        }

        if (moving)
          movables.forEach((movable) => {
            movable.position.y += SPEED;
          });

        // console.log(boundaries);
      } else if (keys.a.pressed && lastKey === "a") {
        player.animate = true;
        player.image = player.sprites.left;

        checkForHouseCollision({
          housesMap,
          player,
          characterOffset: { x: SPEED, y: 0 },
        });

        if (player.interactionAsset === null) {
          checkForTreeCollision({
            treeZones,
            player,
            characterOffset: { x: SPEED, y: 0 },
          });
        }

        for (let i = 0; i < boundaries.length; i++) {
          const boundary = boundaries[i];
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {
                ...boundary,
                position: {
                  x: boundary.position.x + SPEED,
                  y: boundary.position.y,
                },
              },
            })
          ) {
            moving = false;
            break;
          }
        }

        // if (moving)
        //   movables.forEach((movable) => {
        //     movable.position.x += 3;
        //   });
        if (moving)
          movables.forEach((movable) => {
            movable.position.x += SPEED;
          });

        // console.log(bundaries);
      } else if (keys.s.pressed && lastKey === "s") {
        player.animate = true;
        player.image = player.sprites.down;

        checkForHouseCollision({
          housesMap,
          player,
          characterOffset: { x: 0, y: -SPEED },
        });

        if (player.interactionAsset === null) {
          checkForTreeCollision({
            treeZones,
            player,
            characterOffset: { x: 0, y: -SPEED },
          });
        }

        for (let i = 0; i < boundaries.length; i++) {
          const boundary = boundaries[i];
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {
                ...boundary,
                position: {
                  x: boundary.position.x,
                  y: boundary.position.y - SPEED,
                },
              },
            })
          ) {
            moving = false;
            break;
          }
        }

        // if (moving)
        //   movables.forEach((movable) => {
        //     movable.position.y -= 3;
        //   });

        if (moving)
          movables.forEach((movable) => {
            movable.position.y -= SPEED;
          });
      } else if (keys.d.pressed && lastKey === "d") {
        player.animate = true;
        player.image = player.sprites.right;

        checkForHouseCollision({
          housesMap,
          player,
          characterOffset: { x: -SPEED, y: 0 },
        });

        if (player.interactionAsset === null) {
          checkForTreeCollision({
            treeZones,
            player,
            characterOffset: { x: -SPEED, y: 0 },
          });
        }

        for (let i = 0; i < boundaries.length; i++) {
          const boundary = boundaries[i];
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {
                ...boundary,
                position: {
                  x: boundary.position.x - SPEED,
                  y: boundary.position.y,
                },
              },
            })
          ) {
            moving = false;
            break;
          }
        }

        // if (moving)
        //   movables.forEach((movable) => {
        //     movable.position.x -= 3;
        //   });
        if (moving)
          movables.forEach((movable) => {
            movable.position.x -= SPEED;
          });
      }

      // If user accepted swap, force-show buttons anchored to player
      if (forceShowButtonsRef.current) {
        setShowNpcButton(true);
        setShowSwapPrompt(false);
        const anchorX = player.position.x + player.width / 2;
        const anchorY = player.position.y - 20;
        setSwapAnchor({ x: anchorX, y: anchorY });
      } else {
        // Proximity detection to NPCs with hysteresis to avoid flicker
        const npcs = [npc, npc2, npcSea];
        // Find nearest NPC and distance
        let nearest = npcs[0];
        let nearestDist2 = Infinity;
        const playerCenterX = player.position.x + player.width / 2;
        const playerCenterY = player.position.y + player.height / 2;
        npcs.forEach((n) => {
          const nx = n.position.x + n.width / 2;
          const ny = n.position.y + n.height / 2;
          const dx = nx - playerCenterX;
          const dy = ny - playerCenterY;
          const d2 = dx * dx + dy * dy;
          if (d2 < nearestDist2) {
            nearestDist2 = d2;
            nearest = n;
          }
        });

        const SHOW_RADIUS2 = SHOW_RADIUS * SHOW_RADIUS;
        const HIDE_RADIUS2 = HIDE_RADIUS * HIDE_RADIUS;

        if (!showNpcButtonRef.current && nearestDist2 <= SHOW_RADIUS2) {
          // Entered proximity: show appropriate UI
          showNpcButtonRef.current = true;
          setShowNpcButton(acceptedSwapRef.current);
          setShowSwapPrompt(!acceptedSwapRef.current);
          const anchorX = nearest.position.x + nearest.width / 2;
          const anchorY = nearest.position.y - 20;
          setSwapAnchor({ x: anchorX, y: anchorY });
        } else if (showNpcButtonRef.current && nearestDist2 > HIDE_RADIUS2) {
          // Left proximity: hide UI, keep acceptance state intact
          showNpcButtonRef.current = false;
          setShowNpcButton(false);
          setShowSwapPrompt(false);
          setSwapAnchor(null);
        } else if (showNpcButtonRef.current) {
          // Still within proximity: update anchor continuously
          const anchorX = nearest.position.x + nearest.width / 2;
          const anchorY = nearest.position.y - 20;
          setSwapAnchor({ x: anchorX, y: anchorY });
        }
      }
    }

    animate();
  }, []);

  return (
    <div className="bg-slate-900 text-white min-h-screen relative">
      {/* Button in the top-right corner */}
      <div className="absolute top-4 z-[5] right-4">
        <div className="flex gap-2">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <LoginButton />
          </motion.div>
           <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-4"
          >
          
          </motion.div>


        </div>
      </div>
      {/* Page content */}
      <canvas ref={canvasRef} />

      {showSwapPrompt && swapAnchor && (
        <div
          className="absolute z-[6]"
          style={{
            left: Math.max(8, Math.min(window.innerWidth - 8, swapAnchor.x)) + "px",
            top: Math.max(8, Math.min(window.innerHeight - 8, swapAnchor.y)) + "px",
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="relative px-4 py-3 rounded-xl bg-[#fff8e1] border-2 border-[#9a6b34] shadow-[0_4px_0_#9a6b34] text-[#4a3422]">
            <div className="font-semibold text-sm text-center">Wanna swap?</div>
            <div className="mt-3 flex gap-3 justify-center">
              <button
                onClick={() => {
                  setAcceptedSwap(true);
                  acceptedSwapRef.current = true;
                  setShowSwapPrompt(false);
                  setShowNpcButton(true);
                  setForceShowButtons(true);
                  forceShowButtonsRef.current = true;
                  setMarketLine("Step right up! Fresh swaps, best spreads today!");
                }}
                className="px-4 py-1.5 rounded-lg bg-[#ffdf8a] border-2 border-[#9a6b34] shadow-[0_3px_0_#9a6b34] active:translate-y-[2px] active:shadow-none text-[#4a3422] text-sm"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setAcceptedSwap(false);
                  acceptedSwapRef.current = false;
                  setShowSwapPrompt(false);
                  setShowNpcButton(false);
                  setForceShowButtons(false);
                  forceShowButtonsRef.current = false;
                  setMarketLine("No worries! Deals await when you're ready.");
                  setTimeout(() => setMarketLine(null), 2000);
                }}
                className="px-4 py-1.5 rounded-lg bg-white border-2 border-[#9a6b34] shadow-[0_3px_0_#9a6b34] active:translate-y-[2px] active:shadow-none text-[#4a3422] text-sm"
              >
                No
              </button>
            </div>
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#9a6b34]"></div>
            <div className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#fff8e1]"></div>
          </div>
        </div>
      )}

      {showNpcButton && swapAnchor && (
        <div
          className="absolute z-[6]"
          style={{
            left: Math.max(8, Math.min(window.innerWidth - 8, swapAnchor.x)) + "px",
            top: Math.max(8, Math.min(window.innerHeight - 8, swapAnchor.y + 60)) + "px",
            transform: "translate(-50%, 0)",
          }}
        >
          <div className="relative flex items-center gap-3">
            <button
              aria-label="Close token chooser"
              onClick={() => {
                setShowNpcButton(false);
                showNpcButtonRef.current = false;
                setForceShowButtons(false);
                forceShowButtonsRef.current = false;
                setAcceptedSwap(false);
                acceptedSwapRef.current = false;
                setShowSwapPrompt(false);
                setMarketLine("Changed your mind? Best rates return at sunrise!");
                setTimeout(() => setMarketLine(null), 2200);
              }}
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-white text-[#4a3422] border-2 border-[#9a6b34] shadow-[0_2px_0_#9a6b34] hover:brightness-105 active:translate-y-[1px] active:shadow-none"
            >
              ×
            </button>
          {TOKENS_ARRAY.slice(0, 6).map((token, index) => (
            <button
              key={token.symbol}
              onClick={() => {
                setToTokenSymbol(token.symbol);
                setIsSwapOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-[#fff8e1] border-2 border-[#9a6b34] shadow-[0_4px_0_#9a6b34] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_#9a6b34] flex flex-col items-center justify-center w-20 h-16 text-[#4a3422]"
              title={token.symbol}
            >
              <img
                src={token.logo}
                alt={token.symbol}
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] mt-1">{token.symbol}</span>
            </button>
          ))}
          </div>
        </div>
      )}

      {/* Swap Modal */}
      <Dialog open={isSwapOpen} onOpenChange={setIsSwapOpen}>
        <DialogContent className="bg-white text-[#1f2937]">
          <DialogHeader>
            <DialogTitle>Market Stall: Quick Swap</DialogTitle>
          </DialogHeader>
          <div className="mt-2 grid gap-4">
            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#374151]">From</label>
              <Select value={fromTokenSymbol} onValueChange={setFromTokenSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS_ARRAY.map((t) => (
                    <SelectItem key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#374151]">Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                value={sellAmountInput}
                onChange={(e) => setSellAmountInput(e.target.value)}
                className="h-9 rounded-md border px-3 text-sm bg-white text-[#1f2937]"
                placeholder="0.0"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#374151]">To</label>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm h-9 bg-gray-50">
                <img
                  src={getTokenBySymbol(toTokenSymbol)?.logo}
                  alt={toTokenSymbol}
                  className="w-5 h-5 object-contain"
                />
                <span>{toTokenSymbol || "Select from NPC buttons"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* <button
                className="mt-2 h-10 rounded-md bg-[#ffdf8a] border-2 border-[#9a6b34] shadow-[0_3px_0_#9a6b34] active:translate-y-[2px] active:shadow-none text-[#4a3422] text-sm font-semibold px-4"
                onClick={performSwapRouterHardcoded}
              >
                Test Swap (shMON → sMON, 0.1)
              </button> */}
              <button
                className="mt-2 h-10 rounded-md bg-white border-2 border-[#9a6b34] shadow-[0_3px_0_#9a6b34] active:translate-y-[2px] active:shadow-none text-[#4a3422] text-sm font-semibold px-4"
                onClick={performSwapRouter}
                disabled={!fromTokenSymbol || !toTokenSymbol || !sellAmountInput}
              >
                Swap
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {marketLine && swapAnchor && (
        <div
          className="absolute z-[6]"
          style={{
            left: Math.max(8, Math.min(window.innerWidth - 8, swapAnchor.x)) + "px",
            top: Math.max(8, Math.min(window.innerHeight - 8, swapAnchor.y - 20)) + "px",
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="relative px-3 py-2 rounded-lg bg-white/90 border-2 border-[#9a6b34] shadow-[0_3px_0_#9a6b34] text-[#4a3422] text-xs whitespace-nowrap">
            {marketLine}
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#9a6b34]"></div>
            <div className="absolute left-1/2 -bottom-[5px] -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        </div>
      )}

      <div
        id="characterDialogueBox"
        className="bg-white fixed bottom-0 left-0 right-0 border-t-4 border-black hidden p-3"
      ></div>

      <div
        id="houseDialogueBox"
        className="bg-white/70 backdrop-blur-sm h-[500px] w-[500px] fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-black hidden p-3"
      ></div>
    </div>
  );
};

export default ExplorePools;
