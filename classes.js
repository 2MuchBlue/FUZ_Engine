class Region {
    constructor( x, y, w=19, h=19, offsetX = 0, offsetY = 0){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}

class KeyEvent {
    constructor(pressTime, releaseTime){
        this.pressTime = pressTime;
        this.releaseTime = releaseTime;
    }
}

class Player {
    constructor( name, controlScheme, horSpeed, jumpPower, gainingSpeed = 0.001, slowingSpeed = 0.025 ){
        this.name = name;
        this.controlScheme = controlScheme;
        this.horizontalSpeed = horSpeed;
        this.slowingSpeed = slowingSpeed; // friction on movement key release
        this.gainingSpeed = gainingSpeed; // friction on movement key down
        this.jumpPower = jumpPower;
        this.real = {
            x : 19,
            y : 19
        }

        this.motion = {
            x : 0,
            y : 0
        }

        this.extraData = {
            "lastFrameOnGround" : 0
        };

        this.coyoteValues = {
            "timeOffTheLedge" : 100
        },

        this.physObject = true;
        this.tags = {
            "player" : true
        };

        this.wallKickPower = 7.5;

        this.movementInputEnabled = true;

        this.dragState = "in air";

        this.wallKicksAllowed = 0; // set to 2 in Lab:JumpGet
    }

    get hitbox() { // semi-hardcoded hitbox thing
        let w = 4;
        let h = 8;
        return(
            isTileSolid(Math.round((this.real.x) / 19), Math.round((this.real.y) / 19)) ||

            isTileSolid(Math.round((this.real.x) / 19), Math.round((this.real.y - h) / 19)) || //  '
            isTileSolid(Math.round((this.real.x) / 19), Math.round((this.real.y + h) / 19)) || //  .

            isTileSolid(Math.round((this.real.x - w) / 19), Math.round((this.real.y) / 19)) || // -  
            isTileSolid(Math.round((this.real.x + w) / 19), Math.round((this.real.y) / 19)) || //   -

            isTileSolid(Math.round((this.real.x - w) / 19), Math.round((this.real.y - h) / 19)) || // fix :(
            isTileSolid(Math.round((this.real.x + w) / 19), Math.round((this.real.y - h) / 19)) ||

            isTileSolid(Math.round((this.real.x - w) / 19), Math.round((this.real.y + h) / 19)) ||
            isTileSolid(Math.round((this.real.x + w) / 19), Math.round((this.real.y + h) / 19))
        );
    }

    get x(){
        return Math.round(this.real.x);
    }
    get y(){
        return Math.round(this.real.y);
    }

    draw(state, flipped = false){
        function drawCall(state, _this) {
            switch (state) {
                case "run":
                    drawImg(SpriteAtlas.player.run[Math.round((Time.now - Time.launchTime) * 0.0075) % SpriteAtlas.player.run.length], _this.x - Camera.x, _this.y - Camera.y - 1);
                    break;
                case "idle2":
                    drawImg(SpriteAtlas.player.idle2[Math.round((Time.now - Time.launchTime) * 0.0075) % SpriteAtlas.player.idle2.length], _this.x - Camera.x, _this.y - Camera.y - 1);
                    break;
                default:
                    drawImg(SpriteAtlas.player.idle[Math.round((Time.now - Time.launchTime) * 0.0075) % SpriteAtlas.player.idle.length], _this.x - Camera.x, _this.y - Camera.y - 1);
                    break;
            }
        }
        
        if(flipped){
            ctx.save();
            ctx.translate((this.x - Camera.x + 9.5) * 2, 0);
            ctx.scale(-1, 1);
            drawCall(state, this);
            ctx.restore();
        }else{
            drawCall(state, this);
        }
    }

    #tryWallKick(){
        if(getInputBtn("kick", "kick")){ 
            let direction = Math.abs(this.motion.x) / this.motion.x;
            if ( isTileSolid(Math.round((this.real.x + (direction * 5)) / 19), Math.round((this.real.y) / 19)) && this.extraData.wallKicks > 0 && this.jumpPower > 0 && this.extraData.kickedThisFrame === false ){
                this.motion.x = -direction * this.wallKickPower;
                this.motion.y = -this.jumpPower;
                this.extraData.wallKicks -= 1;
                this.extraData.wallKickTime = 0;
                this.extraData.kickedThisFrame = true;
            }
        }
    }

    tick(){
        this.extraData.kickedThisFrame = false;

        //this.dragState = "in air";

        //let vertical = ( -btn(this.controlScheme, "up") + btn(this.controlScheme, "down")) * this.horizontalSpeed * Time.deltaTime;

        this.motion.y += Time.deltaTime * 0.005;
        if(btn(this.controlScheme, "down") === 1 && this.movementInputEnabled){
            this.motion.y += Time.deltaTime * 0.0075;
        }
        this.real.y += this.motion.y * Time.deltaTime * 0.2;
        if(this.hitbox){ // if on ground...
            while(this.hitbox){ // while on ground...
                this.real.y -= Math.abs(this.motion.y) / this.motion.y; // get out of the ground in the oppesite direction you went in
            }
            if((Math.abs(this.motion.y) / this.motion.y) === 1){ // if motion was directed down...
                this.extraData.canCoyoteTime = true;
                this.dragState = "on ground";
                this.extraData.wallKicks = this.wallKicksAllowed; // 2 wall kicks allowed before recharge needed.
            }
            if(btn(this.controlScheme, "down") === 1 && Math.abs(this.motion.y) > 1 && this.movementInputEnabled){ // if down button pressed and there is any amount of vertical motion...
                //console.log("bounce!");
                for(let i = 0; i < 10; i++){
                    particleList.push(new BasicParticle(this.x + 9.5, this.y + 16, (Math.random() - 0.5) * 6, Math.random() * 10, 500 + (Math.random() * 500), ParticleAtlas.effects.blue));
                }
                this.dragState = "in air";
                this.motion.y *= -0.9;
            }else if (btn(this.controlScheme, "down") === 1 && Math.abs(this.motion.y) <= 1 && this.movementInputEnabled){ // if down button pressed and there is not much vertical motion...
                this.motion.y = 0;
                this.dragState = "sliding";
            }else{
                this.motion.y = 0;
                this.dragState = "on ground";
            }
            
            this.extraData.lastOnGroundTime = Time.now;
            this.extraData.wasOnGroundLastFrame = true;
        }else{ // if not on ground...
            this.extraData.wasOnGroundLastFrame = false;
            if(this.extraData.lastOnGroundTime + 50 < Time.now){
                this.dragState = "in air";
            }
            
        }

        // checks if 1) has pressed the jump button recently, 2) making sure you haven't already jumped, 3) tests if you were on the ground in the last 150 milisecs.
        if(getInputBtnWithin( "action", "up", 150) === 1 && this.extraData.canCoyoteTime && this.extraData.lastOnGroundTime + 150 > Time.now && this.movementInputEnabled){
            this.motion.y = -this.jumpPower;
            this.extraData.canCoyoteTime = false;
            this.extraData.hasJumped = true;

            this.hitGroundParticle();
        }

        let rawHorz = getInputAxis("horzAxis", "right", "left") * (this.movementInputEnabled ? 1 : 0);
        let targetmotion = {x : 0, y : 0};
        targetmotion.x = rawHorz * this.horizontalSpeed * Time.deltaTime;

        let dragVal;
        if(this.dragState === "on ground" && Math.abs(rawHorz) > 0.2){ // if on ground and moving...
            dragVal = this.gainingSpeed;
            if(Math.random() * 5 > 4){ // 1/5 chance to spawn a running particle
                this.runningParticle();
            }
        }else if (this.dragState === "on ground" && Math.abs(rawHorz) <= 0.2 ){ // if on ground and NOT moving...
            rawHorz = 0;
            dragVal = this.slowingSpeed;
        }else if (this.dragState === "in air" && Math.abs(rawHorz) > 0.2){ // if in air and moving...
            dragVal = this.gainingSpeed;
        }
        else if (this.dragState === "in air" && Math.abs(rawHorz) <= 0.2){ // if in air and NOT moving...
            dragVal = 0.0095; // maybe change to 0.0085
            rawHorz = 0;
        }
        /*else if (this.dragState === "sliding"){
            dragVal = 0.001;
            this.motion.x += this.motion.y * Time.deltaTime * 0.001 * -10 * rawHorz;
        }*/else{ // if all else fails, scream...
            dragVal = this.slowingSpeed;
        }
        if(devToolsEnabled) {ctx.fillText(this.dragState, this.x - Camera.x, this.y - Camera.y);}
        this.motion.x += (targetmotion.x - this.motion.x) * 0.4 * Time.deltaTime * dragVal;

        if(rawHorz >= this.controlScheme.deadZone){
            this.extraData.flipped = true;
        }else if(rawHorz <= -this.controlScheme.deadZone){
            this.extraData.flipped = false;
        }
        
        this.#tryWallKick();
        this.real.x += this.motion.x;
        
        if(this.hitbox){
            while(this.hitbox){
                this.real.x -= Math.abs(this.motion.x) / this.motion.x;
            }
            
            this.extraData.canWallJump = true;
            this.extraData.lastWallTouchTime = Time.now;
        }

        // checks if 1) has pressed the jump button recently, 2) making sure you haven't already jumped, 3) tests if you were on the ground in the last 150 milisecs.
        /*if(btn(this.controlScheme, "up") === 1 && !this.extraData.hasWallJumped && this.extraData.canWallJump && this.extraData.lastWallTouchTime + 150 > Time.now){
            this.motion.y = -this.jumpPower;
            this.extraData.canWallJump = false;
            this.extraData.hasWallJumped = true;
        }*/

        if(Math.abs( rawHorz ) > 0.2){
            this.draw("run", this.extraData.flipped);
        }else{
            if(key("Space") === 1){
                this.draw("idle2", this.extraData.flipped);
            }else{
                this.draw("idle", this.extraData.flipped);
            }
        }
    }

    hitGroundParticle() {
        for(let i = 0; i < 10; i++){
            particleList.push(new BasicParticle(this.x + 9.5, this.y + 9.5, (Math.random() - 0.5) * 2 , Math.random() * 3, 1000, ParticleAtlas.effects.purple));
        }
    }

    runningParticle(){
        particleList.push(new BasicParticle(this.x + 9.5, this.y + 15, ((Math.random()) * 3 + 5) * (this.extraData.flipped ? -1 : 1 ) , Math.random() * 3, 500 + (Math.random() * 250), ParticleAtlas.effects.purple));
    }
}

