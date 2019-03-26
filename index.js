const Alexa = require('ask-sdk-core');
const https = require('https');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    // Our skill will receive a LaunchRequest when the user invokes the skill
    // with the  invocation name, but does not provide any utterance
    // mapping to an intent.
    // For Example, "Open code academy"
    const speakOutput = 'Welcome to Codecademy';

    // The response builder contains is an object that handles generating the
    // JSON response that your skill returns.
    return handlerInput.responseBuilder
      .speak(speakOutput) // The text passed to speak, is what Alexa will say.
      .getResponse();
  },
};

function httpGet() {
  return new Promise(((resolve, reject) => {

    const currentDate = new Date();
    const day = currentDate.getMonth() + 1;
    const fullDate = (currentDate.getFullYear()) + "-" + (day > 9 ? currentDate.getMonth() + 1 : "0"+ (currentDate.getMonth() + 1)) + "-" + currentDate.getDate();
    var options = {
        host: 'api.tvmaze.com',
        path: `/schedule?country=US&date=${fullDate}`,
        method: 'GET',
    };
    
    const request = https.request(options, (response) => {
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}

const MyFavouriteTvShow = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ShowIntent';
  },
  async handle(handlerInput) {
    const showsForToday = [];
    const response = await httpGet();

    const data = response.filter((type) => {
        return type.show.type === 'Scripted'
    }).map((res) => {
        return showsForToday.push(res.show.name)
    })
    
    const arrayWithoutLastTwo = showsForToday.slice(0, showsForToday.length - 3);
    const lastShows = `${showsForToday[showsForToday.length - 2]} and ${showsForToday[showsForToday.length - 1]}`
    const newArray = arrayWithoutLastTwo.push(lastShows)
    
    return handlerInput.responseBuilder
            .speak({Date})
            .reprompt("What would you like?")
            .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const CancelAndStopHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(error.trace);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    MyFavouriteTvShow,
    HelpHandler,
    CancelAndStopHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();