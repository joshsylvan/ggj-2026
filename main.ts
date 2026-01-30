import nodeBuzzers from "npm:node-buzzers";
import { IBuzzer } from "npm:node-buzzers/types/types";

const buzzers = nodeBuzzers(true) as IBuzzer;

// function blinkBuzzerLeds() {
//   setInterval(function () {
//     console.log("joshua");
//     buzzers.setLeds(true, true, true, true);
//     setTimeout(function () {
//       buzzers.setLeds(false, false, false, false);
//     }, 500);
//   }, 5000);
// }

// blinkBuzzerLeds();

buzzers.setLeds(true, false, true, false);

buzzers.onError(function (err) {
  console.log("Error: ", err);
});

console.log("hello");

buzzers.onPress(function (ev) {
  console.log(
    `PRESSED: { "Controller": ${ev.controller}, "Button": ${ev.button} }`,
  );
});
