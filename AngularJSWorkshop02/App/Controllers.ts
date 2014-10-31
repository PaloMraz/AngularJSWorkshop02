/// <reference path="../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="data.ts" />
/// <reference path="globals.ts" />
/// <reference path="services.ts" />

module Controllers {

  /**
   * Angular controller ako TypeScript class - expozuje pole CityInfo objektov, 
   * ktoré loaduje s využitím CityRepository servisu.
   */
  export class Home {

     /**
     * Názov kontroleru pod ktorým ho registrujeme v Angular module.
     */
    static Name = "Controllers.Home";

    /**
     * Metóda úre registráciu kontroleru v danom Angular module.
     */
    static Register(ngModule: ng.IModule) {
      ngModule.controller(Home.Name, [
        Globals.AngularScopeService,
        Services.CityRepository.Name,
        (scope, cityRepositoryService: Services.CityRepository) => new Home(scope, cityRepositoryService)
      ]);
    }

    /**
     * Konštruktor má dependencies explicitne ako parametre - design-time checking.
     */
    constructor($scope, private _cityRepositoryService?: Services.CityRepository) {
      $scope.vm = this;

      // Registrujeme sa u events expozovaných service singletonom, aby sme si vedeli obnoviť údaje
      // aj vtedy, keď sú menené mimo inštancie tohto kontrolera.
      $scope.$on(Services.CityRepository.CitiesLoadedEvent, (event, cities: Data.CityInfo[]) => this.cities = cities);
      $scope.$on(Services.CityRepository.CitiesClearedEvent, () => this.cities = []);
    }


    public loadCities() {
      // Voláme service a v success callbacku si inicializujeme nami expozované dáta - nerobíme
      // kópiu poľa cities, ale priamo referencujeme pole, ktorá nám poskytol service.
      this._cityRepositoryService.loadCities().then(
        (response) => this.cities = response.data,
        (response) => console.log(response.statusText));
    }


    public clearCities() {
      this._cityRepositoryService.clearCities();
    }


    public cities: Data.CityInfo[] = [];


    public isReady(): boolean {
      return this._cityRepositoryService.isReady();
    }
  }
}