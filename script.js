var canvas = document.getElementById('brownian-motion');
var canvas2 = document.getElementById('speed-plot');
var width = canvas.width;
var height = canvas.height;
var size = 10;
var alpha = 0.25;
var lambda = 0.01;
var particles = [];
var stop = false;
var color = "direction"
var refresh_interval = 20;

var Particle = function(x,y){
    this.x = [x,y];
    this.v = [0,0];
    this.speed = 0;
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
        this.speed = Math.sqrt(this.v[0]**2 + this.v[1]**2);
    }
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

var color_input = function(){
    var elements = document.getElementsByName('color-control');
    for(e of elements){
        if(e.checked){
            color = e.value;
            break;
        }
    }
}

var update_color = function(){
    var elements = document.getElementsByName('color-control');
    for(e of elements){
        if(e.value == color){
            e.checked = true;
            break;
        }
    }

}

if (canvas.getContext) {
    var ctx  = canvas.getContext('2d');
    var ctx2 = canvas2.getContext('2d');
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

    var draw_particles = function(){
        ctx.save()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore()

        switch(color){
            case "speed":
                var sigma = alpha/Math.sqrt(1-(1-Math.max(lambda, 0.01))**2);
                var speed99 = 3*sigma;
                var color_fn = function(p){
                    var intensity = Math.min( p.speed/speed99, 1)*255;
                    return `rgb(${intensity}, 0, ${255-intensity})`;
                }
                break;
            case "direction":
                var color_fn = function(p){
                    return `hsl(${p.orient/2/Math.PI*360}, 100%, 50%)`;
                }
                break;
            default:
                var color_fn = function(p){
                    return "color";
                }
        }
        particles.forEach(function(p){
            draw_particle(p, color_fn(p));
        });
    }

    var plot_speed = function(){
        ctx2.clearRect(0, 0, width, height);
        var speeds = [];
        for(p of particles){
            speeds.push(p.speed);
        }
        speeds.sort(function(a,b){return a-b});
        console.log(speeds);
        var left = 50, right = width-20, top = 20, bot = height-50;
        var plot_h = top-bot, plot_w = right-left;
        ctx2.strokeRect(left, top, right-left, bot-top);
        ctx2.font = "20px serif";
        ctx2.textAlign = "right";
        ctx2.fillText("1", left-10, top);
        ctx2.textBaseline = "top";
        ctx2.fillText("0", left-10, bot+10);
        ctx2.fillText("speed", right, bot+10);

        if(alpha!=0 && lambda != 0){
            ctx2.save()
            ctx2.strokeStyle = "blue";
            ctx2.beginPath();
            ctx2.moveTo(left, bot);
            var num = 20;
            for(let i=1; i<= num; i++){
                var x = i/num;
                var y = 1-Math.exp(-9/2*x**2);
                ctx2.lineTo(left+x*plot_w, bot+y*plot_h);
            }
            ctx2.stroke();
            ctx2.restore();
        }
        var sigma = alpha/Math.sqrt(1-(1-Math.max(lambda, 0.01))**2);
        var speed99 = 3*sigma;
        var x = 0, y = 0;
        ctx2.beginPath();
        ctx2.moveTo(left, bot);
        var num = particles.length;
        for(i in speeds){
            s = speeds[i];
            var newx = Math.min(s/speed99, 1), newy = (parseInt(i)+1)/num;
            ctx2.lineTo(left+newx*plot_w, bot+y*plot_h);
            ctx2.lineTo(left+newx*plot_w, bot+newy*plot_h);
            x = newx;
            y = newy;
            if(x >= 1) break;
        }
        ctx2.stroke();
    }

    var update = function(){
        particles.forEach(function(p){
            p.v[0] *= (1-lambda);
            p.v[1] *= (1-lambda);
            var noise = sample_normal();
            p.v[0] += noise[0]*alpha;
            p.v[1] += noise[1]*alpha;
            p.update();
        });
        draw_particles();
        plot_speed();
        if(!stop){
            setTimeout(function(){update()}, refresh_interval);
        }
    }

    set_num_particle(100);
    update_alpha();
    update_lambda();
    update_num();
    update_color();
    update();
} else {
    // canvas-unsupported code here
}
