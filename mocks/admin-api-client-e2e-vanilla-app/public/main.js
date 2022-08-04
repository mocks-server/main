var $ = window.$;
var adminApiClientLibrary = window.mocksServerAdminApiClient;

var $collectionsContainer;
var $routesContainer;
var $aboutContainer;
var $configContainer;
var $currentCollectionNameContainer;
var $currentCollectionContainer;
var $currentVariantIdContainer;
var $currentVariantContainer;
var $setCollectionBaseButton;
var $setCollectionUser2Button;
var $alertsContainer;

var adminApiClient = new adminApiClientLibrary.AdminApiClient();

var readCurrentCollection = function() {
  return Promise.all([
    adminApiClient.readConfig(),
    adminApiClient.readCollections()
  ]).then(([configResults, collectionsResults]) => {
    return adminApiClient.readCollection(configResults.mock.collections.selected || collectionsResults[0].id);
  });
}

var readCurrentVariant = function() {
  return readCurrentCollection().then((collectionResults) => {
    return adminApiClient.readVariant(collectionResults.definedRoutes[0]);
  });
}

var loadAbout = function () {
  return adminApiClient.readAbout().then(function (about) {
    $aboutContainer.empty();
    Object.keys(about.versions).forEach(function (key) {
      $aboutContainer.append(
        `<li><b>version</b>:&nbsp;<span data-testid="about-version-${key}" id="about-version-${key}">${about.versions[key]}</span></li>`
      );
    });
  });
};

var formatConfig = function(config) {
  if(typeof config === "boolean") {
    return config.toString();
  }
  if(typeof config === "object") {
    return JSON.stringify(config);
  }
  return config;
}

var loadConfig = function () {
  return adminApiClient.readConfig().then(function (config) {
    $configContainer.empty();
    Object.keys(config).forEach(function (key) {
      $configContainer.append(
        `<li><b>${key}</b>:&nbsp;<span data-testid="config-${key}">${formatConfig(config[key])}</span></li>`
      );
    });
  });
};

var loadCollections = function () {
  return adminApiClient.readCollections().then(function (collectionsCollection) {
    $collectionsContainer.empty();
    collectionsCollection.forEach(function (collection) {
      $collectionsContainer.append(
        `<li data-testid="collection-${collection.id}" class="collections-collection-item">${JSON.stringify(
          collection
        )}</li>`
      );
    });
  });
};

var loadRoutes = function () {
  return adminApiClient.readRoutes().then(function (routesCollection) {
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
  return adminApiClient.readAlerts().then(function (alertsCollection) {
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

var loadCurrentCollection = function () {
  return readCurrentCollection().then(function (currentCollectionResult) {
    $currentCollectionNameContainer.text(currentCollectionResult.id);
    $currentCollectionContainer.text(JSON.stringify(currentCollectionResult));
  });
};

var loadCurrentVariant = function () {
  return readCurrentVariant().then(function (currentVariantResult) {
    $currentVariantIdContainer.text(currentVariantResult.id);
    $currentVariantContainer.text(JSON.stringify(currentVariantResult));
  });
};

$.when($.ready).then(function () {
  $collectionsContainer = $("#collections-container");
  $routesContainer = $("#routes-container");
  $alertsContainer = $("#alerts-container");
  $aboutContainer = $("#about-container");
  $configContainer = $("#config-container");
  $currentCollectionNameContainer = $("#current-collection-id");
  $currentCollectionContainer = $("#current-collection");
  $currentVariantIdContainer = $("#current-variant-id");
  $currentVariantContainer = $("#current-variant");
  $setCollectionBaseButton = $("#set-collection-base");
  $setCollectionUser2Button = $("#set-collection-user2");

  $setCollectionBaseButton.click(function () {
    adminApiClient.updateConfig({
      mock: {
        collections: { selected: "base" },
      }
    });
  });
  $setCollectionUser2Button.click(function () {
    adminApiClient.updateConfig({
      mock: {
        collections: { selected: "user2" },
      } 
    });
  });

  setInterval(() => {
    loadConfig();
    loadCurrentCollection();
    loadCurrentVariant();
  }, 500);

  Promise.all([
    loadCollections(),
    loadRoutes(),
    loadAbout(),
    loadConfig(),
    loadCurrentCollection(),
    loadCurrentVariant(),
    loadAlerts(),
  ]);
});
