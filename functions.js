function start(){
    engineUpdate();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.font = `bold 19px monogram`;
    //ctx.globalCompositeOperation = "lighter";

    changeArea(AreaAtlas.test03);
    //CutSceneAtlas.currentScene = CutSceneAtlas.IntroCutScene;
}

function drawImg( region, x, y, w = -1, h = -1, context = ctx ){
    if(w = -1) {
        w = region.w;
    }

    if(h = -1) {
        h = region.h;
    }

    context.drawImage(Sheet, region.x, region.y, region.w, region.h, x + region.offsetX, y + region.offsetY, w, h);
}

let Players = [
    new Player("player1", ControlSchemes.Player1, /*0.15*/ 0.2, 1.5 /* set to 1.5 in a Lab:JumpGet ItemPickup */, 0.02),
    //new Player("player2", ControlSchemes.Player2, 0.15, 1.5)
];

let particleList = [];

function MasterUpdate(){
    if(CutSceneAtlas.currentScene !== undefined){
        cutSceneUpdate();
    }else{
        gameUpdate();
    }

    if(devToolsEnabled){ ctx.fillText(Math.round(1000 / Time.deltaTime), 0, 190); }
}

function changeArea(level, x = -1, y = -1){
    currentLevel = level;
    loadedBlocks = [];

    for(let i = 0; i < level.blocks.length; i+= 4){ // x, y, z, blockName
        
        loadedBlocks.push(new Block(
            level.blocks[ i ]     * 19, 
            level.blocks[ i + 1 ] * 19,
            level.blocks[ i + 2 ] * 19,
            level.key[level.blocks[ i + 3 ]].solid,
            level.key[level.blocks[ i + 3 ]]
        ));

    }

    if(x != -1){
        Players[0].real.x = x;
    }
    if(y != -1){
        Players[0].real.y = y;
    }

    /*Camera.real.x = Players[0].real.x - canvasHalfWidth + 9;
    Camera.real.y = Players[0].real.y - canvasHalfWidth + 9;*/

    particleList = []; // clears all particles

    if(currentLevel.backdrop !== undefined){
        if( currentLevel.backdrop.color !== undefined) { // if backdrop has a color key...
            canvasElement.style.backgroundColor = currentLevel.backdrop.color;
        }

        if( currentLevel.backdrop.image !== undefined) { // if backdrop has an image key
            canvasElement.style.backgroundImage = `url('${ currentLevel.backdrop.image }')`;
            
            if(typeof currentLevel.backdrop.width === "string"){
                canvasElement.style.backgroundSize = `${currentLevel.backdrop.width} ${currentLevel.backdrop.height}`;
            }else{
                canvasElement.style.backgroundSize = `${currentLevel.backdrop.width}px ${currentLevel.backdrop.height}px`;
            }
        }
    }

    if(currentLevel.entities !== undefined){
        for(let i = 0; i < level.entities.length; i++){
            try{
                currentLevel.entities[i]?.start();
            }
            catch(error) {

            }
        }
    }
}

