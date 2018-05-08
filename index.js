"use strict";
const Alexa = require("alexa-sdk");

function friendlyTime (timeStr) {
  let [hours, minutes] = timeStr.split(":");
  let meridian;
  let friendlyStr;

  hours = parseInt(hours);

  if (hours > 12) {
    hours = hours - 12;
    meridian = 'p.m';
  } else {
    meridian = 'a.m';
  }

  if (hours === 0) {
    hours = 12;
  }

  if (minutes === "15") {
    friendlyStr = `a quarter after ${hours} ${meridian}`;
  } else if (minutes === "00") {
    friendlyStr = `${hours} ${meridian}`;
  } else {
    friendlyStr = `${hours} ${minutes} ${meridian}`;
  }

  return friendlyStr;
}

const languageStrings = {
  "en-US": {
    translation: {
      BuyTickets: "Alright, {{NumberTickets}} tickets for {{MovieName}}" + " coming up! That'll be ${{Price}} in all."
      BuyTicketsDenied: "I'm sorry. What do you want to do instead?",
      BuyTicketsDeniedPrompt: "Please tell me again which movie you want."
    }
  },
  fallback: {
    Unhandled: "I can't do that at the moment! How about buying tickets?",
    UnhandledPrompt: "Tell me the movie you want to see."
  }
};

const handlers = {
  LaunchRequest () {
    this.emit("BuyTicketsIntent");
  },
  BuyTicketsIntent() {
    if(this.event.request.dialogState !== "COMPLETED") {
      const intent = this.event.request.intent;

  if(
    intent.slots.MovieTime.value &&
    intent.slots.MovieTime.confirmationStatus !== "CONFIRMED"
  ) {
    let movieTime = intent.slots.MovieTime.value;
    movieTime = friendlyTime(intent.slots.MovieTime.value);
    intent.slots.MovieTime.value = movieTime;
  }
      this.emit(":delegate", intent);
    } else {
      const movie = {
        NumberTickets: ParseFloat(this.event.request.intent.slots.NumberTickets.value),
        MovieName: this.event.request.intent.slots.MovieName.value
      };
      movie.Price = movie.NumberTickets * 10;

      if(this.event.request.intent.slots.Discount.value) {
         movie.Price = movie.Price / 2;
      }

      if(this.event.request.intent.confirmationStatus === "CONFIRMED") {
         const speak = this.t("BuyTickets", movie);
         this.response.speak(speak);
         this.emit(":responseReady");
      } else {
         const speak = this.t("BuyTicketsDenied");
         const listen = this.t("BuyTicketsDeniedPrompt");
         this.response.speak(speak).listen(listen);
      }
      this.emit(":resposeReady");
    }
  },

  Unhandled() {
    const speak = this.t(["Unhandled", languageStrings.fallback.Unhandled]);
    const listen = this.t(["UnhandledPrompt", languageStrings.fallback.UnhandledPrompt]);
  };
  this.response
    .speak(speak)
    .listen(listen);
    this.emit(":responseReady");
  }
};

exports.handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
