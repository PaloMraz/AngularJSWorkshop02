/// <reference path="../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="globals.ts" />
/// <reference path="data.ts" />
/// <reference path="services.ts" />
/// <reference path="controllers.ts" />
/// <reference path="directives.ts" />


module Main {

  // Main Angular module.
  var app = angular.module(Globals.AngularAppModuleName, ["ngRoute"]);

  // Controllers
  Controllers.Home.Register(app);

  // Services.
  Services.CityRepository.Register(app);
  
  // Directives.
  Directives.Static.Register(app);
  Directives.CurrentTimeBad.Register(app);
  Directives.CurrentTimeWithClass.Register(app);
  Directives.CurrentTimeWithFunction.Register(app);
  Directives.Heading.Register(app);
  Directives.CityCount.Register(app);
  Directives.Clicker.Register(app);
       
  // Routing.
  var setupRoutes = function (routeProvider: ng.route.IRouteProvider) {
    var homeRoute = { controller: Controllers.Home.Name, templateUrl: "App/CityListView.html" };
    routeProvider.when("/home", homeRoute);
    routeProvider.otherwise(homeRoute);
  }

  app.config(["$routeProvider", setupRoutes]);
}