
class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class vec3 {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class vec4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class matrix { // row major matrix
    constructor(width, height, ...rowArrays) {
        this.rows = rowArrays;

        this.dimentions = { w: width, h: height };
    }

    get allElements() {
        return [].concat(...this.rows);
    }

    getColumn(columnIndex) {
        return [].concat(...this.rows[columnIndex]);
    }

    multByMatrix(matrix) {
        /*
            thisMatrix * <matrix>
        */

        let finalMatrix = new matrix(this.dimentions.w, this.dimentions.h);

        let column = this.getColumn(0);
        for (let i = 0; i < finalMatrix.dimentions.w; i++) {

        }
    }


    multByMatrix2x2(matrix) {

        /*
            | a b | | e f |
            | c d | | g h |
                    | n...|
        */

        let finalMatrix = new matrix(this.dimentions.w, this.dimentions.h);
        let elementCount = matrix.dimentions.w * matrix.dimentions.h;

    }
}

const Math2 = {
    add(...vecs) { // adds a list of vec2s per component
        let total = new vec2(0, 0);

        for (let i = 0; i < vecs.length; i++) {
            total.x += vecs[i].x;
            total.y += vecs[i].y;
        }

        return total;
    },

    subtract(a, b) { // a - b per component
        return new vec2(a.x - b.x, a.y - b.y);
    },

    multiply(a, b) { // a * b per component
        return new vec2(a.x * b.x, a.y * b.y);
    },

    scalar(vec, scalar) {
        return new vec2(vec.x * scalar, vec.y * scalar);
    },

    distance(a, b) { // gets distance between two vec2s
        let p1 = a.x - b.x;
        let p2 = a.y - b.y;

        return Math.sqrt((p1 * p1) + (p2 * p2));
    },

    normalizeVector(vec) {
        if (vec.x === 0 && vec.y === 0) { return new vec2(0, 0); }
        let dist = Math2.distance(new vec2(0, 0), vec);
        vec.x = vec.x / dist;
        vec.y = vec.y / dist;

        return vec;
    },


    getNormalFromVec2s(a, b) {
        let x = -(a.y - b.y);
        let y = (a.x - b.x);
        let normalPoint = new vec2(x, y);

        let dist = Math2.distance(new vec2(0, 0), normalPoint);

        normalPoint.x = normalPoint.x / dist;
        normalPoint.y = normalPoint.y / dist;

        return normalPoint;
    },

    dotProduct(a, b) { // dot product of a and b
        return (a.x * b.x) + (a.y * b.y);
    },

    rot(a, b, angle) { // basic spin of two components ( uses degrees!!!!!!)
        return new vec2(
            a * Math.cos(angle * deg2rad) + b * Math.sin(angle * deg2rad),
            a * -Math.sin(angle * deg2rad) + b * Math.cos(angle * deg2rad)
        );
    },

    rotVec2(vec, angle) { // basic spin (degrees!!!!!!)
        let a = vec.x;
        let b = vec.y;
        return new vec2(
            a * Math.cos(angle * deg2rad) + b * Math.sin(angle * deg2rad),
            a * -Math.sin(angle * deg2rad) + b * Math.cos(angle * deg2rad)
        );
    },
}

const Math3 = {
    add(...vecs) { // adds a list of vec3s per component
        let total = new vec3(0, 0, 0);

        for (let i = 0; i < vecs.length; i++) {
            total.x += vecs[i].x;
            total.y += vecs[i].y;
            total.z += vecs[i].z;
        }

        return total;
    },

    subtract(a, b) { // a - b per component
        return new vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    },

    multiply(a, b) { // a * b per component
        return new vec3(a.x * b.x, a.y * b.y, a.z * b.z);
    },

    scalar(vec, scalar) {
        return new vec3(vec.x * scalar, vec.y * scalar, vec.z * scalar);
    },

    distance(a, b) { // gets distance between two vec3s
        let p1 = a.x - b.x;
        let p2 = a.y - b.y;
        let p3 = a.z - b.z;

        return Math.sqrt((p1 * p1) + (p2 * p2) + (p3 * p3));
    },

    normalizeVector(vec) {
        let dist = Math3.distance(new vec3(0, 0, 0), vec);
        vec.x = vec.x / dist;
        vec.y = vec.y / dist;
        vec.z = vec.z / dist;

        return vec;
    },

    getNormalFromVectors(p1, p2, p3) { // returns normalised normal of three vec3s
        let v = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
        let w = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };


        let normal = new vec3(
            (v.y * w.z) - (v.z * w.y),
            (v.z * w.x) - (v.x * w.z),
            (v.x * w.y) - (v.y * w.x)
        );

        let length = Math3.distance(normal, Vector3.zero);

        return new vec3(
            normal.x / length,
            normal.y / length,
            normal.z / length
        );
    },

