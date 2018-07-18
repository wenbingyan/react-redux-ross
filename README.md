## react-redux 实现
### connect方法
React-Redux 提供connect方法，用于从 UI 组件生成容器组件。connect的意思，就是将这两种组件连起来。
```
import { connect } from 'react-redux'
const App = connect()(Counter)
```
上面代码中，Counter是 UI 组件，CounterApp就是由 React-Redux 通过connect方法自动生成的容器组件。 但是，因为没有定义业务逻辑，上面这个容器组件毫无意义，只是 UI 组件的一个单纯的包装层。为了定义业务逻辑，需要给出下面两方面的信息。

- 输入逻辑：外部的数据（即state对象）如何转换为 UI 组件的参数
- 输出逻辑：用户发出的动作如何变为 Action 对象，从 UI 组件传出去。
因此，connect方法的完整 API 如下。
```
import { connect } from 'react-redux'

const CounterApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter)
```
上面代码中，connect方法接受两个参数：mapStateToProps和mapDispatchToProps。 它们定义了 UI 组件的业务逻辑。 前者负责输入逻辑，即将state映射到 UI 组件的参数（props） 后者负责输出逻辑，即将用户对 UI 组件的操作映射成 Action。

### mapStateToProps
mapStateToProps是一个函数。它的作用就是像它的名字那样，建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系。 作为函数，mapStateToProps执行后应该返回一个对象，里面的每一个键值对就是一个映射。请看下面的例子。
```
function mapStateToProps(state) {
  return {
    value: state.count
  }
}
```
上面代码中，mapStateToProps是一个函数，它接受state作为参数，返回一个对象。这个对象有一个value属性，代表 UI 组件的同名参数

mapStateToProps会订阅 Store，每当state更新的时候，就会自动执行，重新计算 UI 组件的参数，从而触发 UI 组件的重新渲染。 mapStateToProps的第一个参数总是state对象，还可以使用第二个参数，代表容器组件的props对象。

使用ownProps作为参数后，如果容器组件的参数发生变化，也会引发 UI 组件重新渲染。 connect方法可以省略mapStateToProps参数，那样的话，UI 组件就不会订阅Store，就是说 Store 的更新不会引起 UI 组件的更新。

### mapDispatchToProps
mapDispatchToProps是connect函数的第二个参数，用来建立 UI 组件的参数到store.dispatch方法的映射。也就是说，它定义了哪些用户的操作应该当作 Action，传给 Store。它可以是一个函数，也可以是一个对象。 如果mapDispatchToProps是一个函数，会得到dispatch和ownProps（容器组件的props对象）两个参数。
```
function mapDispatchToProps(dispatch) {
  return {
    onIncreaseClick: () => dispatch(increaseAction)
  }
}
```
从上面代码可以看到，mapDispatchToProps作为函数，应该返回一个对象，该对象的每个键值对都是一个映射，定义了 UI 组件的参数怎样发出 Action。

connect方法生成容器组件以后，需要让容器组件拿到state对象，才能生成 UI 组件的参数。 一种解决方法是将state对象作为参数，传入容器组件。但是，这样做比较麻烦，尤其是容器组件可能在很深的层级，一级级将state传下去就很麻烦。 React-Redux 提供Provider组件，可以让容器组件拿到state。
```
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import counter from './reducers'
import CounterApp from './components/CounterApp'

let store = createStore(counter);

render(
  <Provider store={store}>
    <CounterApp />
  </Provider>,
  document.getElementById('root')
)
```
上面代码中，Provider在根组件外面包了一层，这样一来，App的所有子组件就默认都可以拿到state了。 它的原理是React组件的context属性，请看源码。
```
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
```
上面代码中，store放在了上下文对象context上面。然后，子组件就可以从context拿到store，代码大致如下。
```
let connect = (mapStateToProps,mapDispatchToProps) => (Component) => {
    return class Proxy extends React.Component{
        static contextTypes = {
            store : PropTypes.object
        }
        constructor(props,context){
            super(props,context)
            this.state = mapStateToProps(this.context.store.getState());
        }
        componentWillMount(){
            this.context.store.subscribe(()=>{
                this.setState({...mapStateToProps(this.context.store.getState())})
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
```
React-Redux自动生成的容器组件的代码，就类似上面这样，从而拿到store。