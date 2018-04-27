import React from 'react';

import './index.css';
import {walls} from './path.js';


export class App extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            actualRecipe: '',
        }

        // Canvas vars
        this.height = 384;
        this.width = 512;
        this.canvX = 0;
        this.canvY = 0;

        // Movement vars
        this.dx = 0;
        this.dy = 0;
        this.newX = 0;
        this.newY = 0;

        // Game vars
        this.door = true;
        this.fogwar = false;
        this.counter = 0;
        this.actualEnemy = {};
        this.creepsPositions = [ [55,180], [140,85], [100,122], [190, 30], [180,160],
                                [190,195], [55,245], [190,245], ];
        this.guardsPositions = [ [40,240], [205,240], [115, 245], [135, 245] ]
        this.bossPosition    = [ [120,180] ];
        this.weaponsPositions = [  [175, 25], [125,270] ];
        this.healthsPositions = [ [70, 160], [125, 25], [175, 190], [195,270] ];

        this.player =  {maxHp: 50, hp:50, weapon: 'knife', weaponValue: 8, level:1};

        this.creep = {hp: 20, weapon: 'dagger', weaponValue: 10, level:1, id:0};
        this.guard = {hp: 35, weapon: 'iron mace', weaponValue: 16, level:2};
        this.boss  = {hp: 60, weapon: 'cursed sword', weaponValue: 28, level:3};

        this.weapons = [ {name: 'morning-star', value: 16},
                         {name: 'double-handed sword', value: 30} ];
    }

componentDidMount() {
    document.addEventListener('keydown', this.arrowFunc, false);
    this.drawBase(); 
}

componentWillUnmount() {
    document.removeEventListener('keydown', this.arrowFunc, false);
}

arrowFunc = (event) =>  {

    switch(event.keyCode)
    {
        case 37: this.dx -=2;
            break;
        case 38: this.dy -=2;
            break;
        case 39: this.dx +=2;
            break;
        case 40: this.dy +=2;
            break;
        default: 
            break;            
    };
   this.drawBase();
};

drawBase = () => {
    this.ctx = this._canvas.getContext('2d');                               
    this.ctx.clearRect( 0,0, this._canvas.width, this._canvas.height);

    if (this.fogwar) 
    {
        this.ctx.fillRect(0,0, this.width, this.height);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(47 + this.dx, 77 + this.dy, 25, 0, Math.PI*2, true);
        this.ctx.clip();   
    }
    this.ctx.fillStyle = ('rgba(255, 255, 255, 255)');
    this.ctx.fillRect(0 + this.dx, 0 + this.dy, this.width, this.height); 

    this.ctx.lineWidth= 2;
    this.ctx.lineCap = 'square';
    this.ctx.stroke(walls);

    this.ctx.fillStyle = "rgba(250, 0, 0, 1)";
    this.creepsPositions.map ( el => this.ctx.fillRect(el[0], el[1], 5, 5) );
    
    this.ctx.fillStyle = "rgba(250, 150, 0, 1)";
    this.guardsPositions.map ( el => this.ctx.fillRect(el[0], el[1], 5, 5) );
    
    this.ctx.fillStyle = "rgba(250, 50, 250, 1)";
    this.bossPosition.map ( el => this.ctx.fillRect(el[0], el[1], 5, 5) );

    this.ctx.fillStyle = "rgba(10, 100, 200, 1)";
    this.weaponsPositions.map (el => this.ctx.fillRect(el[0], el[1], 5, 5) );

    this.ctx.fillStyle = "rgba(50, 200, 100, 1)";
    this.healthsPositions.map (el => this.ctx.fillRect(el[0], el[1], 5, 5) );

    this.ctx.fillStyle = "rgba(0, 0, 250, 1)"
    if (this.door)
        this.ctx.fillRect(90, 215, 70, 5);


    const obstacle = this.ctx.getImageData(45 + this.dx, 75 + this.dy, 4, 4);
        
    this.checkCollision(obstacle, this.ctx);

    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(45 + this.newX, 75 + this.newY, 4, 4);
  
    this.ctx.restore();
}

