
let currentLevel;
let loadedBlocks = [];
let tempCollison = [];

const devToolsEnabled = true;

let Camera = {
    real : {
        x : 0,
        y : 0,
        z : 0
    },

    get x(){
        return Math.round(Camera.real.x);
    },
    get y(){
        return Math.round(Camera.real.y);
    },
    get z(){
        return Math.round(Camera.real.z);
    },

    get screenSpace(){
        return new vec2(Math2.rot(this.real.x, this.real.z, this.rotation), this.real.y);
    },

    step : 0,

    rotation : 0,

    zoom : 1,
}

let ControlSchemes = {
    "Player1" : {
        "up" : "KeyW",
        "down" : "KeyL",
        "left" : "KeyA",
        "right" : "KeyD",

        "interact" : "Space",
        "modifier" : "LeftShift",
        "kick" : "KeyK",

        "deadZone" : 0.1,

        "gamepad" : {
            "horzAxis" : 0, // first axis in the <axis> key (left stick, horizontal axis)
            "action" : 0, // first button in the <button> key (rep of x / cross)
            "kick" : 5 // third button in the <button> key... (rep of right bumper)
        }
    },
    
    "Player2" : {
        "up" : "ArrowUp",
        "down" : "ArrowDown",
        "left" : "ArrowLeft",
        "right" : "ArrowRight",

        "interact" : "Space",
        "modifier" : "LeftShift"
    }
}

const GamepadButtonIndex2UnderstandableWords = {
    0 : "Bottom Face Button",
    1 : "Right Face Button",
    2 : "Left Face Button",
    3 : "Top Face Button",

    4 : "Left Bumper",
    5 : "Right Bumper",
    6 : "Left Trigger",
    7 : "Right Trigger",

    8 : "Select",
    9 : "Start",

    10 : "Left Stick Button",
    11 : "right Stick Button",

    12 : "Up On D-Pad",
    13 : "Down On D-Pad",
    14 : "Left On D-Pad",
    15 : "Right On D-Pad",
    16 : "PS / Middle Button" 
}

const SpriteAtlas = {
    "player" : {
        "idle" : [
            new Region(0, 19 * 0),
            new Region(0, 19 * 1),
            new Region(0, 19 * 2),
            new Region(0, 19 * 3)
        ],

        "idle2" : [
            new Region(19, 0 * 19),
            new Region(19, 1 * 19),
            new Region(19, 2 * 19),
            new Region(19, 3 * 19),
            new Region(19, 4 * 19),
            new Region(19, 5 * 19),
            new Region(19, 4 * 19),
            new Region(19, 5 * 19),
            new Region(19, 4 * 19),
            new Region(19, 3 * 19),
            new Region(19, 2 * 19),
            new Region(19, 1 * 19),
            new Region(19, 0 * 19),
        ],

        "run" : [
            new Region(57, 19 * 0),
            new Region(57, 19 * 1),
            new Region(57, 19 * 2),
            new Region(57, 19 * 3)
        ]
    }
}

