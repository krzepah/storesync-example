import { Component, render } from 'preact';
import createStore from 'mutastore'
import { Provider, connect } from 'mutastore/preact'

import { map } from 'ramda';

import sync from 'mutasync'

import { mutations, defaults } from './mutations';

let store = createStore(
  defaults,
  mutations
)

const SYNC = sync({
  host: 'http://localhost:2017',
  app: '15ryxhs6rer634l73wvhh8'
})

store.subscribe(SYNC.apply)

store.subscribe((
  state, update, overwrite, act
) => console.log('->', state, act))

const LoginBase = ({login}) => <form onSubmit={
  (e) => {
    e.preventDefault();
    login( e.target[0].value, e.target[1].value )
  }
}>
  <label>Username</label>
  <input type="text" id="email" />
  <label>Password</label>
  <input type="password" id="password" />
  <button type="submit">Login</button>
  <button onClick={(e) => {
    e.preventDefault();
    sync('mytoken').clearLocal(defaults)
    store.mutate({logout: defaults}, true)
  }}>Logout</button>
</form>

const Login = connect(
  (state, props) => ({...state}),
  (state, props) => ({
    login: (state, username, password) => SYNC
      .auth( username, password )
      .then( (res) => res.json() )
      .then( (res) => ({ authenticate: { ...res }, sync: false }))
      .catch(function(res) {
         console.log('error :', res); 
      })
  })
)(LoginBase)

const PageBase = ({elements, elementsIds, add}) => <div
  style={{padding: "10px"}}
>
  <Login />
  <br />
  <input id="input" />
  <button onClick={() => {
    add(document.getElementById('input').value,
      Math.random().toString(36).substring(7)
    );
    document.getElementById('input').value = "";
  }}>
    add
  </button>
  <br />
  elements: 
  { map(
      (id) => <div style={{padding: "20px", "border-bottom": "solid 1px;"}}>
        {elements[id]}
      </div>,
      elementsIds
  )}
</div>

const Page = connect(
  (state, props) => ({...state}),
  (state, props) => ({
    add: (state, text, newId) => ({
      newElement: {
        text: text,
        newId: newId
      }
    })
  })
)(PageBase)

class App extends Component {
  componentDidMount = () => store.setState(
    sync('mytoken').retrieveLocal()
  )

  render = () => <div id="app">
    <h1>Hello World</h1>
    <Provider store={store}>
      <Page />
    </Provider>
  </div>
}

render(
  <App />,
  root
);