function gameUpdate(){
    ctx.clearRect(0,0,canvasElement.width, canvasElement.height);
    while(controlSeq.length > 64){
        controlSeq = controlSeq.slice(-64);
    }

    //player.real.x += ( -btn(ControlSchemes.Player1, "left") + btn(ControlSchemes.Player1, "right")) * Time.deltaTime * 0.1;
    //player.real.y += ( -btn(ControlSchemes.Player1, "up") + btn(ControlSchemes.Player1, "down")) * Time.deltaTime * 0.1;
    

    /*Camera.real.x -= (Camera.real.x - (Players[0].real.x - canvasHalfWidth + 8)) * 0.015 * Time.deltaTime;
    Camera.real.y -= (Camera.real.y - (Players[0].real.y - canvasHalfHeight + 8)) * 0.015 * Time.deltaTime;*/

    /*Camera.real.x = ExtraMath.clamp(Camera.real.x, 0, currentLevel.layout[0].length * 19 - 19 * 10);
    Camera.real.y = ExtraMath.clamp(Camera.real.y, 0, currentLevel.layout.length * 19 - 19 * 10);*/

    if(mouse[0]){
        Camera.rotation += mouse.movementX ;
    }

    Camera.rotation += (-key("KeyA") + key("KeyD")) * Time.deltaTime * 0.05;
    Camera.real.y += (-key("ArrowUp") + key("ArrowDown")) * Time.deltaTime * 0.05;
    let movementVec = Math2.rot(
        (-key("ArrowLeft") + key("ArrowRight")),
        0,
        Camera.rotation
    );
    //console.log(movementVec.x, movementVec.y);
    Camera.real.x += movementVec.x * Time.deltaTime * 0.05;
    Camera.real.z += movementVec.y * Time.deltaTime * 0.05;
    //loadedBlocks[loadedBlocks.length - 1] = new Block(Camera.x, Camera.y, Camera.z, false, TileAtlas.testElements.cube);
    
    if(!mouse[0] && key("KeyA") + key("KeyD") === 0){
        //Camera.rotation = Camera.step * ;
        Camera.rotation += ( Math.round(Camera.step * 90) - Camera.rotation) * 0.01 * Time.deltaTime;
    }else{
        Camera.step = Math.round(Camera.rotation / 90);
    }
    
    
    drawLoadedBlocks();
    //drawLevel(-Camera.x, -Camera.y, currentLevel, true);
    
    if(key("Space") === 1){
        particleList.push(new BasicParticle(Players[0].x + 9.5, Players[0].y + 9.5, (Math.random() - 0.5) * 6, Math.random() * 3, 1000, ParticleAtlas.effects.green));
    }
    
    for(let i = 0; i < particleList.length; i++){ // TODO : Fix the particle deletion, perhaps look at the "missed beat" game
        particleList[i].tick();
        particleList[i].draw();
        if(particleList[i].age > particleList[i].lifetime){
            particleList.splice(i, 1);
        }
        //console.log(particleList[i]);
    }
    
    //worldArrow(player2.x + 8, player2.y + 8, 95, 95, "#f0f", "#af2");
    
    if(devToolsEnabled){
        ctx.fillText(Camera.rotation.toString(), 64, 64);
        ctx.fillText(`Camera: ${Camera.x}, ${Camera.y}, ${Camera.z}`, 16, 190);
        ctx.fillText(controlSeq, 0, 180, 190);
        ctx.fillStyle = "#fff";
        if(key("ShiftLeft")){
            let rounded = {x : Math.floor((mouse.x + Camera.real.x) / 19) * 19, y : Math.floor((mouse.y + Camera.real.y) / 19) * 19};
            ctx.fillRect(rounded.x - Camera.x, rounded.y - Camera.y, 4, 4);
            ctx.fillText(`${rounded.x}, ${rounded.y}`, rounded.x - Camera.real.x, rounded.y - Camera.real.y + 19);
        }else{
            ctx.fillText(`${mouse.x + Camera.x}, ${mouse.y + Camera.y}`, mouse.x, mouse.y);
        }
    }


    // Backdrop Paralax Effect
    canvasElement.style.backgroundPosition = `${ Camera.real.x * -0.5 }px ${ Camera.real.y * -0.5 }px`;
    
    //BasicAreaChecks.inBox(19 * 14.5, 19 * 6.5, Players[0].x, Players[0].y, 3, 7)
}

function onAnyKeyDown(){
    if(key("KeyQ")){
        Camera.step -= 1;
        controlSeq = controlSeq + "LT";
    }
    if(key("KeyE")){
        Camera.step += 1;
        controlSeq = controlSeq + "RT";
    }
}
function onAnyKeyUp(e){
    if(e.code === "KeyA"){
        controlSeq = controlSeq + "L";
    }
    if(e.code === "KeyD"){
        controlSeq = controlSeq + "R";
    }
    if(e.code === "KeyW"){
        controlSeq = controlSeq + "U";
    }
    if(e.code === "KeyS"){
        controlSeq = controlSeq + "D";
    }
}

function cutSceneUpdate(){
    CutSceneAtlas.currentScene();
    gameUpdate();
}

