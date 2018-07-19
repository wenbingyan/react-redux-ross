import React from 'react';
import PropTypes from 'prop-types'
// Provider 是一个组件，接受了一个store的属性，内部将其挂载context 上

class Provider extends React.Component{
    static childContextTypes = {
        store:PropTypes.object
    };
    getChildContext(){
        return {store:this.props.store}
    }
    render(){
        return this.props.children
    }
}

let connect = (mapStateToProps,mapDispatchToProps) => (Component) => {
    return class Proxy extends React.Component{
        static contextTypes = {
            store : PropTypes.object
        }
        constructor(props,context){
            super(props,context)
            this.state = mapStateToProps(context.store.getState());
        }
        componentWillMount(){
            this.context.store.subscribe(()=>{
                this.setState(mapStateToProps(this.context.store.getState()))
            })
        }
        render(){
            return <Component 
                        {...this.state} 
                        {...mapDispatchToProps(this.context.store.dispatch)} 
                    />
        }
    }
}

export {Provider,connect}