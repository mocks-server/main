var $ = window.$;

var PORT = "";

var $response;
var $responseTime;
var loadResponse = async function (url, $responseElement, $responseTimeElement) {
  const startDate = new Date();
  const responseData = await fetch(`http://127.0.0.1:${PORT}/api/${url}`);
  const responseJson = await responseData.json();
  const endDate = new Date();
  const totalTime = endDate - startDate;
  $responseElement.text(responseJson.display);
  $responseTimeElement.text(totalTime);
};

$.when($.ready).then(function () {
  $response = $("#response");
  $responseTime = $("#response-time");

  Promise.all([loadResponse("response", $response, $responseTime)]);
});
