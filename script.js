var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;
var size = 10

var Particle = function(x,y){
    this.x = [x,y];
    this.v = [0,0];
    this.orient = 0;
    this.update = function(){
        this.x[0] = (this.x[0] + this.v[0] + width) % width;
        this.x[1] = (this.x[1] + this.v[1] + height) % height;
        let tan = this.v[1]/this.v[0];
        if(tan != NaN){
            this.orient = Math.atan(tan);
            if(this.v[0] < 0){
                this.orient += Math.PI;
            }
        }
    }
}

var sample_normal = function(){
    var u = Math.random(), v = Math.random();
    var r = Math.sqrt(-2*Math.log(1-u));
    var theta = 2*Math.PI * v;
    var z1 = r*Math.cos(theta);
    var z2 = r*Math.sin(theta);
    return [z1, z2];
}

if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var draw_particle_orig = function(){
        ctx.beginPath();
        var half_length = size/2;
        var half_width = size/3;
        ctx.moveTo(half_length, 0);
        ctx.lineTo(-half_length, -half_width);
        ctx.lineTo(-half_length/2, 0);
        ctx.lineTo(-half_length, half_width);
        ctx.fill();
    }

    var draw_particle = function(particle, color){
        let x = particle.x[0];
        let y = particle.x[1];
        let angle = particle.orient;
        ctx.save()
        ctx.translate(x,y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        draw_particle_orig();
        ctx.restore()
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    var update = function(i){
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore()

        particles.forEach(function(p){
            p.v[0] *= 0.99;
            p.v[1] *= 0.99;
            var noise = sample_normal();
            p.v[0] += noise[0]/4;
            p.v[1] += noise[1]/4;
            p.update();
            draw_particle(p, `hsl(${p.orient/2/Math.PI*360}, 100%, 50%)`);
        });
        setTimeout(function(){update(i+1)}, 20);
    }

    var particles = [];
    for(let i=0; i<200; i++){
        particles.push(new Particle(Math.random()*width, Math.random()*height));
    }
    update(0);
} else {
    // canvas-unsupported code here
}
