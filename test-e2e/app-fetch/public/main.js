var $ = window.$;

var $response;
var $responseTime;

var loadResponse = async function() {
  const startDate = new Date();
  const responseData = await fetch("http://localhost:3100/api/response");
  const responseJson = await responseData.json();
  const endDate = new Date();
  const totalTime = endDate - startDate;
  $response.text(responseJson.display);
  $responseTime.text(totalTime);
};

$.when($.ready).then(function() {
  $response = $("#response");
  $responseTime = $("#response-time");

  Promise.all([loadResponse()]);
});
