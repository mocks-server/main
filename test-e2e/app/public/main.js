var $ = window.$;

var $response;
var $responseTime;
var $legacyResponse;
var $legacyResponseTime;

var loadResponse = async function (url, $responseElement, $responseTimeElement) {
  const startDate = new Date();
  const responseData = await fetch(`http://localhost:3100/api/${url}`);
  const responseJson = await responseData.json();
  const endDate = new Date();
  const totalTime = endDate - startDate;
  $responseElement.text(responseJson.display);
  $responseTimeElement.text(totalTime);
};

$.when($.ready).then(function () {
  $response = $("#response");
  $responseTime = $("#response-time");
  $legacyResponse = $("#legacy-response");
  $legacyResponseTime = $("#legacy-response-time");

  Promise.all([
    loadResponse("response", $response, $responseTime),
    loadResponse("legacy-response", $legacyResponse, $legacyResponseTime),
  ]);
});
