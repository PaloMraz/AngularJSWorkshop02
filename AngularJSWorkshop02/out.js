var Data;
(function (Data) {
    /**
    * Client-side reprezentácia DTO - zodpovedajúca server-side C# definícia je Model\CityInfo.cs.
    */
    var CityInfo = (function () {
        function CityInfo() {
        }
        return CityInfo;
    })();
    Data.CityInfo = CityInfo;
})(Data || (Data = {}));
/**
* Globálne konštanty - best practice, aby sme nemali rovnaké stringové literály kde kade (DRY).
*/
var Globals;
(function (Globals) {
    Globals.AngularAppModuleName = "app";
    Globals.AngularHttpService = "$http";
    Globals.AngularQService = "$q";
    Globals.AngularRootScopeService = "$rootScope";
    Globals.AngularScopeService = "$scope";
    Globals.AngularIntervalService = "$interval";
})(Globals || (Globals = {}));
/// <reference path="data.ts" />
/// <reference path="globals.ts" />
var Services;
(function (Services) {
    /**
    * Implementácia Angular service ako TypeScript classu.
    */
    var CityRepository = (function () {
        /**
        * Konštruktor má dependencies explicitne ako parametre - design-time checking.
        */
        function CityRepository(_http, _q, _rootScope) {
            this._http = _http;
            this._q = _q;
            this._rootScope = _rootScope;
            this._isReady = false;
        }
        /**
        * Metóda úre registráciu servise v danom Angular module.
        */
        CityRepository.Register = function (ngModule) {
            // Toto je tzv. inline array annotation pre DI - FMI: https://docs.angularjs.org/guide/di
            var registration = [
                Globals.AngularHttpService,
                Globals.AngularQService,
                Globals.AngularRootScopeService,
                function (http, q, rootScope) {
                    return new CityRepository(http, q, rootScope);
                }
            ];
            ngModule.factory(CityRepository.Name, registration);
        };

        /**
        * Metóda servisu ktorá volá server vracia vždy promise (buď priamo napr. z volania $http servisu,
        * môže ju aj wrapnúť do vlastného deferred objektu s využitím $q service (https://docs.angularjs.org/api/ng/service/$q).
        */
        CityRepository.prototype.loadCities = function () {
            var _this = this;
            // Ak máme promise inicializovanú to znamená, že volanie už bolo iniciované (prebieha, alebo
            // už skončilo).
            if (this._promise) {
                return this._promise;
            }

            // Volanie ešte neprebieha - iniciujeme ho.
            this._promise = this._http.get("api/CityRepository/GetAllCities");

            this._promise.success(function (cities) {
                // Event broadcast cez $rootScope service.
                _this._rootScope.$broadcast(CityRepository.CitiesLoadedEvent, cities);
            });

            // Finally callback je volaný vždy (pri úspechu aj chybe).
            this._promise["finally"](function () {
                _this._isReady = true;
            });

            // Promise z volania kešujeme, čím kešujeme aj vrátené údaje (teda pri úspešnom volaní :-).
            return this._promise;
        };

        CityRepository.prototype.clearCities = function () {
            // Promise zahodíme, aby nám ho ďalšie volanie loadCities znovu inicializovalu.
            this._promise = undefined;
            this._isReady = false;
            this._rootScope.$broadcast(CityRepository.CitiesClearedEvent);
        };

        CityRepository.prototype.isReady = function () {
            return !this._promise || this._isReady;
        };
        CityRepository.Name = "Services.CityRepository";

        CityRepository.CitiesLoadedEvent = "Services.CityRepository.CitiesLoaded";

        CityRepository.CitiesClearedEvent = "Services.CityRepository.CitiesCleared";
        return CityRepository;
    })();
    Services.CityRepository = CityRepository;
})(Services || (Services = {}));
/// <reference path="../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="data.ts" />
/// <reference path="globals.ts" />
/// <reference path="services.ts" />
var Controllers;
(function (Controllers) {
    /**
    * Angular controller ako TypeScript class - expozuje pole CityInfo objektov,
    * ktoré loaduje s využitím CityRepository servisu.
    */
    var Home = (function () {
        /**
        * Konštruktor má dependencies explicitne ako parametre - design-time checking.
        */
        function Home($scope, _cityRepositoryService) {
            var _this = this;
            this._cityRepositoryService = _cityRepositoryService;
            this.cities = [];
            $scope.vm = this;

            // Registrujeme sa u events expozovaných service singletonom, aby sme si vedeli obnoviť údaje
            // aj vtedy, keď sú menené mimo inštancie tohto kontrolera.
            $scope.$on(Services.CityRepository.CitiesLoadedEvent, function (event, cities) {
                return _this.cities = cities;
            });
            $scope.$on(Services.CityRepository.CitiesClearedEvent, function () {
                return _this.cities = [];
            });
        }
        /**
        * Metóda úre registráciu kontroleru v danom Angular module.
        */
        Home.Register = function (ngModule) {
            ngModule.controller(Home.Name, [
                Globals.AngularScopeService,
                Services.CityRepository.Name,
                function (scope, cityRepositoryService) {
                    return new Home(scope, cityRepositoryService);
                }
            ]);
        };

        Home.prototype.loadCities = function () {
            var _this = this;
            // Voláme service a v success callbacku si inicializujeme nami expozované dáta - nerobíme
            // kópiu poľa cities, ale priamo referencujeme pole, ktorá nám poskytol service.
            this._cityRepositoryService.loadCities().then(function (response) {
                return _this.cities = response.data;
            }, function (response) {
                return console.log(response.statusText);
            });
        };

        Home.prototype.clearCities = function () {
            this._cityRepositoryService.clearCities();
        };

        Home.prototype.isReady = function () {
            return this._cityRepositoryService.isReady();
        };
        Home.Name = "Controllers.Home";
        return Home;
    })();
    Controllers.Home = Home;
})(Controllers || (Controllers = {}));
/// <reference path="../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="globals.ts" />
var Directives;
(function (Directives) {
    /**
    * Statická direktíva - nie je nijako parametrizovaná.
    */
    (function (Static) {
        Static.Name = "bspStatic";

        function Register(ngModule) {
            ngModule.directive(Static.Name, [
                function () {
                    return new Directive();
                }
            ]);
        }
        Static.Register = Register;

        var Directive = (function () {
            function Directive() {
                this.template = "<div>Static content...</div>";
            }
            return Directive;
        })();
    })(Directives.Static || (Directives.Static = {}));
    var Static = Directives.Static;

    /**
    * Heading direktíva
    */
    (function (Heading) {
        Heading.Name = "bspHeading";

        function Register(ngModule) {
            ngModule.directive(Heading.Name, [
                function () {
                    return new Directive();
                }
            ]);
        }
        Heading.Register = Register;

        var Directive = (function () {
            function Directive() {
                this.template = "<h1>Heading: {{text}}</h1>";
                /**
                * Isolated scope - text property referencuje hodnotu atribútu priradeného názvu direktívy - data-bsp-heading="Toto je Heading text"
                */
                this.scope = {
                    text: "@" + Heading.Name
                };
            }
            return Directive;
        })();
    })(Directives.Heading || (Directives.Heading = {}));
    var Heading = Directives.Heading;

    /**
    * Direktíva s isolated scope a bindingom cez expression.
    */
    (function (CityCount) {
        CityCount.Name = "bspCityCount";

        function Register(ngModule) {
            ngModule.directive(CityCount.Name, [
                function () {
                    return new Directive();
                }
            ]);
        }
        CityCount.Register = Register;

        var Directive = (function () {
            function Directive() {
                this.template = "<span>{{count}}</span>";
                /**
                * Isolated scope - lokálna property "count" je bindnutá na expression priradenú
                * názvu direktívy, napr.: data-bsp-city-count="vm.cities.length".
                */
                this.scope = {
                    count: "=" + CityCount.Name
                };
            }
            return Directive;
        })();
    })(Directives.CityCount || (Directives.CityCount = {}));
    var CityCount = Directives.CityCount;

    /**
    * Direktíva s link funkciou implementovaná ako class - neodporúčané kvôli problémom s "this"
    * v rámci callbackov.
    */
    (function (CurrentTimeBad) {
        CurrentTimeBad.Name = "bspCurrentTimeBad";

        function Register(ngModule) {
            ngModule.directive(CurrentTimeBad.Name, [
                Globals.AngularIntervalService,
                function (interval) {
                    return new Directive(interval);
                }
            ]);
        }
        CurrentTimeBad.Register = Register;

        var Directive = (function () {
            function Directive(interval) {
                var _this = this;
                this.link = function (scope, element, attrs) {
                    var update = function () {
                        return element.text((new Date()).toLocaleTimeString());
                    };
                    var timerId = _this._interval(function () {
                        return update();
                    }, 1000);

                    update();
                    element.on('$destroy', function () {
                        return _this._interval.cancel(timerId);
                    });
                };
                this._interval = interval;
            }
            Object.defineProperty(Directive.prototype, "template", {
                get: function () {
                    return "<div>...</div>";
                },
                enumerable: true,
                configurable: true
            });
            return Directive;
        })();
    })(Directives.CurrentTimeBad || (Directives.CurrentTimeBad = {}));
    var CurrentTimeBad = Directives.CurrentTimeBad;

    /**
    * Direktíva s link funkciou implementovaná ako class ktorá link funkciu binduje
    * na this. Viac-menej funguje, ale je to tiež neodporúčané, pretože second-level
    * callbacks aj tak musia explicitne capturovať this v outer scope - pozri self
    * premennú v linkImpl funkcii poniže.
    */
    (function (CurrentTimeWithClass) {
        CurrentTimeWithClass.Name = "bspCurrentTimeWithClass";

        function Register(ngModule) {
            ngModule.directive(CurrentTimeWithClass.Name, [
                Globals.AngularIntervalService,
                function (interval) {
                    return new Directive(interval);
                }
            ]);
        }
        CurrentTimeWithClass.Register = Register;

        var Directive = (function () {
            function Directive(_interval) {
                var _this = this;
                this._interval = _interval;
                this.linkImpl = function (scope, element, attrs) {
                    var self = _this;
                    var update = function () {
                        return element.text((new Date()).toLocaleTimeString());
                    };
                    var timerId = self._interval(function () {
                        return update();
                    }, 1000);

                    update();
                    element.on('$destroy', function () {
                        return self._interval.cancel(timerId);
                    });
                };
                this.link = this.linkImpl.bind(this);
            }
            Object.defineProperty(Directive.prototype, "template", {
                get: function () {
                    return "<div>...</div>";
                },
                enumerable: true,
                configurable: true
            });
            return Directive;
        })();
    })(Directives.CurrentTimeWithClass || (Directives.CurrentTimeWithClass = {}));
    var CurrentTimeWithClass = Directives.CurrentTimeWithClass;

    /**
    * Direktíva s link funkciou implementovaná ako funkcia - odporúčané - spoliehame sa na JavaScript closures...
    */
    (function (CurrentTimeWithFunction) {
        CurrentTimeWithFunction.Name = "bspCurrentTimeWithFunction";

        function Register(ngModule) {
            ngModule.directive(CurrentTimeWithFunction.Name, [
                Globals.AngularIntervalService,
                directive
            ]);
        }
        CurrentTimeWithFunction.Register = Register;

        var directive = function (interval) {
            function link(scope, element, attrs) {
                var update = function () {
                    return element.text((new Date()).toLocaleTimeString());
                };
                var timerId = interval(function () {
                    return update();
                }, 1000);

                update();
                element.on('$destroy', function () {
                    return interval.cancel(timerId);
                });
            }

            return {
                template: "<div>...</div>",
                link: link
            };
        };
    })(Directives.CurrentTimeWithFunction || (Directives.CurrentTimeWithFunction = {}));
    var CurrentTimeWithFunction = Directives.CurrentTimeWithFunction;

    /**
    * Direktíva s využitím ampersandu - isolated scope funkcia expressionWrapperFunction vyhodnocuje
    * výraz predaný do direktívy cez data-on-click atribút, napr.:
    *   <div data-bsp-clicker data-on-click="vm.loadCities()"></div>
    */
    (function (Clicker) {
        Clicker.Name = "bspClicker";

        function Register(ngModule) {
            ngModule.directive(Clicker.Name, [
                function () {
                    return new Directive();
                }
            ]);
        }
        Clicker.Register = Register;

        var Directive = (function () {
            function Directive() {
                this.template = "<button ng-click='expressionWrapperFunction()'>Click Me!</button>";
                this.scope = {
                    expressionWrapperFunction: "&onClick"
                };
            }
            return Directive;
        })();
    })(Directives.Clicker || (Directives.Clicker = {}));
    var Clicker = Directives.Clicker;
})(Directives || (Directives = {}));
/// <reference path="../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="globals.ts" />
/// <reference path="data.ts" />
/// <reference path="services.ts" />
/// <reference path="controllers.ts" />
/// <reference path="directives.ts" />
var Main;
(function (Main) {
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
    var setupRoutes = function (routeProvider) {
        var homeRoute = { controller: Controllers.Home.Name, templateUrl: "App/CityListView.html" };
        routeProvider.when("/home", homeRoute);
        routeProvider.otherwise(homeRoute);
    };

    app.config(["$routeProvider", setupRoutes]);
})(Main || (Main = {}));
//# sourceMappingURL=out.js.map
