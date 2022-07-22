var $ = window.$;
var adminApiClient = window.mocksServerAdminApiClientDataProvider;
var dataProvider = window.dataProvider;

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

var currentCollection = new dataProvider.Selector(
  adminApiClient.config,
  adminApiClient.collections,
  function (_query, configResults, collectionsResults) {
    return adminApiClient.collection.queries.byId(configResults.mock.collections.selected || collectionsResults[0].id);
  },
  {
    initialState: {
      data: {},
    },
  }
);

var currentVariant = new dataProvider.Selector(
  currentCollection,
  function (_query, collectionResults) {
    return adminApiClient.variant.queries.byId(collectionResults.definedRoutes[0]);
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
  return adminApiClient.config.read().then(function (config) {
    $configContainer.empty();
    Object.keys(config).forEach(function (key) {
      $configContainer.append(
        `<li><b>${key}</b>:&nbsp;<span data-testid="config-${key}">${formatConfig(config[key])}</span></li>`
      );
    });
  });
};

var loadCollections = function () {
  return adminApiClient.collections.read().then(function (collectionsCollection) {
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

var loadCurrentCollection = function () {
  return currentCollection.read().then(function (currentCollectionResult) {
    $currentCollectionNameContainer.text(currentCollectionResult.id);
    $currentCollectionContainer.text(JSON.stringify(currentCollectionResult));
  });
};

var loadCurrentVariant = function () {
  return currentVariant.read().then(function (currentVariantResult) {
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
    adminApiClient.config.update({
      mock: {
        collections: { selected: "base" },
      }
    });
  });
  $setCollectionUser2Button.click(function () {
    adminApiClient.config.update({
      mock: {
        collections: { selected: "user2" },
      } 
    });
  });

  adminApiClient.config.on("cleanCache", function () {
    loadConfig();
  });

  currentCollection.on("cleanCache", function () {
    loadCurrentCollection();
  });

  currentVariant.on("cleanCache", function () {
    loadCurrentVariant();
  });

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