let TileAtlas = {
    "air" : {"region" : new Region(0, 0, 0, 0), "solid" : false},
    "hardAir" : {"region" : new Region(0, 0, 0, 0), "solid" : true},

    "lab" : {
        "other" : {
            "paleWood" : { "region" : new Region(76, 19), "solid" : true }
        },
        "wire" : {
            "red_wire" : { "region" : new Region(76, 38), "solid" : true }
        },
        "conveyor" : {
            "region" : [
                new Region(76, 57, 19, 19),
                new Region(76, 76, 19, 19),
                new Region(76, 95, 19, 19),
            ],

            "solid" : true,

            "speed" : 0.01
        },

        "purpleLabWindow" : new basic9Slice(95, 114, false, 19, 19, 209, 133),
        "purpleOvergrownthEdge" : new basic9Slice(152, 114, false, 19, 19, 209, 133),

        "purpleGrass" : {
            "topLeft" : {
                "region" : new Region(133, 0, 19, 19),
                "solid" : true
            },
            "top" : {
                "region" : new Region(152, 0, 19, 19),
                "solid" : true
            },
            "topRight" : {
                "region" : new Region(171, 0, 19, 19),
                "solid" : true
            },

            "left" : {
                "region" : new Region(133, 19, 19, 19),
                "solid" : true
            },
            "right" : {
                "region" : new Region(171, 19, 19, 19),
                "solid" : true
            },

            "bottomLeft" : {
                "region" : new Region(133, 38, 19, 19),
                "solid" : true
            },
            "bottom" : {
                "region" : new Region(152, 38, 19, 19),
                "solid" : true
            },
            "bottomRight" : {
                "region" : new Region(171, 38, 19, 19),
                "solid" : true
            },



            "innerTopLeft" : {
                "region" : new Region(133, 57, 19, 19),
                "solid" : true
            },
            "innerTopRight" : {
                "region" : new Region(152, 57, 19, 19),
                "solid" : true
            },
            "innerBottomLeft" : {
                "region" : new Region(133, 76, 19, 19),
                "solid" : true
            },
            "innerBottomRight" : {
                "region" : new Region(152, 76, 19, 19),
                "solid" : true
            }
        },

        "purple" : {
            "region" : [
                new Region(114, 76, 19, 19),
                new Region(114, 95, 19, 19),
                new Region(95, 95, 19, 19),
            ],

            "solid" : true,
            "speed" : 0.001
        },

        "circuitBoard" : {
            "region" : new Region(133, 95, 19, 19),
            "solid" : true
        },

        "overgrownCircuitBoard" : {
            "region" : new Region(171, 95, 19, 19),
            "solid" : true
        },

        "overgrownCircuitBoardMiddle" : {
            "region" : new Region(152, 95, 19, 19),
            "solid" : true
        },

        "grating" : {
            "region" : new Region(152, 171, 19, 19),
            "solid" : true
        },

        "labDesks" : {
            "empty" : {
                "region" : new Region( 95, 190 ),
                "solid" : false
            },
            "computer1" : {
                "region" : new Region( 114, 187, 19, 22, 0, -3 ),
                "solid" : false
            },
            "computer2" : {
                "region" : new Region( 133, 183, 19, 26, 0, -7 ),
                "solid" : false
            },
            "keyboard" : {
                "region" : new Region( 152, 190 ),
            }
        }
    },

    "background": {
        "leakyConcrete" : { 
            "region" : [
                new Region(95, 0, 19, 19),
                new Region(95, 19 * 1, 19, 19),
                new Region(95, 19 * 2, 19, 19),
                new Region(95, 19 * 3, 19, 19),
                new Region(95, 19 * 4, 19, 19)
            ],

            "solid" : false,
            "speed" : 0.00075,
        }
    },

    "testElements" : {
        "cube" : {
            "region" : new Region(57, 152),
            "solid" : true
        }
    },

    "terminal" : {
        "term1" : new Region(114, 19)
    },

    "pickups" : {
        "powerup" : {
            "region" : [
                new Region(209, 95, 19 * 2, 19 * 2, -19,  0 -19),
                new Region(209, 95, 19 * 2, 19 * 2, -19, -2 -19),
                new Region(209, 95, 19 * 2, 19 * 2, -19, -3 -19),
                new Region(209, 95, 19 * 2, 19 * 2, -19, -4 -19),
                new Region(209, 95, 19 * 2, 19 * 2, -19, -3 -19),
                new Region(209, 95, 19 * 2, 19 * 2, -19, -2 -19),
            ],

            "speed" : 0.003,
            "solid" : false
        }
    },

    "Grass" : {
        "topLeft" : {
            "region" : new Region(19,190),
            "solid" : false
        },

        "top" : {
            "region" : new Region(38, 190),
            "solid" : false
        },

        "topRight" : {
            "region": new Region(57, 190),
            "solid" : false
        }
    }
}

const ParticleAtlas = {
    "terminalParticles" : {
        "blue" : new Region(131, 17, 2, 2, -1, -1)
    },

    "effects" : {
        "green" : new Region(129, 17, 2, 2, -1, -1),
        "purple" : new Region(127, 17, 2, 2, -1, -1)
    }
}