class BasicParticle {
    constructor(x, y, motionX, motionY, lifetime, texture = ParticleAtlas.terminalParticles.blue){
        this.startX = x;
        this.startY = y;
        this.real = {
            x : x,
            y : y
        }

        this.texture = texture;

        this.motion = {
            x : motionX,
            y : motionY
        }

        this.lifetime = lifetime;
        this.spawnTime = Time.now;
        this.age = 0;

        this.physObject = true;
    }

    get x(){
        return Math.round(this.real.x);
    }
    get y(){
        return Math.round(this.real.y);
    }

    hitbox(){
        return isTileSolid(Math.floor((this.real.x) / 19), Math.floor((this.real.y) / 19));
    }

    tick(){
        this.age = Time.now - this.spawnTime;
        this.real.x += this.motion.x * 0.02 * Time.deltaTime;
        if(this.hitbox()){
            let oFartCount = 0;
            while(this.hitbox() && oFartCount < 38){
                this.real.x -= Math.abs(this.motion.x) / this.motion.x;
                oFartCount++;
            }
            this.motion.x *= -0.85;
        }
        //this.motion.x = this.motion.x;
        this.motion.y = this.motion.y + Time.deltaTime * 0.02;
        this.real.y += this.motion.y * 0.02 * Time.deltaTime;
        if(this.hitbox()){
            let oFartCount = 0;
            while(this.hitbox() && oFartCount < 38){
                this.real.y -= Math.abs(this.motion.y) / this.motion.y;
                oFartCount++;
            }
            this.motion.y *= -0.75;
        }

        this.draw();
    }

