/*
const Math2 = {
    add(...vecs){ // adds a list of vec2s per component
        let total = new vec2(0,0);

        for(let i = 0; i < vecs.length; i++){
            total.x += vecs[i].x;
            total.y += vecs[i].y;
        }

        return total;
    },

    subtract(a, b){ // a - b per component
        return new vec2(a.x - b.x, a.y - b.y);
    },

    multiply(a, b){ // a * b per component
        return new vec2(a.x * b.x, a.y * b.y);
    },

    scalar(vec, scalar){
        return new vec2(vec.x * scalar, vec.y * scalar);
    },

    distance(a, b){ // gets distance between two vec2s
        let p1 = a.x - b.x;
        let p2 = a.y - b.y;
    
        return Math.sqrt((p1 * p1) + (p2 * p2));
    },
    
    normalizeVector(vec){
	if(vec.x === 0 && vec.y === 0) { return new vec2(0, 0); }
        let dist = Math2.distance(new vec2(0, 0), vec);
        vec.x = vec.x / dist;
        vec.y = vec.y / dist;
    
        return vec;
    },

    
    getNormalFromVec2s(a, b){
        let x = -(a.y - b.y);
        let y = (a.x - b.x);
        let normalPoint = new vec2(x, y);
    
        let dist = Math2.distance(new vec2(0, 0), normalPoint);
	
        normalPoint.x = normalPoint.x / dist;
        normalPoint.y = normalPoint.y / dist;
		
        return normalPoint;
    },
    
    dotProduct(a, b){ // dot product of a and b
        return (a.x * b.x) + (a.y * b.y);
    },

    rot(a, b, angle){ // basic spin of two components ( uses degrees!!!!!!)
        return new vec2(
            a * Math.cos(angle * deg2rad) + b * Math.sin(angle * deg2rad),
            a * -Math.sin(angle * deg2rad) + b * Math.cos(angle * deg2rad)
        );
    },

    rotVec2(vec, angle){ // basic spin (degrees!!!!!!)
        let a = vec.x;
        let b = vec.y;
        return new vec2(
            a * Math.cos(angle * deg2rad) + b * Math.sin(angle * deg2rad),
            a * -Math.sin(angle * deg2rad) + b * Math.cos(angle * deg2rad)
        );
    }
}*/