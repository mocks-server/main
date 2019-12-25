var $ = window.$;
var adminApiClient = window.mocksServerAdminApiClient;
var dataProvider = window.dataProvider;

var $behaviorsContainer;
var $fixturesContainer;
var $aboutContainer;
var $settingsContainer;
var $currentBehaviorNameContainer;
var $currentBehaviorContainer;
var $currentFixtureIdContainer;
var $currentFixtureContainer;
var $setBehaviorBaseButton;
var $setBehaviorUser2Button;

var currentBehavior = new dataProvider.Selector(
  adminApiClient.settings,
  {
    provider: adminApiClient.behaviorsModel,
    query: function(query, prevResults) {
      return {
        urlParams: {
          name: prevResults[0].behavior
        }
      };
    }
  },
  function(settingsResults, behaviorResult) {
    return behaviorResult;
  },
  {
    defaultValue: {}
  }
);

var currentFixture = new dataProvider.Selector(
  currentBehavior,
  {
    provider: adminApiClient.fixturesModel,
    query: function(query, prevResults) {
      return {
        urlParams: {
          id: prevResults[0].fixtures[prevResults[0].fixtures.length - 1]
        }
      };
    }
  },
  function(currentBehaviorResult, fixtureResult) {
    return fixtureResult;
  },
  {
    defaultValue: {}
  }
);

var loadAbout = function() {
  return adminApiClient.about.read().then(function(about) {
    $aboutContainer.empty();
    Object.keys(about).forEach(function(key) {
      $aboutContainer.append(
        `<li><b>version</b>:&nbsp;<span data-testid="about-${key}" id="about-${key}">${about[key]}</span></li>`
      );
    });
  });
};

var loadSettings = function() {
  return adminApiClient.settings.read().then(function(settings) {
    $settingsContainer.empty();
    Object.keys(settings).forEach(function(key) {
      $settingsContainer.append(
        `<li><b>${key}</b>:&nbsp;<span data-testid="settings-${key}">${settings[key]}</span></li>`
      );
    });
  });
};

var loadBehaviors = function() {
  return adminApiClient.behaviors.read().then(function(behaviorsCollection) {
    $behaviorsContainer.empty();
    behaviorsCollection.forEach(function(behavior) {
      $behaviorsContainer.append(
        `<li data-testid="behavior-${
          behavior.name
        }" class="behaviors-collection-item">${JSON.stringify(behavior)}</li>`
      );
    });
  });
};

var loadFixtures = function() {
  return adminApiClient.fixtures.read().then(function(fixturesCollection) {
    $fixturesContainer.empty();
    fixturesCollection.forEach(function(fixture) {
      $fixturesContainer.append(
        `<li data-testid="fixture-${fixture.id}" class="fixtures-collection-item">${JSON.stringify(
          fixture
        )}</li>`
      );
    });
  });
};

var loadCurrentBehavior = function() {
  return currentBehavior.read().then(function(currentBehaviorResult) {
    $currentBehaviorNameContainer.text(currentBehaviorResult.name);
    $currentBehaviorContainer.text(JSON.stringify(currentBehaviorResult));
  });
};

var loadCurrentFixture = function() {
  return currentFixture.read().then(function(currentFixtureResult) {
    $currentFixtureIdContainer.text(currentFixtureResult.id);
    $currentFixtureContainer.text(JSON.stringify(currentFixtureResult));
  });
};

$.when($.ready).then(function() {
  $behaviorsContainer = $("#behaviors-container");
  $fixturesContainer = $("#fixtures-container");
  $aboutContainer = $("#about-container");
  $settingsContainer = $("#settings-container");
  $currentBehaviorNameContainer = $("#current-behavior-name");
  $currentBehaviorContainer = $("#current-behavior");
  $currentFixtureIdContainer = $("#current-fixture-id");
  $currentFixtureContainer = $("#current-fixture");
  $setBehaviorBaseButton = $("#set-behavior-base");
  $setBehaviorUser2Button = $("#set-behavior-user2");

  $setBehaviorBaseButton.click(function() {
    adminApiClient.settings.update({
      behavior: "base"
    });
  });
  $setBehaviorUser2Button.click(function() {
    adminApiClient.settings.update({
      behavior: "user2"
    });
  });

  adminApiClient.settings.onClean(function() {
    loadSettings();
  });

  currentBehavior.onClean(function() {
    loadCurrentBehavior();
  });

  currentFixture.onClean(function() {
    loadCurrentFixture();
  });

  Promise.all([
    loadBehaviors(),
    loadFixtures(),
    loadAbout(),
    loadSettings(),
    loadCurrentBehavior(),
    loadCurrentFixture()
  ]);
});
