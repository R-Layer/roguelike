import React from 'react';
import ReactDOM from 'react-dom'
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';

import './index.css';
//import {walls} from './path.js';
import {App} from './gameFrame.js';

// ########## REACT PART ####################################
class Presentational extends React.Component {


    render() {
        return (<div className="room">
                    <Cockpit />
                    <App />
                </div>)
    }
};

class Cockpit extends React.Component {

    render() {
        return (
        <div>
        </div>
        )
    }
}

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