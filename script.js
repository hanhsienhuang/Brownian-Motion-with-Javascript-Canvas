var canvas = document.getElementById('brownian-motion');
var width = canvas.width;
var height = canvas.height;
var size = 10;
var alpha = 0.25;
var lambda = 0.01;
var particles = [];
var stop = false;

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

var toggle_stop = function(){
    stop = ! stop;
    var button = document.getElementById('toggle-stop');
    button.innerText = {true:"Start", false:"Stop"}[stop];
    if(!stop){
        update();
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

var lambda_input_slide = function(){
    var value = document.getElementById('lambda-slide').value;
    lambda = value;
    update_lambda();
}

var lambda_input_text = function(){
    var value = parseFloat(document.getElementById('lambda-value').value);
    if(value != NaN && value >= 0 && value <= 1){
        lambda = value;
    }
    update_lambda();
}

var update_lambda = function(){
    var text = document.getElementById('lambda-value');
    var slider = document.getElementById('lambda-slide');
    slider.value = lambda;
    text.value = lambda;
}

var alpha_input_slide = function(){
    var value = document.getElementById('alpha-slide').value;
    alpha = value;
    update_alpha();
}

var alpha_input_text = function(){
    var value = parseFloat(document.getElementById('alpha-value').value);
    if(value != NaN && value >= 0 && value <= 10){
        alpha = value;
    }
    update_alpha();
}

var update_alpha = function(){
    var text = document.getElementById('alpha-value');
    var slider = document.getElementById('alpha-slide');
    slider.value = alpha;
    text.value = alpha;
}

var num_input_slide = function(){
    var value = document.getElementById('num-slide').value;
    set_num_particle(value);
    update_num();
}

var num_input_text = function(){
    var value = parseInt(document.getElementById('num-value').value);
    if(value != NaN && value >= 1 && value <= 1000){
        set_num_particle(value);
    }
    update_num();
}


var update_num = function(){
    var text = document.getElementById('num-value');
    var slider = document.getElementById('num-slide');
    slider.value = particles.length;
    text.value = particles.length;
}

var set_num_particle = function(N){
    var n = particles.length;
    if(n < N){
        for(let i=0; i<N-n; i++){
            particles.push(new Particle(Math.random()*width, Math.random()*height));
        }
    }else{
        for(let i=0; i<n-N; i++){
            particles.pop();
        }
    }

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

    var update = function(){
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore()

        particles.forEach(function(p){
            p.v[0] *= (1-lambda);
            p.v[1] *= (1-lambda);
            var noise = sample_normal();
            p.v[0] += noise[0]*alpha;
            p.v[1] += noise[1]*alpha;
            p.update();
            draw_particle(p, `hsl(${p.orient/2/Math.PI*360}, 100%, 50%)`);
        });
        if(!stop){
            setTimeout(function(){update()}, 20);
        }
    }

    set_num_particle(100);
    update_alpha();
    update_lambda();
    update_num();
    update();
} else {
    // canvas-unsupported code here
}
