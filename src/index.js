import React from 'react';
import ReactDOM from 'react-dom'
import {Provider, connect} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import './index.css';

import {walls} from './path.js';

import {App} from './gameFrame.js';

// ########## REACT PART ####################################
class Presentational extends React.Component {

    // Movement properties
    dx = 0;
    dy = 0;
    newX = 0;
    newY = 0;
    // Canvas properties
    width = 260;
    height = 300;
    canv; 
    //Game properties
    creep = {hp: 20, weapon: 'dagger', weaponValue: 10, level:1, id:0};
    guard = {hp: 35, weapon: 'iron mace', weaponValue: 16, level:2};
    boss  = {hp: 60, weapon: 'cursed sword', weaponValue: 28, level:3};

    weapons = [ {name: 'morning-star', value: 16},
                {name: 'double-handed sword', value: 30} ];

reset = () => {
    this.dx = 0;
    this.dy = 0;  
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
        //this.ctx = this._canvas.getContext('2d');  
        const ctx = this.canv.getContext('2d');                               
        ctx.clearRect( 0,0, this.canv.width, this.canv.height);
        // To simulate the fogwar is being used a clipped path: the canvas is made black and that context is saved in order to return to it when the underlying drawing ( walls enemies  ... ) 
        // is finished. 
        if (this.props.isFog) 
        {
            ctx.fillRect(0,0, this.width, this.height);
            ctx.save();
            ctx.beginPath();
            ctx.arc(47 + this.dx, 77 + this.dy, 25, 0, Math.PI*2, true);
            ctx.clip();   
        }
        ctx.fillStyle = ('rgba(255, 255, 255, 255)');
        ctx.fillRect(0 + this.dx, 0 + this.dy, this.width, this.height); 
    
        ctx.lineWidth= 2;
        ctx.lineCap = 'square';
        ctx.stroke(walls);
    
        ctx.fillStyle = "rgba(250, 0, 0, 1)";
        this.props.enemiesArray[0].creepsPositions.map ( el => ctx.fillRect(el[0], el[1], 5, 5) );
        
        ctx.fillStyle = "rgba(250, 150, 0, 1)";
        this.props.enemiesArray[1].guardsPositions.map ( el => ctx.fillRect(el[0], el[1], 5, 5) );
        
        ctx.fillStyle = "rgba(250, 50, 250, 1)";
        this.props.enemiesArray[2].bossPosition.map ( el => ctx.fillRect(el[0], el[1], 5, 5) );
    
        ctx.fillStyle = "rgba(10, 100, 200, 1)";
        this.props.objectsArray[1].weaponsPositions.map (el => ctx.fillRect(el[0], el[1], 5, 5) );
    
        ctx.fillStyle = "rgba(50, 200, 100, 1)";
        this.props.objectsArray[0].healthsPositions.map (el => ctx.fillRect(el[0], el[1], 5, 5) );
    
        ctx.fillStyle = "rgba(0, 0, 250, 1)"

        if (this.props.enemiesArray[1].guardsPositions.length !== 0)
            ctx.fillRect(90, 215, 70, 5);
        
        // To verify the presence of some obstacle close to the player it's used the getImageData function, which return the pixel rgba property thanks to which you can argue what's around you 
        // ( since different object are represented by different colors )
     
        this.checkCollision( ctx.getImageData(45 + this.dx, 75 + this.dy, 4, 4) );
    
        // This is the player square. Its coordinates are NOT dx dy, but newX and newY which acquire the dx/dy values just in case of no obstacle on the ground: else dx/dy will fallback to the previous 
        // newX / newY values.
        ctx.fillStyle = "#000";
        ctx.fillRect(45 + this.newX, 75 + this.newY, 4, 4);
    
        ctx.restore();
    }
    
