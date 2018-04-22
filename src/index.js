import React from 'react';
import ReactDOM from 'react-dom'
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';

//import './index.css';

class Presentational extends React.Component {

    handleAdd = () => {
        this.props.addMethod(this.refs.input.value);
        this.refs.input.value = '';
    }

    render() {
        return (<div className="topLevel">
                    <input ref="input"/>
                    <button onClick={this.handleAdd}> ADD </button>
                    <label>{this.props.msg}</label>
                </div>)
    }
};

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

const mapStateToProps = (state) => { return {msg: state} };

const mapDispatchToProps = (dispatch) => {
    return {
        addMethod: (stuffToAdd) => {
            dispatch(addCreation(stuffToAdd));
        }
    }
}

const Container = connect(mapStateToProps, mapDispatchToProps)(Presentational);

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