function drawTileRegion(x, y, regionObj, context = ctx, useCamera = true ){

    if(Array.isArray(regionObj.region)){
        //console.log(Math.round((Time.now - Time.launchTime) * 0.01) % region.length);
        let reginThisFrame = regionObj.region[Math.round((Time.now - Time.launchTime) * regionObj.speed) % regionObj.region.length];
        drawImg(reginThisFrame, (x), (y), reginThisFrame.w, reginThisFrame.h, context);
    }else{
        drawImg(regionObj.region, (x), (y), regionObj.region.w, regionObj.region.h, context);
    }
}

function sortLoadedBlocks(){
    let sortedBlocks = loadedBlocks.slice(0);

    //console.log(sortedBlocks);

    let swap = (indexA, indexB) => {
        let a = sortedBlocks[indexA];
        sortedBlocks[indexA] = sortedBlocks[indexB];
        sortedBlocks[indexB] = a;
    }

    for(let i = 1; i < loadedBlocks.length; i++ ){
        let j = i;
        while ( sortedBlocks[j - 1].camSpace.y < sortedBlocks[j].camSpace.y && j-1 > 0 ){
            swap(j, j - 1);
            j--;
        }
    }

    /*for(let i = 0; i < loadedBlocks.length; i++ ){
        let pointedElement = loadedBlocks[i];
        let pointedCamSpace = pointedElement.camSpace;
        sortedBlocks[i].depthInScreen = pointedElement.camSpace.y;
        for(let j = 0; j < loadedBlocks.length; j++ ){
            if(j === i){ continue; } // if looking at the element in the pointer, leave;

            if(pointedCamSpace.y > loadedBlocks[j].camSpace.y){
                swap(j, i);
            }
        }
    }*/

    return sortedBlocks;
}

function drawLoadedBlocks(){
    let sortedBlocks = sortLoadedBlocks();

    if(currentLevel.entities !== undefined){
        for(let i = 0; i < currentLevel.entities.length; i++){
            currentLevel.entities[i].tick();
        }
    }

    for(let i = 0; i < sortedBlocks.length; i++){
        /*if(sortedBlocks[i].camSpace.y > mouse.y){
            return;
        }*/
        //ctx.fillStyle = `rgb(${sortedBlocks[i].camSpace.y}, ${sortedBlocks[i].camSpace.y}, ${sortedBlocks[i].camSpace.y}, 0.5)`;
        drawTileRegion(
            Math.round(sortedBlocks[i].camSpace.x + canvasHalfWidth),
            Math.round(sortedBlocks[i].y - Camera.y + canvasHalfHeight),
            sortedBlocks[i].sprite,
            ctx,
            false
        );
        //ctx.fillRect(Math.round(sortedBlocks[i].camSpace.x + canvasHalfWidth),
        //Math.round(sortedBlocks[i].y + canvasHalfHeight), 19, 19);
        
        drawTileRegion(
            Math.round(sortedBlocks[i].camSpace.x + canvasHalfWidth),
            Math.round(sortedBlocks[i].camSpace.y + canvasHalfHeight * 4),
            sortedBlocks[i].sprite,
            ctx,
            false
        );
    }
}

function drawLevel(xOffset = -Camera.x, yOffset = -Camera.y, level = currentLevel, includePlayer = false, drawParalax = true, context = ctx){

    

    for(let y = 0; y < level.layout.length; y++){
        for(let x = 0; x < level.layout[y].length; x++){
            let levelKey = level.key[level.layout[y][x]];
            drawTileRegion(x * 19 + xOffset, y * 19 + yOffset, levelKey, context, false);
        }
    }

    if(includePlayer) {
        Players[0].tick();
    }

    if(level.entities !== undefined){
        for(let i = 0; i < level.entities.length; i++){
            level.entities[i].tick();
        }
    }
}

function setTempSolid(x, y, solidityKey){
    if(tempCollison[y] === undefined || tempCollison[y][x] === undefined){
        console.log("NULL!!!!!!!!!!!!!!!!!!!!!!");
        return;
    }

    tempCollison[y] = tempCollison[y].slice(0, x) + solidityKey + tempCollison[y].slice(x + 1);
}

