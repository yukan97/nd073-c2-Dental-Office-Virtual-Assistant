# Dental Office Virtual Assistant

In this project, was created a customer support chatbot that resides on [Contoso Dentistry](https://victorious-moss-069d6bf10.azurestaticapps.net/) website. The bot uses Azure QnA Maker and LUIS to answer patient questions and helps them schedule appointments.

## Getting Started

Node.js vesion 

### Dependencies
All dependencies can be installed by running the following command in the ContosoDentistryChatBot directory
```
npm install
```

## Testing

To test the code be sure to install [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator).
First start the bot from ContosoDentistryChatBot folder by running command
```
npm start
```
Run the Bot Framework Emulator, click on the 'Open Bot', in the Bot URL pass the following link
```
http://localhost:3978/api/messages
```

## Project Structure
For project to pass all required CI/CD tests, the overall architecture was split into 3 separate brances: chatbot, scheduler, website.

## License

[License](LICENSE.txt)