const keySets = {
    "OvergrownLabSet" : { // For Purple Overgrown Lab Related Tiles and bindings
        " " : TileAtlas.air,
        "_" : TileAtlas.hardAir,

        "1" : TileAtlas.lab.purpleGrass.topLeft,
        "2" : TileAtlas.lab.purpleGrass.top,
        "3" : TileAtlas.lab.purpleGrass.topRight,
        "4" : TileAtlas.lab.purpleGrass.right,
        "5" : TileAtlas.lab.purpleGrass.bottomRight,
        "6" : TileAtlas.lab.purpleGrass.bottom,
        "7" : TileAtlas.lab.purpleGrass.bottomLeft,
        "8" : TileAtlas.lab.purpleGrass.left,
        "!" : TileAtlas.lab.purpleGrass.innerTopLeft,
        "#" : TileAtlas.lab.purpleGrass.innerTopRight,
        "&" : TileAtlas.lab.purpleGrass.innerBottomLeft,
        "%" : TileAtlas.lab.purpleGrass.innerBottomRight,
        "@" : TileAtlas.lab.overgrownCircuitBoard,
        "Q" : TileAtlas.lab.overgrownCircuitBoardMiddle,
        
        "0" : TileAtlas.lab.purple,

        "q" : TileAtlas.lab.purpleLabWindow.topLeft,
        "w" : TileAtlas.lab.purpleLabWindow.top,
        "e" : TileAtlas.lab.purpleLabWindow.topRight,
        "a" : TileAtlas.lab.purpleLabWindow.left,
        //just use air ( )
        "d" : TileAtlas.lab.purpleLabWindow.right,
        "z" : TileAtlas.lab.purpleLabWindow.bottomLeft,
        "x" : TileAtlas.lab.purpleLabWindow.bottom,
        "c" : TileAtlas.lab.purpleLabWindow.bottomRight,

        // background purple growth edge
        "y" : TileAtlas.lab.purpleOvergrownthEdge.topLeft,
        "u" : TileAtlas.lab.purpleOvergrownthEdge.top,
        "i" : TileAtlas.lab.purpleOvergrownthEdge.topRight,
        "h" : TileAtlas.lab.purpleOvergrownthEdge.left,
        "j" : { // center
            "region" : [
                new Region(114, 76, 19, 19),
                new Region(114, 95, 19, 19),
                new Region(95, 95, 19, 19),
            ],"solid" : false, "speed" : 0.001},
        "k" : TileAtlas.lab.purpleOvergrownthEdge.right,
        "n" : TileAtlas.lab.purpleOvergrownthEdge.bottomLeft,
        "m" : TileAtlas.lab.purpleOvergrownthEdge.bottom,
        "," : TileAtlas.lab.purpleOvergrownthEdge.bottomRight,

        "r" : TileAtlas.lab.purpleOvergrownthEdge.innerTopLeft,
        "t" : TileAtlas.lab.purpleOvergrownthEdge.innerTopRight,
        "f" : TileAtlas.lab.purpleOvergrownthEdge.innerBottomLeft,
        "g" : TileAtlas.lab.purpleOvergrownthEdge.innerBottomRight,

        "o" : TileAtlas.lab.labDesks.empty,
        "p" : TileAtlas.lab.labDesks.computer1,
        "[" : TileAtlas.lab.labDesks.computer2,
        "]" : TileAtlas.lab.labDesks.keyboard,
        "+" : TileAtlas.lab.grating,

        "@" : {
            "region" : new Region(38, 152),
            "solid" : true
        }
    },

    "GrassyWorldSet" : {
        " " : TileAtlas.air,
        "_" : TileAtlas.hardAir,

        "#" : TileAtlas.lab.purple,

        "Q" : TileAtlas.Grass.topLeft,
        "W" : TileAtlas.Grass.top,
        "E" : TileAtlas.Grass.topRight
    }
}