    draw(){
        drawImg(this.texture, this.x - Camera.x, this.y - Camera.y);
        //ctx.fillRect(this.x - Camera.x, this.y - Camera.y, 10, 10);
    }
}

class DustParticle {
    constructor(x, y, motionX, motionY, lifetime, texture = ParticleAtlas.terminalParticles.blue){
        this.startX = x;
        this.startY = y;
        this.real = {
            x : x,
            y : y
        }

        this.texture = texture;

        this.motion = {
            x : motionX,
            y : motionY
        }

        this.lifetime = lifetime;
        this.spawnTime = Time.now;
        this.age = 0;

        this.physObject = true;
    }

    get x(){
        return Math.round(this.real.x);
    }
    get y(){
        return Math.round(this.real.y);
    }

    hitbox(){
        return isTileSolid(Math.floor((this.real.x) / 19), Math.floor((this.real.y) / 19));
    }

    tick(){
        this.age = Time.now - this.spawnTime;

        //this.motion.x = this.motion.x * Time.deltaTime * 0.2;
        this.real.x += this.motion.x * Time.deltaTime;
        
        //this.motion.x = this.motion.x;
        //this.motion.y = this.motion.y - Time.deltaTime * 0.02;
        //this.real.y += this.motion.y * 0.02 * Time.deltaTime;
        

        this.draw();
    }

