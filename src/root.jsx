import feathers from 'feathers/client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'
import React from 'react'
import socketio from 'feathers-socketio/client'

const socket = io(window.location.origin);
const app = feathers()
  .configure(hooks())
  .configure(socketio(socket));

const messageService = app.service('messages');

class Root extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.createMessage = this.createMessage.bind(this);
    this.state = {
      messages: [],
      nextMessage: ''
    };
  }

  componentWillMount() {
    messageService.find({}).then(function (res) {
      this.setState({messages: res.data});
    }.bind(this))
    messageService.on('created', function (message) {
      this.setState({
        messages: this.state.messages.concat(message)
      });
    }.bind(this))
  }

  handleChange(event) {
    this.setState({nextMessage: event.target.value});
  }

  createMessage() {
    messageService.create({
      text: this.state.nextMessage
    });
    this.setState({nextMessage: ''});
  }

  render() {
    var messages = this.state.messages;
    return (
      <div>
        <h1>Messages</h1>
        <ul>
          { messages.map(function (message, i) {
            return (
              <li key={i}>{message.text}</li>
            );
          })}
          <input
            type="text"
            value={this.state.nextMessage}
            onChange={this.handleChange} />
          <input
            type="button"
            value="Add a message"
            onClick={this.createMessage} />
        </ul>
      </div>
    );
  }
}

export default Root