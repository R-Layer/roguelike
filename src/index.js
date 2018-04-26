import React from 'react';
import ReactDOM from 'react-dom'
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';

import './index.css';
import {walls} from './path.js';

// ########## REACT PART ####################################
class Presentational extends React.Component {


    render() {
        return (<div>
                    <App />
                </div>)
    }
};

class App extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            actualRecipe: '',
        }

        this.height = 384;
        this.width = 512;
        this.canvX = 0;
        this.canvY = 0;
        this.dx = 0;
        this.dy = 0;
        this.newX = 0;
        this.newY = 0;
        this.door = true;
        this.fogwar = true;
        this.counter = 0;
        this.enemyPositions = [ [120,120], [140,120], [100,120] ];

        this.player =  {hp: 30, weapon: 'knife', weaponValue: 8, level:1};

        this.enemies = [ {hp: 10, weapon: 'dagger', weaponValue: 10, level:1}, 
                         {hp: 10, weapon: 'dagger', weaponValue: 10, level:1}, 
                         {hp: 10, weapon: 'dagger', weaponValue: 10, level:1} ]
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

    this.ctx.lineWidth= 3;
    this.ctx.lineCap = 'square';
    this.ctx.stroke(walls);

    this.ctx.fillStyle = "rgba(250, 0, 0, 1)";
    this.enemyPositions.map ( el => this.ctx.fillRect(el[0], el[1], 5, 5) );

    this.ctx.fillStyle = "rgba(0, 0, 250, 1)"
    if (this.door)
        this.ctx.fillRect(90, 215, 70, 5);


    const obstacle = this.ctx.getImageData(45 + this.dx, 75 + this.dy, 4, 4);
    this.ctx.fillStyle = "#000";
    
    this.checkCollision(obstacle, this.ctx);

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
            this.enemyEncounter();
                return;
        default:
            this.dx = this.newX;
            this.dy = this.newY;
                return;
    }
}

enemyEncounter = () => {

    let enemyIndex;
     this.enemyPositions.forEach( (el, ind) => 
     {
     if ( (38 + this.dx < el[0] && 52 + this.dx > el[0])
     &&
       (68 + this.dy < el[1] && 82 + this.dy > el[1]) ) 
      enemyIndex =  ind;
    });

    this.fight(this.player, this.enemies[enemyIndex])
}


battleTurn = (attacker, defender) => {
    defender.hp -= attacker.weaponValue + attacker.weaponValue/10 + attacker.level*2; 
    return;
}



fight = (player, enemy) => {

    console.log(player.weaponValue);

 this.battleTurn(player, enemy);
 if (enemy.hp > 0)
    this.battleTurn(enemy, player);
else 
      {
        this.enemyPositions.splice(this.enemyPositions.indexOf(enemy), 1);
        this.enemies.splice(this.enemyPositions.indexOf(enemy), 1);
      }

 return ;
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
// ############## REDUX PART #################################
const ADD = 'ADD';

const addCreation = (stuff) => {
    return {type: ADD, stuff};
};

const addReducer = (state = '', action ) => {
    switch(action.type)
    {
        case ADD: 
            return action.stuff;
        default:
            return;
    }
}

const store = createStore(addReducer);

// ############### REACT-REDUX PART ##########################
const mapStateToProps = (state) => { return {msg: state} };

const mapDispatchToProps = (dispatch) => {
    return {
        addMethod: (stuffToAdd) => {
            dispatch(addCreation(stuffToAdd));
        }
    }
}

const Container = connect(mapStateToProps, mapDispatchToProps)(Presentational);

// ############# WRAPPER ####################################
class AppWrapper extends React.Component {

    render() {
        return (
            <Provider store={store}>
                <Container />
            </Provider>
        )
    }
}
ReactDOM.render( <AppWrapper />, document.getElementById('root'));