    draw(){
        drawImg(this.texture, this.x - Camera.x, this.y - Camera.y);
        //ctx.fillRect(this.x - Camera.x, this.y - Camera.y, 10, 10);
    }
}

class ImpulseVolume { // sets velocity to a set value
    constructor(centerX, centerY, motionX = 0, motionY = 0, checkAreaFunction = (gameObjectToTest) => {return (Math2.distance(gameObjectToTest, new vec2(centerX, centerY)) < 19 ); }, playerCanMoveInVolume = true){
        this.x = centerX;
        this.y = centerY;

        this.checkAreaFunction = checkAreaFunction;

        this.motion = {
            x : motionX,
            y : motionY
        };

        this.playerCanMoveInVolume = playerCanMoveInVolume; // true: player can influence movement while in volume, false: player has no movement input control.
    }

    draw(){
        ctx.fillStyle = "#00000022";
        //ctx.fillRect(this.x - 4 - Camera.x, this.y - 4 - Camera.y, 8, 8);
    }

    tick(){
        for(let i = 0; i < Players.length; i++){
            let element = Players[i];
            if(element.physObject !== undefined){
                if(this.checkAreaFunction(element)){
                    if(this.motion.x !== 0){
                        element.motion.x = this.motion.x;
                    }
                    if(this.motion.y !== 0){
                        element.motion.y = this.motion.y;
                    }
                }
            }
        }
        //this.draw();
    }
}

class AccelerationVolume { // adds momentum to an object
    constructor(centerX, centerY, motionX = 0, motionY = 0, checkAreaFunction = (gameObjectToTest) => {return (Math2.distance(gameObjectToTest, new vec2(centerX, centerY)) < 19 ); }, playerCanMoveInVolume = true){
        this.x = centerX;
        this.y = centerY;

        this.checkAreaFunction = checkAreaFunction;

        this.motion = {
            x : motionX,
            y : motionY
        };

        this.playerCanMoveInVolume = playerCanMoveInVolume; // true: player can influence movement while in volume, false: player has no movement input control.
    }

    draw(){
        ctx.fillStyle = "#ffffff22";
        ctx.fillRect(this.x - 4 - Camera.x, this.y - 4 - Camera.y, 8, 8);
    }

    tick(){
        this.checkAllOfArray(Players, 9.5, 9.5);
        //this.checkAllOfArray(particleList);
        this.draw();
    }

    checkAllOfArray(array, offsetX = 0, offsetY = 0){
        for(let i = 0; i < array.length; i++){
            let element = array[i];
            if(element.physObject !== undefined){
                if(this.checkAreaFunction(new vec2(element.x + offsetX, element.y + offsetY))){
                    if(this.motion.x !== 0){
                        element.motion.x += this.motion.x * Time.deltaTime;
                    }
                    if(this.motion.y !== 0){
                        element.motion.y += this.motion.y * Time.deltaTime;
                    }
                }
            }
        }
    }
}

