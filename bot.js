// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker } = require('botbuilder-ai');
const DentistScheduler = require('./dentistscheduler');
const IntentRecognizer = require("./intentrecognizer")

class DentaBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        // call the parent constructor
        super();
        if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');

        // create a QnAMaker connector
        this.QnAMaker = new QnAMaker(configuration.QnAConfiguration, qnaOptions)
       
        // create a DentistScheduler connector
        this.DentistScheduler = new DentistScheduler(configuration.SchedulerConfiguration)
        // create a IntentRecognizer connector
        this.IntentRecognizer = new IntentRecognizer(configuration.LuisConfiguration)

        this.onMessage(async (context, next) => {
            // send user input to QnA Maker and collect the response in a variable
            const qnaResults = await this.QnAMaker.getAnswers(context)

            // send user input to IntentRecognizer and collect the response in a variable
            const LuisResult = await this.IntentRecognizer.executeLuisQuery(context)        
            // determine which service to respond with based on the results from LUIS //
            
            if (LuisResult.luisResult.prediction.topIntent === 'GetAvailability' &&
                LuisResult.intents.GetAvailability.score > .5 &&
                LuisResult.entities.$instance
            ) {
                const availableTime = await this.DentistScheduler.getAvailability()
                
                console.log(availableTime)
                await context.sendActivity(availableTime);
                await next();
                return;
            } 
            else if (LuisResult.luisResult.prediction.topIntent === 'ScheduleAppointment' &&
                     LuisResult.intents.ScheduleAppointment.score > .5 &&
                     LuisResult.entities.$instance &&
                     LuisResult.entities.$instance.time && 
                     LuisResult.entities.$instance.time[0]
            ) { 
                const scheduledTime = LuisResult.entities.$instance.time[0].text;
                const scheduleAppointmentResponse = await this.DentistScheduler.scheduleAppointment(scheduledTime);
                console.log(scheduleAppointmentResponse)
                await context.sendActivity(scheduleAppointmentResponse);
                await next();
                return;
            }
            else if (qnaResults[0]) {
                await context.sendActivity(`${qnaResults[0].answer}`);
            }
            else {
                // If no answers were returned from QnA Maker, reply with help.
                await context.sendActivity(`I'm not sure I can answer your question. `
                    + 'I can schedule your appointment with the doctor '
                    + `Or you can ask me questions concerning the clinic.`);
            }
            await next();
    });

        this.onMembersAdded(async (context, next) => {
        const membersAdded = context.activity.membersAdded;
        //write a custom greeting
        const welcomeText = 'Welcome to Dental Office Assistant Chatbot!  I can help you answer your questions concerning the clinic or you may schedule an appointment.  You can say "schedule an appointment for 4 PM"';
        for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            }
        }
        // by calling next() you ensure that the next BotHandler is run.
        await next();
    });
    }
}

module.exports.DentaBot = DentaBot;