    checkCollision = (surroundings) => {
        //Filter everthing not white to determinate what object is colliding to 
        const obstacles = surroundings.data.filter( el => el !== 255);
        switch(true) 
        {
            case obstacles.length === 0:
                this.newX = this.dx;
                this.newY = this.dy;
                    return;
            case obstacles[0] === 250:
                this.dx = this.newX;
                this.dy = this.newY;
                this.enemyEncounter(obstacles[1]);
                    return;
            case obstacles[0] === 10:
                this.newX = this.dx;
                this.newY = this.dy;
                this.weaponCollection();
                break;
            case obstacles[0] === 50:
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
       
        let healthIndex = this.findMatch(this.props.objectsArray[0].healthsPositions);
    
       //this.setState({ healthsPositions: [...this.state.healthsPositions.slice(0, healthIndex), ...this.state.healthsPositions.slice(healthIndex + 1)]} );
        this.props.removeHealth(healthIndex);
        this.props.modifyPlayerHp(this.props.playerStats.hp, this.props.playerStats.maxHp);

            return ;
    }
    
    weaponCollection = () => {
        let weaponIndex = this.findMatch(this.props.objectsArray[1].weaponsPositions);
       
        //this.setState({player: Object.assign({}, this.state.player, {weapon : this.weapons[weaponIndex].name, weaponValue : this.weapons[weaponIndex].value}) });
        this.props.modifyPlayerWeapon(this.weapons[weaponIndex].name, this.weapons[weaponIndex].value);
        //this.state.weaponsPositions.splice(weaponIndex, 1);
        this.setState({ weaponsPositions: [...this.state.weaponsPositions.slice(0, weaponIndex), ...this.state.weaponsPositions.slice(weaponIndex +1 )]});
       // this.drawBase();
            return ;
    }
    
    enemyEncounter = (enemyColor) => {
        // Once confirmed the obstacle is an enemy here is being checked the second component of its rgba property, peculiar to each enemy
        switch(enemyColor) {
            case 0: 
                this.verifyEnemy(this.creep, this.props.enemiesArray[0].creepsPositions);
                break;
            case 150:
                this.verifyEnemy(this.guard, this.props.enemiesArray[1].guardsPositions);
                break;
            case 50: 
                this.verifyEnemy(this.boss, this.props.enemiesArray[2].bossPosition);
                break;
            default:
                break;
        }
    }
    verifyEnemy = (enemy, enemyArray) => {
        const  enemyIndex = this.findMatch(enemyArray);
        // Assignign an ID to the actual enemy is needed in order to avoid the following situation: hit an enemy, run, hit another enemy, back to the first one, etc. If the enemy hit is different 
        // from the previous one it reassign the object properties ( read --> the original enemy stats ) to the actual enemy being hitted.
        if  ( this.props.actualEnemyStats.id !== 'id-' + enemyArray[enemyIndex][0] + enemyArray[enemyIndex][1])
            {
               //this.setState({actualEnemy : Object.assign({}, enemy, {id : 'id-' + enemyArray[enemyIndex][0] + enemyArray[enemyIndex][1]} )}) ;
               this.props.modifyActualEnemy( Object.assign( {}, enemy, {id : 'id-' + enemyArray[enemyIndex][0] + enemyArray[enemyIndex][1]} ) );
                //this.actualEnemy.id = 'id-' + enemyArray[enemyIndex][0] + enemyArray[enemyIndex][1];
            }
        this.encounterResult(enemyArray, enemyIndex);
    }
    
    encounterResult = (enemyArray, enemyIndex) => {
    
      //const  outcome =  this.fight(this.state.player, this.state.actualEnemy);
      const  outcome =  this.fight(this.props.playerStats, this.props.actualEnemyStats);
        
      switch(outcome) {
        case -1:
            this.reset();
            this.props.resetGame();
            break;
        case 1:
            //enemyArray.splice(enemyIndex, 1);
           this.props.removeEnemy(this.props.actualEnemyStats.level, enemyIndex); 
            // Check for level gains
            this.props.modifyPlayerLevel( 0.2 * this.props.actualEnemyStats.level);

            if ( Math.floor( this.props.playerStats.level) !== Math.floor(this.props.playerStats.level - 0.2 * this.props.actualEnemyStats.level) ) {
               //this.setState({player: Object.assign( {}, this.state.player, {maxHp:(Math.floor(this.player.level) + 1) * 50}, {hp : this.state.player.maxHp}, {level : (0.2 * this.state.actualEnemy.level)}) })
                //this.state.player.hp = this.state.player.maxHp; 
                this.props.modifyPlayerHp( Math.floor(this.props.playerStats.level) * 40, Math.floor(this.props.playerStats.level) * 40);
                }
                //this.state.player.level += (0.2 * this.state.actualEnemy.level);
                
            break;
        default:
            break;
      }
    };
    
    
    fight = (player, enemy) => {
        console.log(player);
        console.log(`player: ${player.hp} - enemy: ${enemy.hp}`);
        console.log( player.weapon + ' - ' + player.level);
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
        // Simple expression to determine how much damage is inflicted based on weapon, level and a random modifier
        defender.hp -= Math.floor(attacker.weaponValue + (Math.random()*5*attacker.weaponValue/10) + Math.floor(attacker.level)*3); 
        return;
    }
    
    
    findMatch = (arr) => {
        let matchIndex = 0;
        // It iterate throught all the obstacles ( which is an array of every colored pixel in the surrounding ) until it match the coordinates of the current obstacle
        // in the corresponding array ( health, weapons, guards, ...) passed in as parameter
        arr.forEach( (el, ind) => 
        {
            if ( (38 + this.dx < el[0] && 52 + this.dx > el[0])
                 &&
                 (68 + this.dy < el[1] && 82 + this.dy > el[1]) ) 
                     matchIndex =   ind;
       });
       return matchIndex;
    }


    test = () => {
        this.props.toggleFogwar();
        this.drawBase();
    }


    render() {
        return (<div className="room">
                    <Cockpit testing={this.test} />
                    <App canvasRef={el => this.canv = el}
                         width={this.width}
                         height={this.height} />
                </div>)
    }
};

class Cockpit extends React.Component {