class PlayerModifier {
    constructor( x, y, pathArrayToChange, value, checkAreaFunction = (gameObjectToTest) => { return BasicAreaChecks.inRect(x, y, 19, 19, gameObjectToTest.x, gameObjectToTest.y);} ){
        this.x = x;
        this.y = y;

        this.path = pathArrayToChange;

        this.value = value;

        this.checkAreaFunction = checkAreaFunction;

    }

    tick(){
        this.checkAllOfArray(Players, 9.5, 9.5);
    }

    checkAllOfArray(array, offsetX = 0, offsetY = 0){
        for(let i = 0; i < array.length; i++){
            let element = array[i];
            if(element.physObject !== undefined){
                if(this.checkAreaFunction(new vec2(element.x + offsetX, element.y + offsetY))){
                    let localObjectRef = element;
                    for(let i = 0; i < this.path.length - 1; i++){
                        localObjectRef = localObjectRef[this.path[i]];
                    }
                    localObjectRef[this.path[this.path.length - 1]] = this.value;
                    console.log(this.value);
                }
            }
        }
    }
}

class SuspendedWireEntity{
    constructor(x1, y1, x2, y2, droop, swaySpeed = 0.5, color = "#334b66", lineWidth = 4, segments = 10){
        this.pointA = new vec2(x1, y1);
        this.pointB = new vec2(x2, y2);

        this.droop = droop;
        this.swaySpeed = swaySpeed;
        this.seed = (Math.random() - 0.5) * 180;
        this.segments = segments;

        this.color = color;
        this.lineWidth = lineWidth;
    }

    tick(){
        this.draw();
    }

    draw(){

        let sumOfSins = (t) => {
            let amplatudes = [0.07, 0.01, 0.04, 0.03, 0.01];
            let waveLengths = [2, 3, 4, 0.5, 0.21];
            let phases = [1, 0.5, 3, 2, 0.41];

            let sum = 0;
            for(let i = 0; i < amplatudes.length; i++){
                sum += amplatudes[i] * Math.sin( t * ( phases[i] * (0.5 * waveLengths[i]) ) );
            }
            return sum;
        }


        let windTime = Time.now * 0.001 * this.swaySpeed;
        let swayDist = 19 * 5;
        let droopVariance = 0.5 * Math.abs(this.pointA.y - this.pointB.y);
        ctx.beginPath();
        ctx.moveTo(this.pointA.x - Camera.x, this.pointA.y - Camera.y);
        for (let i = 0; i < this.segments + 1; i++ ){
            ctx.lineTo(
                BezierCurveFunctions.QuadraticLerp(
                    this.pointA.x,
                    ((this.pointA.x + this.pointB.x) * 0.5) + swayDist * (
                        sumOfSins(windTime + this.seed)
                    ),
                    this.pointB.x,

                    i / this.segments
                ) - Camera.x,
                BezierCurveFunctions.QuadraticLerp(
                    this.pointA.y,
                    Math.max(this.pointA.y, this.pointB.y) + this.droop + droopVariance/* * Math.sin(windTime + this.seed * Math.PI * 2)*/,
                    this.pointB.y,
                    
                    i / this.segments
                ) - Camera.y
            );
        }

        let savedStrokeStuff = {
            color : ctx.strokeStyle,
            lineWidth : ctx.lineWidth
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
        ctx.strokeStyle = savedStrokeStuff.color;
        ctx.lineWidth = savedStrokeStuff.lineWidth;
    }

    
}

class HangingWireEntity{
    constructor(x1, y1, droop, swaySpeed = 0.5, color = "#334b66", lineWidth = 4, segments = 10){
        this.point = new vec2(x1, y1);

        this.droop = droop;
        this.swaySpeed = swaySpeed;
        this.seed = (Math.random() - 0.5) * 15;
        this.segments = segments;

        this.color = color;
        this.lineWidth = lineWidth;
    }

    tick(){
        this.draw();
    }