    dotProduct(p1, p2) {
        return (p1.x * p2.x) + (p1.y * p2.y) + (p1.z * p2.z);
    },

    rot(a, b, angle) { // basic spin (degrees!!!!!!)
        return {
            x: a * Math.cos(angle * deg2rad) + b * Math.sin(angle * deg2rad),
            y: a * -Math.sin(angle * deg2rad) + b * Math.cos(angle * deg2rad)
        };
    },

    fullRot(vector, yPlane = 0, xPlane = 0) { // rotates a point by a yPlane and xPlane value ( uses Degrees!!!!)
        return {
            x: Math3.rot(vector.x, vector.z, xPlane).x,
            y: Math3.rot(Math3.rot(vector.x, vector.z, xPlane).y, vector.y, yPlane).x,
            z: Math3.rot(Math3.rot(vector.x, vector.z, xPlane).y, vector.y, yPlane).y
        }
    }
}

const Math4 = {
    add(...vecs) { // adds a list of vec3s per component
        let total = new vec4(0, 0, 0);

        for (let i = 0; i < vecs.length; i++) {
            total.x += vecs[i].x;
            total.y += vecs[i].y;
            total.z += vecs[i].z;
            total.w += vecs[i].w;
        }

        return total;
    },

    subtract(a, b) { // a - b per component
        return new vec4(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
    },

    multiply(a, b) { // a * b per component
        return new vec4(a.x * b.x, a.y * b.y, a.z * b.z, a.w * b.w);
    },

    scalar(vec, scalar) {
        return new vec4(vec.x * scalar, vec.y * scalar, vec.z * scalar, vec.w * scalar);
    }

}

const MatrixMath = {
    /*

    allElements(matrix) {
        return [].concat(...matrix.rows);
    },

    getColumn(matrix, columnIndex){
        return [].concat(...matrix.rows[columnIndex]);
    },

    multByColumb(matrixA, matrixB){

        let Acolumn = MatrixMath.getColumn(matrixA, 0);
        let Brow = matrixB.row[0];
        
        for(let i = 0; i < Acolumn.length; i++){
            let el = Acolumn[i];

            for(let j = 0; j < Brow.length; j++){
                let el2 = Brow[j];

                console.log(el * el2);
            }
        }
    },*/

    mult2lists(list1, list2) {
        let finalMatrix = 0;
        //console.log(`mat1 dimentions: ${list1.length}, mat2 dimentions: ${list2.length}`);
        for (let a = 0; a < Math.min(list1.length, list2.length); a++) {
            finalMatrix += list1[a] * list2[a];
            //console.log(`list1[a] = ${list1[a]}, list2[a] = ${list2[a]}, list1[a] * list2[a] = ${list1[a] * list2[a]}`);
        }
        //console.log(finalMatrix);
        return finalMatrix;
    },

    getRow(mat, index){
        let rowArray = [];
        for (let i = 0; i < mat.length; i++) {
            rowArray[i] = mat[i][index];
        }

        return rowArray;
    },

    mult2matrix(mat1, mat2) {
        let finalMatrix = [];
        for (let a = 0; a < mat1[0].length; a++) {
            finalMatrix[a] = [];
            for (let b = 0; b < mat2.length; b++) {
                if (finalMatrix[a][b] === undefined) { finalMatrix[a][b] = 0; }
                finalMatrix[a][b] += MatrixMath.mult2lists(MatrixMath.getRow(mat1, a), mat2[b]);
            }
        }
        let tempMat = [];
        for(let i = 0; i < finalMatrix.length; i++){
            tempMat.push(MatrixMath.getRow(finalMatrix, i));
        }
        //console.log(`finalMatrix : ${finalMatrix}`);
        return tempMat;
    },

    multMultipleMatrix(...mats){ // multiplies all matri together (a * b * c * d...) \\ remember! everthing is done right to left
        let runningMat = mats[mats.length - 1];
        console.log(mats);
        for(let i = mats.length - 2; i > 0; i--){
            console.log(i + " : ", mats[i]);
            runningMat = this.mult2matrix(runningMat, mats[i]);
        }
        return runningMat;
    },

    add2matrix(mat1, mat2){
        let w = mat1.length;
        let h = mat1[0].length;
        if(mat2.length !== w){
            return null;
        }
        if(mat2[0].length !== h){
            return null;
        }
        let finalMatrix = [];
        for(let x = 0; x < w; x++){
            for(let y = 0; y < h; y++){
                finalMatrix[x] = [];
                finalMatrix[x][y] = mat1[x][y] + mat2[x][y];
            }
        }

        return finalMatrix;
    },

    sub2matrix(mat1, mat2){
        let w = mat1.length;
        let h = mat1[0].length;
        if(mat2.length !== w){
            return null;
        }
        if(mat2[0].length !== h){
            return null;
        }
        let finalMatrix = [];
        for(let x = 0; x < w; x++){
            for(let y = 0; y < h; y++){
                finalMatrix[x] = [];
                finalMatrix[x][y] = mat1[x][y] - mat2[x][y];
            }
        }

        return finalMatrix;
    },

    vec2matrix(vec){
        let finalMatrix = [[vec.x, vec.y]];

        if(vec.z !== undefined){
            finalMatrix[0].push(vec.z);
        }
        if(vec.w !== undefined){
            finalMatrix[0].push(vec.w);
        }
        return finalMatrix;
    },

    matrix2vec(matrix){
        const letters = ["x", "y", "z", "w", "ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh"];
        let vec = {};
        for(let i = 0; i < matrix[0].length; i++){
            vec[letters[i]] = matrix[0][i];
        }

        return vec;
    },

    projectionMatrix(near, far, top, right) {
        return (
            [
                [near / right, 0, 0, 0],
                [0, near / top, 0, 0],
                [0, 0, (far + near) / (near - far), -1],
                [0, 0, (2 * far * near) / (near - far), 0]
            ]
        );
    },

    fovProjMatrix(near, far, aspect, fov = 15){
        let top = near * Math.tan(fov * 0.5);
        let bottom = -top;
        let right = aspect * top;
        let left = -right;

        let e = 1 / Math.tan(fov * 0.5);
        return (
            [
                [e / aspect, 0, 0, 0],
                [0, e, 0, 0],
                [0, 0, (far + near) / (near - far), -1],
                [0, 0, (2 * far * near) / (near - far), 0]
            ]
        );
    },

    vecToCamSpace(vec, projMatrix = MatrixMath.fovProjMatrix(Camera.frustum.n, Camera.frustum.f, 1, 15)){
        return MatrixMath.divideByW(MatrixMath.mult2matrix(projMatrix, [[vec.x - Camera.real.x, vec.y - Camera.real.y, vec.z - Camera.real.z, 1]]));
    },

    vec2FullCamSpace(vec, projectionMatrix = MatrixMath.fovProjMatrix(Camera.frustum.n, Camera.frustum.f, 1, 15)){
        return this.divideByW(
            this.multMultipleMatrix(
                projectionMatrix,
                this.vec2matrix(vec),
                this.translateMatrix    (Camera.real.x, Camera.real.y, Camera.real.z),
                this.yawRotationMatrix  (Camera.yPlane * deg2rad),
                this.pitchRotationMatrix(Camera.xPlane * deg2rad),
                this.rollRotationMatrix (Camera.zPlane * deg2rad),
            )
        );
    },

    divideByW(matrix){
        
        let finalMatrix = [[]];
        finalMatrix[0][0] = matrix[0][0] / matrix[0][3];
        finalMatrix[0][1] = matrix[0][1] / matrix[0][3];
        finalMatrix[0][2] = matrix[0][2] / matrix[0][3];

        return finalMatrix;
    },

    yawRotationMatrix(theda){
        let sin = Math.sin(theda);
        let cos = Math.cos(theda);
        return [
            [  cos, sin, 0, 0 ],
            [ -sin, cos, 0, 0 ],
            [    0,   0, 1, 0 ],
            [    0,   0, 0, 1 ]
        ];
    },
    pitchRotationMatrix(beta){
        let sin = Math.sin(beta);
        let cos = Math.cos(beta);
        return [
            [  cos, 0, -sin, 0 ],
            [    0, 1,    0, 0 ]
            [  sin, 0,  cos, 0 ],
            [    0, 0,    0, 1 ]
        ];
    },
    rollRotationMatrix(gamma){
        let sin = Math.sin(gamma);
        let cos = Math.cos(gamma);
        return [
            [ 1,    0,    0, 0 ]
            [ 0,  cos, -sin, 0 ],
            [ 0,  sin,  cos, 0 ],
            [ 0,    0,    0, 1 ]
        ];
    },
    translateMatrix(offX, offY, offZ){
        return [
            [1, 0, 0, offX],
            [0, 1, 0, offY],
            [0, 0, 1, offZ],
            [0, 0, 0,    1]
        ]
    }
}

const Graphics3D = {

    tri(vecA, vecB, vecC){
       /*vecA = {
            x : vecA.x - Camera.real.x,
            y : vecA.y - Camera.real.y,
            z : vecA.z - Camera.real.z,
        };
        vecB = {
            x : vecB.x - Camera.real.x,
            y : vecB.y - Camera.real.y,
            z : vecB.z - Camera.real.z,
        };
        vecC = {
            x : vecC.x - Camera.real.x,
            y : vecC.y - Camera.real.y,
            z : vecC.z - Camera.real.z,
        };*/
        let points = [
            MatrixMath.vec2FullCamSpace(vecA),
            MatrixMath.vec2FullCamSpace(vecB),
            MatrixMath.vec2FullCamSpace(vecC),
            //MatrixMath.vecToCamSpace(vecA),
            //MatrixMath.vecToCamSpace(vecB),
            //MatrixMath.vecToCamSpace(vecC),
        ];

        let startColor = ctx.strokeStyle;
        ctx.strokeStyle = "black";

        for(let i = 0; i < points.length; i++){
            if(!Camera.checkIfInBox(points[i])){
                ctx.closePath();
                ctx.strokeStyle = "red";
                return points[i];
            };
        }

        ctx.beginPath();
        ctx.lineTo(((points[0][0][0] + 1) * 64), ((points[0][0][1] + 1) * 64));
        ctx.lineTo(((points[1][0][0] + 1) * 64), ((points[1][0][1] + 1) * 64));
        ctx.lineTo(((points[2][0][0] + 1) * 64), ((points[2][0][1] + 1) * 64));
        ctx.stroke();

        topCtx.beginPath();
        topCtx.lineTo((points[0][0][0] + 1) * 64, (points[0][0][1] + 1) * 64);
        topCtx.lineTo((points[1][0][0] + 1) * 64, (points[1][0][1] + 1) * 64);
        topCtx.lineTo((points[2][0][0] + 1) * 64, (points[2][0][1] + 1) * 64);
        topCtx.fill();

        ctx.strokeStyle = startColor;

        console.log(points[0], points[1], points[2]);
        return null;
    },

    point(vec){
        /*vec = {
            x : vec.x - Camera.real.x,
            y : vec.y - Camera.real.y,
            z : vec.z - Camera.real.z,
        };*/

        /* 
            projectionMatrix,
            this.vec2matrix(vec),
            this.translateMatrix    (Camera.real.x, Camera.real.y, Camera.real.z),
            this.yawRotationMatrix  (Camera.yPlane * deg2rad),
            this.pitchRotationMatrix(Camera.xPlane * deg2rad),
            this.rollRotationMatrix (Camera.zPlane * deg2rad), 
        */
        //vec = MatrixMath.multMultipleMatrix( MatrixMath.projectionMatrix(), MatrixMath.translateMatrix(Camera.real.x, Camera.real.y, Camera.real.z), MatrixMath.yawRotationMatrix(Camera.yPlane * deg2rad), MatrixMath.pitchRotationMatrix(Camera.xPlane * deg2rad), MatrixMath.rollRotationMatrix(Camera.zPlane * deg2rad), MatrixMath.vec2matrix(vec))

        ctx.fillStyle = "pink";
        ctx.fillRect(vec.x + 62, vec.z + 62, 2, 2);
        //console.log(MatrixMath.mult2matrix(Camera.projMatrix, [[vec.x, vec.y, vec.z, 1]]));
        let pos = MatrixMath.vec2FullCamSpace(vec);
        //console.log(pos);
        ctx.fillStyle = "#ff2455";
        if(Camera.checkIfInBox(pos)){
            ctx.fillStyle = "#00ff44";
        }
        ctx.fillRect(((pos[0][0] + 1) * 64) - 4, ((pos[0][1] + 1) * 64) - 4, 8, 8);

        ctx.fillStyle = "blue";
        ctx.fillRect( // the screwy perspective
            (10 * vec.x) / (10 + vec.z) + 62, 
            (10 * vec.y) / (10 + vec.z) + 64,
            4,4
        )
    }
}