class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lower = message.toLowerCase();
    if (lower.includes("order")) {
      this.actionProvider.handleOrder();
    } else {
      this.actionProvider.handleDefault();
    }
  }
}

export default MessageParser;