    draw(){

        let sumOfSins = (t) => {
            let amplatudes = [0.07, 0.01, 0.04, 0.03, 0.01];
            let waveLengths = [2, 3, 4, 0.5, 0.21];
            let phases = [1, 0.5, 3, 2, 0.41];

            let sum = 0;
            for(let i = 0; i < amplatudes.length; i++){
                sum += amplatudes[i] * Math.sin( t * ( phases[i] * (0.5 * waveLengths[i]) ) );
            }
            return sum;
        }


        let windTime = Time.now * 0.001 * this.swaySpeed;
        let swayDist = 19 * 5;
        let droopVariance = 0.3;
        ctx.beginPath();
        ctx.moveTo(this.point.x - Camera.x, this.point.y - Camera.y);
        
        let sOsPoint = new vec2( // Sum Of Sins Point
            swayDist * (
                sumOfSins(windTime + this.seed)
            ),
            this.point.y + this.droop + droopVariance * Math.sin(windTime * Math.PI * 0.2),
        );

        for (let i = 0; i < this.segments + 1; i++ ){
            ctx.lineTo(
                BezierCurveFunctions.QuadraticLerp( // X
                    this.point.x,
                    this.point.x + (sOsPoint.x * 0.25),
                    sOsPoint.x + this.point.x,

                    i / this.segments
                ) - Camera.x,

                BezierCurveFunctions.QuadraticLerp( // Y
                    this.point.y,
                    ((this.point.y + sOsPoint.y) * 0.5),
                    this.point.y + this.droop,
                    
                    i / this.segments
                ) - Camera.y
            );
        }

        let savedStrokeStuff = {
            color : ctx.strokeStyle,
            lineWidth : ctx.lineWidth
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
        ctx.strokeStyle = savedStrokeStuff.color;
        ctx.lineWidth = savedStrokeStuff.lineWidth;
    }
}

class LevelTransitionTrigger {
    constructor( x, y, w, h, playerX, playerY, level, cutscene = undefined ){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.playerX = playerX;
        this.playerY = playerY;
        this.stringLevel = level;
        this.targetLevel;

        this.cutscene = cutscene;
    }

    start(){
        this.targetLevel = findInObjectFromString(AreaAtlas, this.stringLevel);
    }

    tick(){
        if(BasicAreaChecks.inRect(this.x, this.y, this.w, this.h, Players[0].real.x + 9.5, Players[0].real.y + 9.5)){
            Players[0].real.x = this.playerX;
            Players[0].real.y = this.playerY;
            changeArea(this.targetLevel);
            if(this.cutscene !== undefined){
                this.cutscene();
            }
        }
        if(devToolsEnabled){
            ctx.fillRect(this.x - Camera.x, this.y - Camera.y, this.w, this.h);
        }
    }
}

class ItemPickup {
    constructor(x, y, region, OnCollected = () => {console.log("collected!")}, AreaCheck = (thing2check) => {return BasicAreaChecks.inCircle(x, y, 19, thing2check.x, thing2check.y)}){
        this.x = x;
        this.y = y;
        this.region = region;

        this.OnCollected = OnCollected;
        this.areaCheck = AreaCheck;

        this.collected = false;

        this.enabled = true;
    }

