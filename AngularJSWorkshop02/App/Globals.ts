/**
 * Globálne konštanty - best practice, aby sme nemali rovnaké stringové literály kde kade (DRY).
 */
module Globals {
  export var AngularAppModuleName = "app";
  export var AngularHttpService = "$http";
  export var AngularQService = "$q";
  export var AngularRootScopeService = "$rootScope";
  export var AngularScopeService = "$scope";
  export var AngularIntervalService = "$interval";
  // ... 
} 