checkCollision = (obstacle, ctx) => {
   

    const test = obstacle.data.filter( el => el !== 255);
    switch(true) 
    {
        case test.length === 0:
            this.newX = this.dx;
            this.newY = this.dy;
                return;
        case test[0] === 250:
            this.dx = this.newX;
            this.dy = this.newY;
            this.enemyEncounter(test[1]);
                return;
        case test[0] === 10:
            this.newX = this.dx;
            this.newY = this.dy;
            this.weaponCollection();
            break;
        case test[0] === 50:
            this.newX = this.dx;
            this.newY = this.dy;
            this.healthCollection();
            break;
        default:
            this.dx = this.newX;
            this.dy = this.newY;
                return;
    }
}


healthCollection = () => {
   
    let healthIndex = this.findMatch(this.healthsPositions);

   this.healthsPositions.splice(healthIndex, 1);

   this.player.hp  > (this.player.maxHp - 25)?this.player.hp = this.player.maxHp:this.player.hp+=25;
   this.drawBase();
    return ;
}

weaponCollection = () => {
    let weaponIndex = this.findMatch(this.weaponsPositions);
   
   this.player.weapon = this.weapons[weaponIndex].name;
   this.player.weaponValue = this.weapons[weaponIndex].value;

   this.weaponsPositions.splice(weaponIndex, 1);
   this.drawBase();
   return ;
}

enemyEncounter = (enemyColor) => {

    let enemyIndex, enemy, outcome;

    switch(enemyColor) {
        case 0: 
            enemyIndex = this.findMatch(this.creepsPositions);
            if ( this.actualEnemy !== 'c' + enemyIndex)
            this.actualEnemy = 'c' + enemyIndex;
            enemy = Object.assign({}, this.creep, {id:this.creepsPositions[enemyIndex]});
            
            outcome =  this.fight(this.player, enemy);
            if (outcome === 1)
                {this.creepsPositions.splice(enemyIndex, 1);
                
                this.player.maxHp = this.player.level * 50;
                
                let tmp = this.player.level;
                this.player.level += 0.20;
                if (Math.floor(this.player.level) !== Math.floor(tmp))
                    this.player.hp = this.player.maxHp
                }
                this.drawBase();
            break;
        case 150:
            enemyIndex = this.findMatch(this.guardsPositions);
            enemy = this.guard;

            outcome =  this.fight(this.player, enemy);
            if (outcome === 1)
                {this.guardsPositions.splice(enemyIndex, 1);
                
                this.player.maxHp = this.player.level * 50;
                
                let tmp = this.player.level;
                this.player.level += 0.35;
                if (Math.floor(this.player.level) !== Math.floor(tmp))
                    this.player.hp = this.player.maxHp}
                this.drawBase();
            break;
        case 50: 
            enemyIndex = this.findMatch(this.bossPosition);
            enemy = this.boss;

            outcome =  this.fight(this.player, enemy);
            if (outcome === 1)
                {this.bossPosition.splice(enemyIndex, 1);
            
                this.player.maxHp = this.player.level * 50;
                
                let tmp = this.player.level;
                this.player.level += 1.00;
                if (Math.floor(this.player.level) !== Math.floor(tmp))
                    this.player.hp = this.player.maxHp}
                this.drawBase();
            break;
        default:
            break;
    }
    

    if (this.guardsPositions.length === 0) 
        this.door = false;
}

fight = (player, enemy) => {

    console.log(`player: ${this.player.hp} - enemy: ${enemy.hp}`);
    console.log( this.player.weapon);
    if (player.hp > 0)
        this.battleTurn(player, enemy);
    else 
        return -1;
    
    if (enemy.hp > 0)
        this.battleTurn(enemy, player);
    else 
        return 1;
    
    return 0;
}


battleTurn = (attacker, defender) => {
    defender.hp -= Math.floor(attacker.weaponValue + (Math.random()*5*attacker.weaponValue/10) + Math.floor(attacker.level)*3); 
    return;
}


findMatch = (arr) => {
    let matchIndex = 0;
    arr.forEach( (el, ind) => 
    {
        if ( (38 + this.dx < el[0] && 52 + this.dx > el[0])
             &&
             (68 + this.dy < el[1] && 82 + this.dy > el[1]) ) 
                 matchIndex =   ind;
   });
   return matchIndex;
}

toggleDarkness = () => {
    this.fogwar = !this.fogwar;
    this.drawBase();
}
    render () {
        
        return (
            <div>
                <button onClick={this.toggleDarkness}>Toggle Darkness</button>
            <canvas ref={canvas => this._canvas=canvas} width={this.width} height={this.height} className="room">
            </canvas>
            </div>
        );
    };
};