    tick(){
        if(this.enabled){
            drawTileRegion(this.x,this.y,this.region);
            if(this.areaCheck(Players[0], this)){
                this.collected = true;
                this.enabled = false;

                this.OnCollected();
            }
        }
    }
}

class basic9Slice {
    constructor(topCornerX, topCornerY, solid = false, tileWidth = 19, tileHeight = 19, innerSectionX = -1, innerSectionY = -1){
        this.x = topCornerX;
        this.y = topCornerY;

        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.topLeft = {
            "region" : new Region( topCornerX + (0 * tileWidth), topCornerY + (0 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };
        this.top = {
            "region" : new Region( topCornerX + (1 * tileWidth), topCornerY + (0 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };
        this.topRight = {
            "region" : new Region( topCornerX + (2 * tileWidth), topCornerY + (0 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };

        this.left = {
            "region" : new Region( topCornerX + (0 * tileWidth), topCornerY + (1 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };
        this.center = {
            "region" : new Region( topCornerX + (1 * tileWidth), topCornerY + (1 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };
        this.right = {
            "region" : new Region( topCornerX + (2 * tileWidth), topCornerY + (1 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };

        this.bottomLeft = {
            "region" : new Region( topCornerX + (0 * tileWidth), topCornerY + (2 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };
        this.bottom = {
            "region" : new Region( topCornerX + (1 * tileWidth), topCornerY + (2 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };
        this.bottomRight = {
            "region" : new Region( topCornerX + (2 * tileWidth), topCornerY + (2 * tileHeight), tileWidth, tileHeight),
            "solid" : solid
        };

        if(innerSectionX !== -1){
            this.innerTopLeft = {
                "region" : new Region( innerSectionX + (0 * tileWidth), innerSectionY + (0 * tileHeight), tileWidth, tileHeight),
                "solid" : solid
            },
            this.innerTopRight = {
                "region" : new Region( innerSectionX + (1 * tileWidth), innerSectionY + (0 * tileHeight), tileWidth, tileHeight),
                "solid" : solid
            },
            this.innerBottomLeft = {
                "region" : new Region( innerSectionX + (0 * tileWidth), innerSectionY + (1 * tileHeight), tileWidth, tileHeight),
                "solid" : solid
            },
            this.innerBottomRight = {
                "region" : new Region( innerSectionX + (1 * tileWidth), innerSectionY + (1 * tileHeight), tileWidth, tileHeight),
                "solid" : solid
            }
        }
    }
}

class DrawShape {
    constructor(drawFunc = () => { ctx.fillRect(0, 0, 19, 19); }){
        this.draw = drawFunc;
    }

    moveInWorldTo(x, y){
        ctx.moveTo(x - Camera.x, y - Camera.y);
    }

    lineInWorldTo(x, y){
        ctx.lineTo(x - Camera.x, y - Camera.y);
    }

    tick(){
        this.draw();
    }
}


class EntityClass { // All element positions will be bases on the top left corner like they are drawn
    constructor ( x, y, type ){
        this.real = {
            x : x,
            y : y
        }

        this.motion = {
            x : 0,
            y : 0
        }

        this.type = type;
    }

    

    get x(){
        return Math.round(this.real.x);
    }
    get y(){
        return Math.round(this.real.y);
    }

    tick(){
        draw();
    }

    draw(){

    }
}

class PlayerSwitch extends EntityClass {
    constructor(x, y, activationRadius, triggerOnce = false, Ontrigger = () => {console.log("switch triggered!!!!")}){
        super(x, y, PlayerSwitch);
        this.activationRadius = activationRadius;

        this.flags = {
            "triggered" : false,
            "triggerOnce" : triggerOnce,

            "stillInRadius" : false,
        }

        this.OnTrigger = Ontrigger;
    }

    tick(){
        if(BasicAreaChecks.inCircle(this.x, this.y, this.activationRadius, Players[0].real.x + 9.5, Players[0].real.y + 19) && !this.flags.triggered){
            if(this.flags.triggerOnce){
                this.flags.triggered = true;
                this.OnTrigger();
            }
        }
        this.draw();
    }

    draw(){
        if(this.flags.triggered){
            drawTileRegion(this.x, this.y-19, {"region" : new Region(171, 171, 19, 19, -9, 0)});
        }else{
            drawTileRegion(this.x, this.y-19, {"region" : new Region(190, 171, 19, 19, -9, 0)});
        }
    }
}


class Block { // y is up
    constructor(x, y, z, solid, sprite){
        this.real = {
            x : x,
            y : y,
            z : z
        }

        this.solid = solid;

        this.sprite = sprite;

        this.depthInScreen = undefined;
    }

    get x(){
        return Math.round(this.real.x);
    }
    get y(){
        return Math.round(this.real.y);
    }
    get z(){
        return Math.round(this.real.z);
    }

    get camSpace(){ // x is the horizontal pos on screen; y is the depth into the screen
        return Math2.rot( this.real.x - Camera.real.x, this.real.z - Camera.real.z, Camera.rotation );
    }
}