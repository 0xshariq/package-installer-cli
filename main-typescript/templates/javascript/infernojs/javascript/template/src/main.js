import { render } from 'inferno';
import { createElement } from 'inferno-create-element';

const App = () => <h1>Hello Inferno!</h1>;

render(<App />, document.getElementById('app'));