const AreaAtlas = {
    "test01" : {
        "key" : keySets.OvergrownLabSet,
        "blocks" : [
            0, 0, 0, "0",
            0, 19, 0, "0",
            0, 0, 19, "0",
            19, 19, 19, "2",

            19, 19, 19 * 2, "2"
        ]
    },

    "test02" : {
        "key" : keySets.OvergrownLabSet,
        "blocks" : [
             4.500000, -1.00000,0 -4.5000, "@",
            -4.500000, -1.00000,0 -4.5000, "@",
            -3.500000, -1.00000,0 -4.5000, "@",
            -2.500000, -1.00000,0 -4.5000, "@",
            -1.500000, -1.00000,0 -4.5000, "@",
            -0.500000, -1.00000,0 -4.5000, "@",
             0.500000, -1.00000,0 -4.5000, "@",
             1.500000, -1.00000,0 -4.5000, "@",
             2.500000, -1.00000,0 -4.5000, "@",
             3.500000, -1.00000,0 -4.5000, "@",
            -4.500000, 1.000000, 4.500000, "2",
            -1.500000, 1.000000, 4.500000, "2",
            -2.500000, 1.000000, 4.500000, "2",
            -3.500000, 1.000000, 4.500000, "2",
            -4.500000, 1.000000, 3.500000, "2",
            -4.500000, 1.000000, 2.500000, "2",
            -4.500000, 1.000000, 1.500000, "2",
            -1.500000, 1.000000, 2.500000, "2",
            -1.500000, 1.000000, 3.500000, "2",
            -2.500000, 1.000000, 1.500000, "2",
            -2.500000, 1.000000, 2.500000, "2",
            -2.500000, 1.000000, 3.500000, "2",
            -3.500000, 1.000000, 1.500000, "2",
            -3.500000, 1.000000, 2.500000, "2",
            -3.500000, 1.000000, 3.500000, "2",
             1.500000, 2.000000, 4.500000, "@",
             0.500000, 2.000000, 4.500000, "@",
            -0.500000, 2.000000, 4.500000, "@",
            -1.500000, 2.000000, 4.500000, "@",
             0.500000, 2.000000, 3.500000, "@",
            -0.500000, 2.000000, 1.500000, "@",
            -0.500000, 2.000000, 2.500000, "@",
            -0.500000, 2.000000, 3.500000, "@",
            -1.500000, 2.000000, -0.50000, "@",
            -1.500000, 2.000000, 0.500000, "@",
            -1.500000, 2.000000, 1.500000, "@",
            -2.500000, 2.000000, 0.500000, "@",
            -2.500000, 2.000000, 1.500000, "@",
            -3.500000, 2.000000, 1.500000, "@",
            -0.500000, 3.000000, 4.500000, "@",
            -1.500000, 3.000000, 4.500000, "@",
            -0.500000, 3.000000, 1.500000, "@",
            -0.500000, 3.000000, 2.500000, "@",
            -0.500000, 3.000000, 3.500000, "@",
            -1.500000, 3.000000, 1.500000, "@",
            -1.500000, 3.000000, 2.500000, "@",
            -1.500000, 3.000000, 3.500000, "@",
            -2.500000, 3.000000, 1.500000, "@",
            -2.500000, 3.000000, 2.500000, "@",
             0.500000, 1.000000, 3.500000, "2",
            -0.500000, 1.000000, 3.500000, "2",
            -0.500000, 1.000000, 1.500000, "2",
            -1.500000, 1.000000, 0.500000, "2",
            -2.500000, 1.000000, 0.500000, "2",
            -0.500000, 1.000000, 4.500000, "2",
             1.500000, 1.000000, 4.500000, "2",
             0.500000, 1.000000, 4.500000, "2",
            -1.500000, 1.000000, -0.50000, "2",
            -0.500000, 1.000000, 2.500000, "2",
            -1.500000, 1.000000, 1.500000, "2",
        ]
    },
    "test03" : {
        "key" : keySets.OvergrownLabSet,
        "blocks" : [
            -1,  0, -1, "2",
            -1,  0, -1, "2",
             0,  0, -1, "2",
             1,  0, -1, "2",
            -1,  0,  0, "2",
             0,  0,  0, "2",
             1,  0,  0, "2",
            -1,  0,  1, "2",
             0,  0,  1, "2",
             1,  0,  1, "2",
             0,  1,  0, "2",
             1,  0,  1, "2",
        ]
    }
}


