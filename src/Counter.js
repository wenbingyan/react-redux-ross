import React from 'react'
import {connect} from './react-redux'

class Counter extends React.Component{
    render(){
        return <div>
                    <button onClick={()=>{this.props.add(10)}}>+</button>
                    {this.props.n}
                </div>
    }
}
let mapStateToProps = (state) => {
    return {n:state.number}
}
let mapDispatchToProps = (dispatch) => {
    return {
        add:(count)=>{
            console.log
            dispatch({type:'ADD',count})
        }
    }
}   
export default connect(mapStateToProps,mapDispatchToProps)(Counter)