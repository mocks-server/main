var $ = window.$;
var adminApiClient = window.mocksServerAdminApiClientDataProvider;
var dataProvider = window.dataProvider;

var $mocksContainer;
var $routesContainer;
var $aboutContainer;
var $settingsContainer;
var $currentMockNameContainer;
var $currentMockContainer;
var $currentRouteVariantIdContainer;
var $currentRouteVariantContainer;
var $setMockBaseButton;
var $setMockUser2Button;
var $alertsContainer;

var currentMock = new dataProvider.Selector(
  adminApiClient.settings,
  adminApiClient.mocks,
  function (_query, settingsResults, mocksResults) {
    return adminApiClient.mocksModel.queries.byId(settingsResults.mock || mocksResults[0].id);
  },
  {
    initialState: {
      data: {},
    },
  }
);

var currentRouteVariant = new dataProvider.Selector(
  currentMock,
  function (_query, mockResults) {
    return adminApiClient.routesVariantsModel.queries.byId(mockResults.routesVariants[0]);
  },
  {
    initialState: {
      data: {},
    },
  }
);

var loadAbout = function () {
  return adminApiClient.about.read().then(function (about) {
    $aboutContainer.empty();
    Object.keys(about).forEach(function (key) {
      $aboutContainer.append(
        `<li><b>version</b>:&nbsp;<span data-testid="about-${key}" id="about-${key}">${about[key]}</span></li>`
      );
    });
  });
};

var loadSettings = function () {
  return adminApiClient.settings.read().then(function (settings) {
    $settingsContainer.empty();
    Object.keys(settings).forEach(function (key) {
      $settingsContainer.append(
        `<li><b>${key}</b>:&nbsp;<span data-testid="settings-${key}">${settings[key]}</span></li>`
      );
    });
  });
};

var loadMocks = function () {
  return adminApiClient.mocks.read().then(function (mocksCollection) {
    $mocksContainer.empty();
    mocksCollection.forEach(function (mock) {
      $mocksContainer.append(
        `<li data-testid="mock-${mock.id}" class="mocks-collection-item">${JSON.stringify(
          mock
        )}</li>`
      );
    });
  });
};

var loadRoutes = function () {
  return adminApiClient.routes.read().then(function (routesCollection) {
    $routesContainer.empty();
    routesCollection.forEach(function (route) {
      $routesContainer.append(
        `<li data-testid="route-${route.id}" class="routes-collection-item">${JSON.stringify(
          route
        )}</li>`
      );
    });
  });
};

var loadAlerts = function () {
  return adminApiClient.alerts.read().then(function (alertsCollection) {
    $alertsContainer.empty();
    alertsCollection.forEach(function (alertModel) {
      $alertsContainer.append(
        `<li data-testid="alert-${alertModel.id}" class="alerts-collection-item">${JSON.stringify(
          alertModel
        )}</li>`
      );
    });
  });
};

var loadCurrentMock = function () {
  return currentMock.read().then(function (currentMockResult) {
    $currentMockNameContainer.text(currentMockResult.id);
    $currentMockContainer.text(JSON.stringify(currentMockResult));
  });
};

var loadCurrentRouteVariant = function () {
  return currentRouteVariant.read().then(function (currentRouteVariantResult) {
    $currentRouteVariantIdContainer.text(currentRouteVariantResult.id);
    $currentRouteVariantContainer.text(JSON.stringify(currentRouteVariantResult));
  });
};

$.when($.ready).then(function () {
  $mocksContainer = $("#mocks-container");
  $routesContainer = $("#routes-container");
  $alertsContainer = $("#alerts-container");
  $aboutContainer = $("#about-container");
  $settingsContainer = $("#settings-container");
  $currentMockNameContainer = $("#current-mock-id");
  $currentMockContainer = $("#current-mock");
  $currentRouteVariantIdContainer = $("#current-route-variant-id");
  $currentRouteVariantContainer = $("#current-route-variant");
  $setMockBaseButton = $("#set-mock-base");
  $setMockUser2Button = $("#set-mock-user2");

  $setMockBaseButton.click(function () {
    adminApiClient.settings.update({
      mocks: { selected: "base" },
    });
  });
  $setMockUser2Button.click(function () {
    adminApiClient.settings.update({
      mocks: { selected: "user2" },
    });
  });

  adminApiClient.settings.on("cleanCache", function () {
    loadSettings();
  });

  currentMock.on("cleanCache", function () {
    loadCurrentMock();
  });

  currentRouteVariant.on("cleanCache", function () {
    loadCurrentRouteVariant();
  });

  Promise.all([
    loadMocks(),
    loadRoutes(),
    loadAbout(),
    loadSettings(),
    loadCurrentMock(),
    loadCurrentRouteVariant(),
    loadAlerts(),
  ]);
});
