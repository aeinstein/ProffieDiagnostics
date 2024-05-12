
class BatteryChart extends HTMLElement{
    data = [0];
    value;
    maxvalue = 5;

    real_max = 5;     // 30MB => 300MBit

    w = 250;
    h = 50;
    shadow;
    background = "#FFFFFF";
    color = "#4a4b4b";

    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        if(this.hasAttribute("width")){
            this.w = parseInt(this.getAttribute("width"));
        }

        if(this.hasAttribute("height")){
            this.h = parseInt(this.getAttribute("height"));
        }

        if(this.hasAttribute("background")){
            this.background = this.getAttribute("background");
        }

        this.shadow.innerHTML = "<canvas width='" + this.w + "' height='" + this.h + "' id='container'></canvas>";
        this.canvas = this.shadow.getElementById("container");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = this.color;

        window.setInterval(()=>{
            this.tick();
        }, 500);

        this.value = this.data[this.data.length -1];
    }

    tick(){
        this.data.push(this.value);

        while(this.data.length > this.w) {
            this.data.shift();
        }

        this.redraw();
    }

    clearData(){
        this.data = [0];
        this.redraw();
    }

    setValue(value){
        this.value = value;

        if(value > this.maxvalue) {
            if(value > this.real_max){
                this.maxvalue = this.real_max;
                this.alarm_count++;
                console.warn("Traffic limit reached: " + this.alarm_count);

            } else {
                //this.maxvalue = rx_value;
                this.maxvalue *= 2;
            }

        }
    }

    redraw(){
        this.clear();

        const xFactor = this.h / this.maxvalue;
        let mostleft = this.w;
        let local_max = 0;
        let lastvalue;

        this.ctx.strokeStyle = "#FF0000";
        this.ctx.fillStyle = "#FF000050";

        this.ctx.moveTo(this.w, this.data[this.data.length -1] * xFactor);
        this.ctx.beginPath();

        for(let i = 0; i < this.data.length; i++) {
            lastvalue = this.h - (this.data[this.data.length -1 -i] * xFactor);

            if(lastvalue >= 4.1) {
                this.ctx.strokeStyle = "#00FF00";
                this.ctx.fillStyle = "#00FF0050";

            } else if(lastvalue >= 3.6){
                this.ctx.strokeStyle = "#008cff";
                this.ctx.fillStyle = "rgba(0,196,255,0.31)";

            } else if(lastvalue >= 3.0){
                this.ctx.strokeStyle = "#ffc400";
                this.ctx.fillStyle = "rgba(255,204,0,0.31)";

            } else {
                this.ctx.strokeStyle = "#FF0000";
                this.ctx.fillStyle = "#FF000050";
            }

            this.ctx.lineTo(this.w -i, lastvalue);
            mostleft = this.w -i;
            if(this.data[this.data.length -1 -i] > local_max) local_max = this.data[this.data.length -1 -i];
        }

        if(this.maxvalue > 1024 && local_max < this.maxvalue /2) this.maxvalue /= 2;
        this.ctx.lineTo(mostleft, this.h);
        this.ctx.lineTo(this.w, this.h);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
        this.drawLabel();
    }

    drawLabel(){
        this.ctx.fillStyle = "#c0c0c0";
        this.ctx.strokeStyle = this.background;
        this.ctx.font = "12px Arial";
        this.ctx.strokeText(this.maxvalue, 2, 12);
        this.ctx.fillText(this.maxvalue, 2, 12);
    }

    clear(){
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.w, this.h);
    }
}

window.customElements.define('tm-batterychart', BatteryChart);