    render() {
        return (
        <div>
            <button onClick={this.props.testing}/>
        </div>
        )
    }
}

// ############## REDUX PART #################################
const TOGGLEFOG = 'TOGGLEFOG';

const toggleFogwar = () => {
    return {type: TOGGLEFOG};
};

const toggleFogReducer = (state = false, action) => {
    switch(action.type)
    {
        case TOGGLEFOG:
            return !state;
        default:
            return state;
    }
};
// -----------------------------------------------------------
const HEALTH = 'HEALTH';
const WEAPON = 'WEAPON';
const LEVEL  = 'LEVEL';

const modifyHealth = (actual, max) => {
    return {type: HEALTH, actual, max};
};
const modifyWeapon = (name, value) => {
    return {type: WEAPON, name, value};
};
const modifyLevel = (val) => {
    return {type: LEVEL, val}
};

const playerReducer = (state = {level:1, maxHp: 50, hp:50, weapon: 'knife', weaponValue: 8}, action ) => {
    switch(action.type) 
    {
        case HEALTH:
            return Object.assign(   {}, 
                                    state, 
                                    {hp: (action.max<action.actual+25) ? action.max : action.actual + 25}, 
                                    {maxHp: action.max} );
        case WEAPON: 
            return Object.assign( {}, state, {weapon: action.name, weaponValue: action.value} );
        case LEVEL:
            return Object.assign( {}, state, {level: Math.round((state.level + action.val)*1e2 ) /1e2 } );
        default:
            return state;
    }
};
// --------------------------------------------------------------
const ACTUAL_ENEMY = 'ACTUAL_ENEMY';

const changeEnemy = (newEnemy) => {
    return {type:ACTUAL_ENEMY, newEnemy}
}

const actualEnemyReducer = (state = {}, action) => {
    switch(action.type)
    {
        case ACTUAL_ENEMY:
            return action.newEnemy;
        default:
            return state;
    }
}
// --------------------------------------------------------------
const HEALTHS_POSITIONS = 'HEALTHS_POSITIONS';
const WEAPONS_POSITIONS = 'WEAPONS_POSITIONS';

const removeHealth = (index) => {
    return {type: HEALTHS_POSITIONS, index};
};

const removeWeapon = (index) => {
    return {type: WEAPONS_POSITIONS, index};
};


const defaultObjsState =   [{healthsPositions: [[70, 160], [125, 25], [175, 190], [195,270] ]}, 
                            {weaponsPositions: [[175, 25], [125,270] ]}]


const objectsReducer = (state = JSON.parse(JSON.stringify(defaultObjsState)), action) => {
    switch(action.type)
    {
        case HEALTHS_POSITIONS:
            state[0].healthsPositions =  [...state[0].healthsPositions.slice(0, action.index), ...state[0].healthsPositions.slice( action.index + 1)];
            return state;
        case WEAPONS_POSITIONS:
            state[1].weaponsPositions =  [...state[1].weaponsPositions.slice(0,  action.index), ...state[1].weaponsPositions.slice( action.index + 1)];
            return state;
        default:
            return state;
    }
};

//----------------------------------------------------------------------------------------------------------

const CREEPS_POSITIONS = 'CREEPS_POSITIONS';
const GUARDS_POSITIONS = 'GUARDS_POSITIONS';
const BOSS_POSITION = 'BOSS_POSITION';
const UNKNOWN = 'UNKNOWN';

const removeEnemyAction = (enemyLevel, index) => {
    switch(enemyLevel)
    {
        case 1: return {type: CREEPS_POSITIONS, index};
        case 2: return {type: GUARDS_POSITIONS, index};
        case 3: return {type: BOSS_POSITION, index};
        default: return {type: UNKNOWN};
    }
}

const defaultEnemyState =   [{creepsPositions: [ [55,180], [140,85], [100,122], [190, 30], [180,160],
                                            [190,195], [55,245], [190,245], ]},
                            {guardsPositions: [ [40,240], [205,240], [115, 245], [135, 245] ]},

                            {bossPosition   : [ [120,180] ]}]

const enemyReducer = (state = JSON.parse(JSON.stringify(defaultEnemyState)), action) => {
    switch(action.type)
    {
        case CREEPS_POSITIONS:
            state[0].creepsPositions = [...state[0].creepsPositions.slice(0,  action.index), ...state[0].creepsPositions.slice( action.index + 1, state[0].creepsPositions.length)];
            return state;
        case GUARDS_POSITIONS:
            state[1].guardsPositions = [...state[1].guardsPositions.slice(0,  action.index), ...state[1].guardsPositions.slice( action.index + 1)];
            return state;
        case BOSS_POSITION:
            state[2].bossPosition = [...state[2].bossPosition.slice(0,  action.index), ...state[2].bossPosition.slice( action.index + 1)];
            return state;
        default:
            return state;
    }
};

const appReducer = combineReducers({toggleFog: toggleFogReducer, player: playerReducer, actualEnemy: actualEnemyReducer, objects: objectsReducer, enemies: enemyReducer });

// ---------------------------------------------------------------------------------------
const RESET = 'RESET';

const resetGame = () => {
    return {type: RESET}
}

const rootReducer = (state, action) => { 
    if (action.type === RESET) 
        state = undefined;
        
    return appReducer(state, action);
}

const store = createStore(rootReducer);

// ############### REACT-REDUX PART ##########################
const mapStateToProps = (state) => 
                        { return {isFog:state.toggleFog, playerStats: state.player, actualEnemyStats: state.actualEnemy, 
                                  objectsArray: state.objects, enemiesArray: state.enemies} };

const mapDispatchToProps = (dispatch) => {
    return {
        toggleFogwar: () => {
            dispatch ( toggleFogwar() );
        },
        modifyPlayerHp: (actual, max) => {
            dispatch ( modifyHealth(actual, max) );
        },
        modifyPlayerWeapon: (name, value) => {
            dispatch ( modifyWeapon(name, value) );
        },
        modifyPlayerLevel: (val) => {
            dispatch ( modifyLevel(val) );
        },
        modifyActualEnemy: (newEnemy) => {
            dispatch( changeEnemy(newEnemy) );
        },
        removeHealth: (index) => {
            dispatch ( removeHealth(index) );
        },
        removeWeapon: (index) => {
            dispatch ( removeWeapon(index) );
        },
        removeEnemy: (enemyLevel, index) => {
            dispatch ( removeEnemyAction(enemyLevel, index) );
        },
        resetGame: () => {
            dispatch ( resetGame() );
        }
    }
};

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