const GUIAtlas = {
    CreatePowerupCardWithContent(id, content){
        let element = document.createElement("div");
        element.classList = "powerUpCard";
        element.innerHTML = content;
        element.id = id;

        return document.getElementById("gameStuffHolder").appendChild(element);
    },

    Presets : {
        KickPowerUpCard(){
            let gamePadBind = GamepadButtonIndex2UnderstandableWords[ControlSchemes.Player1.gamepad.kick];
            gamePadBind = " / " + gamePadBind; // set it to "<key> / gamePadBind";
            if(gamePads === undefined){
                gamePadBind = "";
            }
            let card = GUIAtlas.CreatePowerupCardWithContent("KickPowerUpCard", `
                <div>
                    <h3 style="text-align: center">Wall Kicking!!</h3>
                    <p style="text-align: center">Press [K${gamePadBind}] while hugging a wall to kick off of it!!!</p>
                    <p style="text-align: center">([K${gamePadBind}] to exit)</p>
                </div>
            `);

            card.style.position = "fixed";
            card.style.transform = "translate( 0px, 0px )";

            return card;
        }
    }
}

const CutSceneAtlas = {
    timeOfStart : -1,
    currentScene : () => {  },

    inDurration(start, end){ // <start> = millisecs offset from <timeOfStart>; same w/ end
        if(end === -1){
            return Time.now >= this.timeOfStart + start
        }
        return (Time.now <= this.timeOfStart + start + end && Time.now >= this.timeOfStart + start );
    },

    IntroCutScene(){
        if( this.timeOfStart === -1 ){
            this.timeOfStart = Time.now;
            Players[0].movementInputEnabled = false;
            Players[0].real.x = 38;
            Players[0].real.y = 95;
            Players[0].motion.x = 5;
            Players[0].extraData.flipped = true;

            ParticlePresets.directedSpark(48, 95, 0, 180, 10, 50, 3000);
        }

        if( this.inDurration(500, -1) ){
            Players[0].movementInputEnabled = true;
            this.currentScene = undefined;
            this.timeOfStart = -1;
        }
    },

    kickPickup() {
        let kickCard;
        if( this.timeOfStart === -1 ){
            this.timeOfStart = Time.now;
            Players[0].movementInputEnabled = false;
            console.log("Kick Pickup Cutscene");
            document.getElementById("kickControl").removeAttribute("hidden");
            kickCard = GUIAtlas.Presets.KickPowerUpCard();
        }
    
        if( keyPressedWithin("KeyK", 1000) ){
            Players[0].movementInputEnabled = true;
            this.currentScene = undefined;
            this.timeOfStart = -1;
            document.getElementById("KickPowerUpCard").remove();
        }
    }
}


let apple = {
    "key" : {
        "1" : {"x": 133, "y": 0, "w": 19, "h": 19},
        "2" : {"x": 152, "y": 0, "w": 19, "h": 19},
        "3" : {"x": 171, "y": 0, "w": 19, "h": 19},
        "4" : {"x": 171, "y":19, "w": 19, "h": 19},
        "5" : {"x": 171, "y":38, "w": 19, "h": 19},
        "6" : {"x": 152, "y":38, "w": 19, "h": 19},
        "7" : {"x": 133, "y":38, "w": 19, "h": 19},
        "8" : {"x": 133, "y":19, "w": 19, "h": 19},
        "#" : {"x": 114, "y":76, "w": 19, "h": 19},
        "@" : {"x": 76, "y":19, "w": 19, "h": 19},
        " " : {"x": 0, "y":0, "w": 0, "h": 0},
        "^" : {"x": 76, "y":57, "w": 19, "h": 19},
        "<" : {"x": 95, "y":0, "w": 19, "h": 19}
    },

    "layout"  : [
        '#66666666666666#',
        '4              8',
        '4              8',
        '4        1223  8',
        '4    2   7665  8',
        '4   15         8',
        '4       2   122#',
        '@23     #   8@@#',
        '@@4  ^^^#^ 266##',
        '@@@3    <#    8#',
        '@@@#2   <#^^^ 8#',
        '@@@4          8#',
        '@@@#2222222222##',
    ]
}