function setTile(x, y, replaceWithKey, level = currentLevel){
    if(level.layout[y] === undefined || level.layout[y][x] === undefined){
        console.log("NULL!!!!!!!!!!!!!!!!!!!!!!");
        return;
    }
    
    level.layout[y] = level.layout[y].slice(0, x) + replaceWithKey + level.layout[y].slice(x + 1);
}

function setBackgroundTile(x, y, replaceWithKey, level = currentLevel){
    if(level.background[y] === undefined || level.layout[y][x] === undefined){
        console.log("no background");
        return;
    }
    
    level.background[y] = level.background[y].slice(0, x) + replaceWithKey + level.background[y].slice(x + 1);

}

function isTileSolid(x, y, level = currentLevel){
    if(level.layout[y] === undefined || level.layout[y][x] === undefined){
        console.log("NULL!!!!!!!!!!!!!!!!!!!!!!");
        return true;
    }

    if(tempCollison[y] !== undefined && tempCollison[y][x] !== undefined){
        if(level.key[tempCollison[y][x]].solid){
            return true;
        }
    }
    return level.key[level.layout[y][x]].solid;
}

function isWorldTileSolid(x, y, level = currentLevel){
    return isTileSolid(Math.round((x) / 19), Math.round((y) / 19), level);
}

function getTile(x, y, level = currentLevel){
    if(level.layout[y] === undefined || level.layout[y][x] === undefined){
        console.log("NULL!!!!!!!!!!!!!!!!!!!!!!");
        return undefined;
    }
    return level.key[level.layout[y][x]];
}

function drawArrow(x, y, angle, primaryColor, secondaryColor, tail = 0){
    ctx.strokeStyle = secondaryColor;
    ctx.fillStyle = primaryColor;

    ctx.beginPath();
    ctx.moveTo( Math.cos(angle * deg2rad) * 19 + x, Math.sin(angle * deg2rad) * 19 + y );
    ctx.lineTo( Math.cos((angle + 120) * deg2rad) * 8.5 + x, Math.sin((angle + 120) * deg2rad) * 8.5 + y );
    ctx.lineTo( x, y );
    ctx.lineTo( Math.cos((angle + 240) * deg2rad) * 8.5 + x, Math.sin((angle + 240) * deg2rad) * 8.5 + y );
    ctx.fill();
    ctx.stroke();
}

function worldArrow(targetX, targetY, drawX, drawY, color1, color2){
    drawArrow(drawX, drawY, pointToAngle( targetX - drawX - Camera.x, targetY - drawY - Camera.y), color1, color2);
}

function pointToAngle(x, y){
    if(x >= 0){
        return Math.atan(( y ) / ( x )) * rad2deg;
    }else{
        return Math.atan(( y ) / ( x )) * rad2deg + 180;
    }
}

function inAreaCheck(pointX, pointY, x, y, w, h){
    return (pointX >= x && pointX <= x + w && pointY >= y &&pointY <= y + h);
}

const ParticlePresets = {
    spark(x, y, width, height, sparks = 10){
        for(let i = 0; i < sparks; i++){
            particleList.push(new BasicParticle(x, y, (Math.random() - 0.5) * width , Math.random() * height, 100));
        }
    },

    directedSpark(x, y, angle, spread, speed, sparkCount = 10, lifetime = 1000, sprite = ParticleAtlas.effects.green){
        for(let i = 0; i < sparkCount; i++ ){
            particleList.push(new BasicParticle(x, y, Math.cos(((Math.random() - 0.5) * spread + angle) * deg2rad) * speed, Math.sin(((Math.random() - 0.5) * spread + angle) * deg2rad) * speed, lifetime + ((Math.random() - 0.5) * lifetime * 0.25), sprite));
        }

    }
}

