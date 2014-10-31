/// <reference path="../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="globals.ts" />

module Directives {

  /**
   * Statická direktíva - nie je nijako parametrizovaná.
   */
  export module Static {

    export var Name = "bspStatic"; // v HTML je to data-bsp-static


    export function Register(ngModule: ng.IModule) {
      ngModule.directive(Name, [
        () => new Directive()
      ]);
    }


    class Directive implements ng.IDirective {
      constructor() {
      }

      public template = "<div>Static content...</div>";
    }
  }


  /**
   * Heading direktíva
   */
  export module Heading {

    export var Name = "bspHeading"; // data-bsp-heading="Heading text"

    export function Register(ngModule: ng.IModule) {
      ngModule.directive(Name, [
        () => new Directive()
      ]);
    }

    class Directive implements ng.IDirective {

      public template = "<h1>Heading: {{text}}</h1>"; // inline template - binding na scope property

      /**
       * Isolated scope - text property referencuje hodnotu atribútu priradeného názvu direktívy - data-bsp-heading="Toto je Heading text"
       */
      public scope = {
        text: "@" + Name
      };
    }
  }


  /**
   * Direktíva s isolated scope a bindingom cez expression.
   */
  export module CityCount {
    export var Name = "bspCityCount"; // data-bsp-city-count

    export function Register(ngModule: ng.IModule) {
      ngModule.directive(Name, [
        () => new Directive()
      ]);
    }


    class Directive implements ng.IDirective {
      public template = "<span>{{count}}</span>";

      /**
       * Isolated scope - lokálna property "count" je bindnutá na expression priradenú
       * názvu direktívy, napr.: data-bsp-city-count="vm.cities.length".
       */
      public scope = {
        count: "=" + Name
      };
    }
  }



  /**
   * Direktíva s link funkciou implementovaná ako class - neodporúčané kvôli problémom s "this"
   * v rámci callbackov.
   */
  export module CurrentTimeBad {

    export var Name = "bspCurrentTimeBad";


    export function Register(ngModule: ng.IModule) {
      ngModule.directive(Name, [
        Globals.AngularIntervalService,
        (interval: ng.IIntervalService) => new Directive(interval)
      ]);
    }


    class Directive implements ng.IDirective {

      private _interval: ng.IIntervalService;

      constructor(interval: ng.IIntervalService) {
        this._interval = interval;
      }

      public get template(): string {
        return "<div>...</div>";
      }

      public link = (scope, element: JQuery, attrs) => {
        var update = () => element.text((new Date()).toLocaleTimeString());
        var timerId = this._interval(() => update(), 1000);

        update();
        element.on('$destroy', () => this._interval.cancel(timerId));
      }
    }
  }


   /**
   * Direktíva s link funkciou implementovaná ako class ktorá link funkciu binduje
   * na this. Viac-menej funguje, ale je to tiež neodporúčané, pretože second-level
   * callbacks aj tak musia explicitne capturovať this v outer scope - pozri self
   * premennú v linkImpl funkcii poniže.
   */
  export module CurrentTimeWithClass {

    export var Name = "bspCurrentTimeWithClass";


    export function Register(ngModule: ng.IModule) {
      ngModule.directive(Name, [
        Globals.AngularIntervalService,
        (interval) => new Directive(interval)
      ]);
    }


    class Directive implements ng.IDirective {

      constructor(private _interval: ng.IIntervalService) {
        this.link = this.linkImpl.bind(this);
      }

      public link: any;

      public get template(): string {
        return "<div>...</div>";
      }

      private linkImpl = (scope, element: JQuery, attrs) => {
        var self = this;
        var update = () => element.text((new Date()).toLocaleTimeString());
        var timerId = self._interval(() => update(), 1000);

        update();
        element.on('$destroy', () => self._interval.cancel(timerId));
      }
    }
  }


  /**
   * Direktíva s link funkciou implementovaná ako funkcia - odporúčané - spoliehame sa na JavaScript closures...
   */
  export module CurrentTimeWithFunction {

    export var Name = "bspCurrentTimeWithFunction";


    export function Register(ngModule: ng.IModule) {
      ngModule.directive(Name, [
        Globals.AngularIntervalService,
        directive
      ]);
    }

    var directive = function (interval: ng.IIntervalService) {
      function link(scope, element: JQuery, attrs) {
        var update = () => element.text((new Date()).toLocaleTimeString());
        var timerId = interval(() => update(), 1000);

        update();
        element.on('$destroy', () => interval.cancel(timerId));
      }

      return {
        template: "<div>...</div>",
        link: link
      };
    }
  }


   /**
   * Direktíva s využitím ampersandu - isolated scope funkcia expressionWrapperFunction vyhodnocuje
   * výraz predaný do direktívy cez data-on-click atribút, napr.:
   *   <div data-bsp-clicker data-on-click="vm.loadCities()"></div>
   */
  export module Clicker {
    export var Name = "bspClicker"; // data-bsp-clicker

    export function Register(ngModule: ng.IModule) {
      ngModule.directive(Name, [
        () => new Directive()
      ]);
    }

    class Directive implements ng.IDirective {
      public template = "<button ng-click='expressionWrapperFunction()'>Click Me!</button>";

      public scope = {
        expressionWrapperFunction: "&onClick"
      };
    }
  }
  
}