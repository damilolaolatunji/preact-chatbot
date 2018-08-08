import './style';
import { Component } from 'preact';
import Pusher from 'pusher-js';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userMessage: '',
      conversation: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const pusher = new Pusher('<your app key>', {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('bot');
    channel.bind('bot-response', data => {
      const msg = {
        text: data.message,
        user: 'ai',
      };
      this.setState({
        conversation: [...this.state.conversation, msg],
      });
    });
  }

  handleChange(event) {
    this.setState({ userMessage: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const msg = {
      text: this.state.userMessage,
      user: 'user',
    };

    this.setState({
      conversation: [...this.state.conversation, msg],
    });

    fetch('http://localhost:7777/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: this.state.userMessage,
      }),
    });

    this.setState({ userMessage: '' });
  }

  render() {
    const ChatBubble = (text, i, className) => {
      const classes = `${className} chat-bubble`;
      return (
        <div key={`${className}-${i}`} class={`${className} chat-bubble`}>
          <span class="chat-content">{text}</span>
        </div>
      );
    };

    const chat = this.state.conversation.map((e, index) =>
      ChatBubble(e.text, index, e.user)
    );

    return (
      <div>
        <h1>Realtime Preact Chatbot</h1>
        <div class="chat-window">
          <div class="conversation-view">{chat}</div>
          <div class="message-box">
            <form onSubmit={this.handleSubmit}>
              <input
                value={this.state.userMessage}
                onInput={this.handleChange}
                class="text-input"
                type="text"
                autofocus
                placeholder="Type your message and hit Enter to send"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}
