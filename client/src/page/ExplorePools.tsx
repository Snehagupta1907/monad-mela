import React, { useEffect, useRef, useState } from "react";
import { TOKENS } from "@/constants/tokens";

import { Boundary, House, Sprite } from "@/classes/classes";
import { collision } from "@/data/collision";
import { motion } from "framer-motion";
import LoginButton from "@/components/LoginButton";
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
  const [swapAnchor, setSwapAnchor] = useState<{ x: number; y: number } | null>(
    null
  );

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
          className="absolute z-[6] flex items-center gap-3"
          style={{
            left: Math.max(8, Math.min(window.innerWidth - 8, swapAnchor.x)) + "px",
            top: Math.max(8, Math.min(window.innerHeight - 8, swapAnchor.y + 60)) + "px",
            transform: "translate(-50%, 0)",
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => {
            const token = TOKENS[index];
            return (
              <button
                key={index}
                className="px-3 py-2 rounded-xl bg-[#fff8e1] border-2 border-[#9a6b34] shadow-[0_4px_0_#9a6b34] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_#9a6b34] flex flex-col items-center justify-center w-20 h-16 text-[#4a3422]"
                title={token ? token.symbol : `Button ${index + 1}`}
              >
                {token ? (
                  <>
                    <img
                      src={token.image}
                      alt={token.symbol}
                      className="w-8 h-8 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] mt-1">{token.symbol}</span>
                  </>
                ) : (
                  <span>Button {index + 1}</span>
                )}
              </button>
            );
          })}
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
