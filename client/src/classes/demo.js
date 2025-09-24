const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 150) {
    collisionsMap.push(collisions.slice(i, 150 + i))
}

const houseMap = []
for (let i = 0; i < houses.length; i += 150) {
    houseMap.push(houses.slice(i, 150 + i))
}

const treeNumber = 30
const treeMap = []
for (let i = 0; i < trees.length; i += 150) {
    treeMap.push(trees.slice(i, 150 + i))
}
console.log(treeMap)

const boundaries = []
const offset = {
    x: -900,
    y: -700
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
    })
})

const housesMap = []
houseMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol !== 0)
            housesMap.push(
                new House({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    },
                    dialogue: ['...', 'Hey mister, have you seen my Doggochu?']
                })
            )
    })
})


const tree1Image = new Image()
tree1Image.src = './img/tree1.png'

const tree2Image = new Image()
tree2Image.src = './img/tree2.png'

const tree3Image = new Image()
tree3Image.src = './img/tree3.png'

const treeZones = []
treeMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 258)
            treeZones.push(
                new Sprite({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    },
                    scale: 3.2,
                    image: tree1Image
                })
            )

        if (symbol === 294)
            treeZones.push(
                new Sprite({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    },
                    scale: 3.2,
                    image: tree2Image
                })
            )

    })
})

function getRandomTreeZones(treeZones, treeNumber) {
    const selectedZones = [];
    const usedIndices = new Set();

    while (selectedZones.length < treeNumber && usedIndices.size < treeZones.length) {
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
console.log(treeZones)

const image = new Image()
image.src = './img/GameMapFinal.png'


const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'



const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const movables = [
    background,
    ...boundaries,
    ...housesMap,
    ...treeZones
]
const renderables = [
    background,
    ...boundaries,
    ...housesMap,
    player,
    ...treeZones
]

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    renderables.forEach((renderable) => {
        renderable.draw()
    })

    let moving = true
    player.animate = false

    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up

        checkForHouseCollision({
            housesMap,
            player,
            characterOffset: { x: 0, y: 3 }
        })

        if (player.interactionAsset === null) {

            checkForTreeCollision({
                treeZones,
                player,
                characterOffset: { x: 0, y: 3 }
            })
        }

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }

        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.y += 3
            })
    } else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true
        player.image = player.sprites.left

        checkForHouseCollision({
            housesMap,
            player,
            characterOffset: { x: 3, y: 0 }
        })

        if (player.interactionAsset === null) {

            checkForTreeCollision({
                treeZones,
                player,
                characterOffset: { x: 3, y: 0 }
            })
        }


        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.x += 3
            })
    } else if (keys.s.pressed && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down

        checkForHouseCollision({
            housesMap,
            player,
            characterOffset: { x: 0, y: -3 }
        })

        if (player.interactionAsset === null) {

            checkForTreeCollision({
                treeZones,
                player,
                characterOffset: { x: 0, y: -3 }
            })

        }

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.y -= 3
            })
    } else if (keys.d.pressed && lastKey === 'd') {
        player.animate = true
        player.image = player.sprites.right

        checkForHouseCollision({
            housesMap,
            player,
            characterOffset: { x: -3, y: 0 }
        })

        if (player.interactionAsset === null) {

            checkForTreeCollision({
                treeZones,
                player,
                characterOffset: { x: -3, y: 0 }
            })
        }

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.x -= 3
            })
    }
}

let lastKey = ''

window.addEventListener('keydown', (e) => {
    if (player.isInteracting) {
        switch (e.key) {
            case ' ':
                if (player.interactionAsset.type === 'House') {
                    player.isInteracting = false
                    player.interactionAsset.dialogueIndex = 0
                    document.querySelector('#houseDialogueBox').style.display = 'none'

                    break
                } else {
                    document.querySelector('#characterDialogueBox').innerHTML = `
  <button id="deleteTreeButton">Delete Tree</button>
`;

                    // Add the event listener for the delete button
                    document.querySelector('#deleteTreeButton').addEventListener('click', () => {
                        if (player.interactionAsset) {
                            // Find and remove the tree from treeZones
                            console.log(player.interactionAsset)
                            const treeIndex = treeZones.indexOf(player.interactionAsset);
                            console.log(treeIndex)
                            // console.log(treeZones.indexOf(treeIndex))
                            if (treeIndex > -1) {
                                // treeZones.splice(treeIndex, 1); // Remove the tree
                                treeZones[treeIndex].faint()
                            }

                            console.log(treeZones)

                            // Hide the dialogue box
                            document.querySelector('#characterDialogueBox').style.display = 'none';

                            // Reset player interaction
                            player.isInteracting = false;
                            // player.interactionAsset = null;

                            console.log('Tree deleted!');
                        }
                    });
                    break
                }

        }
        return
    }

    switch (e.key) {
        case ' ':
            if (!player.interactionAsset) return
            if (player.interactionAsset.type === 'House') {
                const firstMessage = player.interactionAsset.dialogue[0]
                document.querySelector('#houseDialogueBox').innerHTML = firstMessage
                document.querySelector('#houseDialogueBox').style.display = 'flex'
                player.isInteracting = true
                break
            } else {
                // const firstMessage = player.interactionAsset.dialogue[0]
                document.querySelector('#characterDialogueBox').innerHTML = 'Tree'
                document.querySelector('#characterDialogueBox').style.display = 'flex'
                player.isInteracting = true
                break
            }
        // beginning the conversation

        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break

        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break

        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})

let clicked = false
addEventListener('click', () => {
    if (!clicked) {
        audio.Map.play()
        clicked = true
    }
})
