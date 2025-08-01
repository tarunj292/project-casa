class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleOrder = () => {
    const message = this.createChatBotMessage("You can track your order in the 'My Orders' section.");
    this.setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
  };

  handleDefault = () => {
    const message = this.createChatBotMessage("I'm here to help. Please ask about orders, delivery, or returns.");
    this.setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
  };
}

export default ActionProvider;
