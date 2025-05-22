// ===== Canvas Constants =====
const canvasElement = document.getElementById('mainCanvas');
const ctx = canvasElement.getContext('2d');
const canvasHalfWidth = canvasElement.width * 0.5;
const canvasHalfHeight = canvasElement.height * 0.5;

const deg2rad = Math.PI / 180;
const rad2deg = 180 / Math.PI;

// ===== Input =====
    let Gamepads = [];

    canvasElement.addEventListener('mousemove', function(e){
        mouse.real.x = (e.offsetX / canvasElement.clientWidth) * canvasElement.width;
        mouse.real.y = (e.offsetY / canvasElement.clientHeight) * canvasElement.height;

        mouse.movementX = e.movementX;
        mouse.movementY = e.movementY;
    });

    canvasElement.addEventListener('mousedown', function(e){
        mouse[e.button] = true;
    });
    
    document.addEventListener('mouseup', function(e){
        mouse[e.button] = false;
    });
    
    window.addEventListener("gamepadconnected", (e) => {
        Gamepads = navigator.getGamepads();
        console.log(e.gamepad);
    })


    

    let keys = {};
    let keysPressTime = {};
    let keysReleaseTime = {};
    let gamePads = navigator.getGamepads();

    let mouse = {
        0: false,
        1: false,
        2: false,

        real : {
          x: 0,
          y: 0,
        },

        get x() {
          return Math.floor(mouse.real.x);
        },

        get y() {
          return Math.floor(mouse.real.y);
        },

        movementX : 0,
        movementY : 0,

        inAreaCheck(x, y, w, h){
            return (mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h);
        }
    };

    let Time = {
        deltaTime : 0,
        now : 0,
        launchTime : new Date().getTime(),
        startGameTime: 0,
        frameCount : 0,
        engineCount : 0,
    };    

    document.addEventListener('keydown', function(e){
        keys[e.code] = true;
        keysPressTime[e.code] = Time.now;
        onAnyKeyDown();

        if(devToolsEnabled){
            if(e.code === "KeyC"){
                console.log("tried to copy");
                if(key("ShiftLeft")){
                    let rounded = {x : Math.floor((mouse.x + Camera.real.x) / 19) * 19, y : Math.floor((mouse.y + Camera.real.y) / 19) * 19};
                    navigator.clipboard.writeText(`${rounded.x}, ${rounded.y}`);
                }else{
                    navigator.clipboard.writeText(`${mouse.x + Camera.x}, ${mouse.y + Camera.y}`);
                }
            }
        }
    });

    document.addEventListener('keyup', function(e){
        keys[e.code] = false;
        keysReleaseTime[e.code] = Time.now;
    });

    function key(keyCode){
        return (keys[keyCode] === true ? 1 : 0);
    }

    function btn(scheme, button){
        return (keys[scheme[button]] === true ? 1 : 0);
    }


    function gamepadAxis(axis, gamepadIndex = 0){
        if(Gamepads[gamepadIndex] === undefined){
            return 0;
        }
        return Gamepads[gamepadIndex].axes[ControlSchemes.Player1.gamepad[axis]];
    }

    function gamepadBtn(button, gamepadIndex = 0){
        if(Gamepads[gamepadIndex] === undefined){
            return 0;
        }
        return Gamepads[gamepadIndex].buttons[ControlSchemes.Player1.gamepad[button]].value;
    }

    function getInputAxis(axis, posBtn, negBtn, gamepadIndex = 0){
        let btnAxis = -btn(ControlSchemes.Player1, negBtn) + btn(ControlSchemes.Player1, posBtn);
        let gameAxis = gamepadAxis(axis, gamepadIndex);

        if( Math.abs(gameAxis) < ControlSchemes.Player1.deadZone){
            return btnAxis;
        }

        if( Math.abs(btnAxis) > 0 ){
            return btnAxis;
        }else {
            return gameAxis;
        }
    }

    function getInputBtn(padBtn, keyBtn, gamepadIndex = 0){
        let btnVal = btn(ControlSchemes.Player1, keyBtn);
        let gameVal = gamepadBtn(padBtn, gamepadIndex);
        
        if( Math.abs(gameVal) < ControlSchemes.Player1.deadZone){
            return btnVal;
        }

        if( Math.abs(btnVal) > 0 ){
            return btnVal;
        }else {
            return gameVal;
        }
    }

    function getInputBtnWithin(padBtn, keyBtn, millisecs, gamepadIndex = 0){
        let btnVal = btnPressedWithin(ControlSchemes.Player1, keyBtn, millisecs);
        let gameVal = gamepadBtn(padBtn, gamepadIndex);
        
        if( Math.abs(gameVal) < ControlSchemes.Player1.deadZone){
            return btnVal;
        }

        if( Math.abs(btnVal) > 0 ){
            return btnVal;
        }else {
            return gameVal;
        }
    }


    function keyPressedWithin(keyCode, millisecs){
        if(keysPressTime[keyCode] + millisecs > Time.now){
            return 1;
        }else {
            return 0;
        }
    }

    function keyReleasedWithin(keyCode, millisecs){
        if(keysReleaseTime[keyCode] + millisecs > Time.now){
            return 1;
        }else {
            return 0;
        }
    }

    function btnPressedWithin(scheme, button, millisecs){
        if(keysPressTime[scheme[button]] + millisecs > Time.now){
            return 1;
        }else {
            return 0;
        }
    }

    function btnReleasedWithin(scheme, button, millisecs){
        if(keysReleaseTime[scheme[button]] + millisecs > Time.now){
            return 1;
        }else {
            return 0;
        }
    }

    let now = new Date();
    now = now.getTime();
    let lastTime = now;

    function engineUpdate(){
        let now = new Date();
        now = now.getTime();
        Time.now = now;

        Time.deltaTime = now - lastTime;
        lastTime = now;

        if(Time.deltaTime < 100){
            MasterUpdate();
            Time.frameCount++;
        }else{
            console.log("You've Left!");
        }

        Time.engineCount++;
        requestAnimationFrame(engineUpdate);
    }

//

let Sheet = new Image();
Sheet.src = "Sheet.png";

document.addEventListener("click", clickToStartTrigger);

function clickToStartTrigger(){
	document.removeEventListener("click", clickToStartTrigger);
	start();
}