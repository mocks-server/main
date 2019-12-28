import { Api } from "@data-provider/axios";

import $ from "jquery";

let $response;
let $responseTime;

const response = new Api("/api/response", {
  baseUrl: "http://localhost:3100"
});

const loadResponse = async function() {
  const startDate = new Date();
  const responseData = await response.read();
  const endDate = new Date();
  const totalTime = endDate - startDate;
  $response.text(responseData.display);
  $responseTime.text(totalTime);
};

$.when($.ready).then(function() {
  $response = $("#response");
  $responseTime = $("#response-time");

  Promise.all([loadResponse()]);
});
