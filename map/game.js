const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d');

canvas.width = 1344 * 1.1;
canvas.height = 896 * 1.1;

const tileX = 30;
const tileY = 20;

const collisionsMap = []
for (let i = 0; i < collisions.length; i+=tileX) {
    collisionsMap.push(collisions.slice(i, tileX + i))
}

class Boundary {
    static width = 128;
    static height = 128;
    constructor({position}) {
        this.position = position
        this.width = 128
        this.height = 128
    }

    draw() {
        c.fillStyle ='rgba(0, 0, 0, 0.5)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

const boundaries = []


const offset = {
    x: -95,
    y: -700,
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol == '257')
        boundaries.push(new Boundary({position:{
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
        }
        })
        )
    })
})

const image = new Image()
image.src = 'map/game.png' // Image de la map

const foregroundImage = new Image()
foregroundImage.src = 'map/foreground.png' // Objet passable au travers

const playerDownImage = new Image()
playerDownImage.src = 'map/down.png';  // Sprites ok 

const playerUpImage = new Image()
playerUpImage.src = 'map/up.png'; // Sprites à corriger

const playerLeftImage = new Image()
playerLeftImage.src = 'map/left.png'; // Sprites à corriger

const playerRightImage = new Image()
playerRightImage.src = 'map/right.png'; // Sprites à corriger

const shadowImage = new Image()
shadowImage.src = 'map/shadow.png' // Ombre sous sprites

class Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = {max: 1},
        sprites
    }) {
        this.position = position
        this.image = image
        this.frames = {...frames, val: 0, elapsed: 0}
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height / this.frames.max
        }
        this.moving = false
        this.sprites = sprites
    }

    draw() {
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            // canvas.height / 1.69 - this.image.height / 2
            this.image.width / this.frames.max,
            this.image.height
        )
        
        if (!this.moving) return
            if (this.frames.max > 1){
                this.frames.elapsed++
            }
            if (this.frames.elapsed % 10 === 0) {
                if (this.frames.val < this.frames.max - 1) this.frames.val++
                else this.frames.val = 0
            }
    }

}

// canvas.width / 2 - this.image.width / 30 / 2
// canvas.height / 2 - this.image.height / 2

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 2468 / 30 / 2,
        y:canvas.height / 2 - 117 / 2
    },
    image: playerDownImage,
    frames: {
        max: 30
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    }
})

const shadow = new Sprite({
    position: {
        x: canvas.width / 2 - 2468 / 30 / 2,
        y:canvas.height / 2 - 117 / 2
    },
    image: shadowImage
})

const background = new Sprite({position:{
 x: offset.x,
 y: offset.y
},
image: image})

const foreground = new Sprite({position:{
 x: offset.x,
 y: offset.y
},
image: foregroundImage})

const keys = {
    w: {
        pressed: false
    },a: {
        pressed: false
    },s: {
        pressed: false
    },d: {
        pressed: false
    },z: {
        pressed: false
    },q: {
        pressed: false
    },
}

const movables = [background, ...boundaries, foreground]

function rectangularCollision({rectangle1, rectangle2}) {
    return ( 
    rectangle1.position.x < rectangle2.position.x + rectangle2.width &&
    rectangle1.position.x + rectangle1.width > rectangle2.position.x &&
    rectangle1.position.y < rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height > rectangle2.position.y
    )
}
function animate() {
    window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    player.draw()
    shadow.draw()
    foreground.draw()
    let moving = true
    if (keys.w.pressed && lastKey === 'w' || keys.z.pressed && lastKey === 'z'){
        player.moving=true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                 rectangle1: player,
                 rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y + 1.5
                 }}
                }) 
             ) {
                 console.log('collision')
                 moving = false
                 break
             }
        }
        if (moving) {
            movables.forEach((movable) => {movable.position.y += 1.5})
        }
    }if (keys.a.pressed && lastKey === 'a' || keys.q.pressed && lastKey === 'q'){
        player.moving=true
        player.image = player.sprites.left
        player.draw()
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                 rectangle1: player,
                 rectangle2: {...boundary, position: {
                    x: boundary.position.x + 1.5,
                    y: boundary.position.y
                 }}
                }) 
             ) {
                 console.log('collision')
                 moving = false
                 break
             }
        }
        if (moving) {
            movables.forEach((movable) => {movable.position.x += 1.5})
        }
    }if (keys.s.pressed && lastKey === 's'){
        player.moving=true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                 rectangle1: player,
                 rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y - 1.5
                 }}
                }) 
             ) {
                 console.log('collision')
                 moving = false
                 break
             }
        }
        if (moving) {
            movables.forEach((movable) => {movable.position.y -= 1.5})
        }
    }if (keys.d.pressed && lastKey === 'd'){
        player.moving=true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                 rectangle1: player,
                 rectangle2: {...boundary, position: {
                    x: boundary.position.x - 1.5,
                    y: boundary.position.y
                 }}
                }) 
             ) {
                 console.log('collision')
                 moving = false
                 break
             }
        }
        if (moving) {
            movables.forEach((movable) => {movable.position.x -= 1.5})
        }
    }
}
animate()


let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
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

        case 'z': 
        keys.z.pressed = true
        lastKey= 'z'
        break
        case 'q': 
        keys.q.pressed = true
        lastKey= 'q' 
        break
    }
})
window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            player.moving = false
        break
        case 'a':
            keys.a.pressed = false 
            player.moving = false

        break
        case 's': 
        keys.s.pressed = false
        player.moving = false

        break
        case 'd': 
        keys.d.pressed = false
        player.moving = false

        break

        case 'z': 
        keys.z.pressed = false
        player.moving = false

        break
        case 'q': 
        keys.q.pressed = false
        player.moving = false

        break
    }
})