const BasicAreaChecks = {
    inCircle(centerX, centerY, radius, testX, testY){

        if(devToolsEnabled){
            ctx.beginPath();
            ctx.arc(centerX - Camera.x, centerY - Camera.y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }
        return (Math2.distance(new vec2(testX, testY), new vec2(centerX, centerY)) <= radius );
    },

    inBox(centerX, centerY, testX, testY, halfWidth = 9.5, halfHeight = 9.5){
        ctx.fillStyle = "#ffffff88";
        ctx.fillRect(centerX - Camera.x, centerY - halfHeight - Camera.y, halfWidth * 2, halfHeight * 2);
        if( testX <= centerX + halfWidth && testX >= centerX - halfWidth){
            if( testY <= centerY + halfHeight && testY >= centerY - halfHeight){
                return true;
            }
        }
        return false;
    },
    
    inRect(x, y, w, h, testX, testY){
        if(devToolsEnabled){
            ctx.fillStyle = "#66339988";
            ctx.fillRect(x - Camera.x, y - Camera.y, w, h);
            ctx.fillRect(testX - 2 - Camera.x, testY - 2 - Camera.y, 4, 4);
        }
        if(testX <= x + w && testX >= x){
            if(testY <= y + h && testY >= y){
                return true;
            }
        }
        return false;
    }
}

function getArrayToObjPath(object, path){ // from <object> goes down the path <path> sugests
    // <path> example: if <object> looks like {foo: [ a, b, {apple: 4, bar: 42}]} ["foo", 2, "bar"] means <object>.foo[2].bar which returns 42
    let localObjectRef = object;
    for(let i = 0; i < path.length; i++){
        localObjectRef = localObjectRef[path[i]];
    }
    return localObjectRef;
}

function setArrayToObjPath(object, path, value){ // from <object> goes down the path <path> sugests
    // <path> example: if <object> looks like {foo: [ a, b, {apple: 4, bar: 42}]} ["foo", 2, "bar"] means <object>.foo[2].bar which will be set to <value>
    let localObjectRef = object;
    for(let i = 0; i < path.length - 1; i++){
        localObjectRef = localObjectRef[path[i]];
    }
    localObjectRef[path[path.length - 1]] = value;
}

const BezierCurveFunctions = {
    LinearLerp(a, b, t){
        return ( 1 - t ) * a + b * t;
    },
    QuadraticLerp(a, b, c, t){
        return this.LinearLerp( this.LinearLerp( a, b, t ), this.LinearLerp( b, c, t), t );
    },
    CubicLerp( a, b, c, d, t){
        return this.QuadraticLerp( this.LinearLerp( a, b, t), this.LinearLerp( b, c, t), this.LinearLerp(c, d, t), t );
    }
};

const ExtraMath = {
    clamp(val, min, max){
        if(val < min){
            return min;
        }else if(val > max){
            return max;
        }
        return val;
    }
}

function findInObjectFromString(obj, string){ // sepperates a string by '/' and looks for it in an object
    let directory = string.split("/");
    let localLevel = obj;

    for(let i = 0 ; i < directory.length; i++ ){
        localLevel = localLevel[directory[i]];
    }

    //console.log(localLevel);
    return localLevel;
}

const Collisons = {
    gravity(thisEntity, mult = 1){
        if(thisEntity.real !== undefined && thisEntity.motion !== undefined){
            thisEntity.motion.y += Time.deltaTime * 0.005 * mult;
            thisEntity.real.y += thisEntity.motion.y * Time.deltaTime * 0.2;
        }
    },

    getOutOfSerfaceY(thisEntity){
        if(thisEntity.real !== undefined && thisEntity.motion !== undefined && thisEntity.hitbox !== undefined){
            if(thisEntity.hitbox){
                while(thisEntity.hitbox){
                    thisEntity.real.y -= Math.abs(thisEntity.motion.y) / thisEntity.motion.y; // get out of the ground in the oppesite direction you went in
                }
            }
        }
    },

    getOutOfSerfaceX(thisEntity){
        if(thisEntity.real !== undefined && thisEntity.motion !== undefined && thisEntity.hitbox !== undefined){
            if(thisEntity.hitbox){
                while(thisEntity.hitbox){
                    thisEntity.real.x -= Math.abs(thisEntity.motion.x) / thisEntity.motion.x; // get out of the ground in the oppesite direction you went in
                }
            }
        }
    }
}