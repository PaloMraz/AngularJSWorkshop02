/// <reference path="data.ts" />
/// <reference path="globals.ts" />

module Services {

  /**
   * Implementácia Angular service ako TypeScript classu.
   */
  export class CityRepository {

    /**
     * Názov servisu pod ktorým ho registrujeme v Angular module.
     */
    static Name = "Services.CityRepository";

    /**
     * Názov eventu, ktorým oznamujeme naloadovanie údajov, ktoré tento servis kešuje.
     */
    static CitiesLoadedEvent = "Services.CityRepository.CitiesLoaded";


    /**
     * Názov eventu, ktorým oznamujeme zahodenie údajov, ktoré tento servis kešuje.
     */
    static CitiesClearedEvent = "Services.CityRepository.CitiesCleared";


    /**
     * Metóda úre registráciu servise v danom Angular module.
     */
    static Register(ngModule: ng.IModule) {
      // Toto je tzv. inline array annotation pre DI - FMI: https://docs.angularjs.org/guide/di
      var registration = [
        Globals.AngularHttpService,
        Globals.AngularQService,
        Globals.AngularRootScopeService,
        (http, q, rootScope: ng.IRootScopeService) => new CityRepository(http, q, rootScope)
      ];
      ngModule.factory(CityRepository.Name, registration);
    }


    /**
     * Konštruktor má dependencies explicitne ako parametre - design-time checking.
     */
    constructor(private _http: ng.IHttpService, private _q: ng.IQService, private _rootScope: ng.IRootScopeService) {
    }


    /**
     * Metóda servisu ktorá volá server vracia vždy promise (buď priamo napr. z volania $http servisu,
     * môže ju aj wrapnúť do vlastného deferred objektu s využitím $q service (https://docs.angularjs.org/api/ng/service/$q).
     */
    public loadCities(): ng.IHttpPromise<Data.CityInfo[]> {
      // Ak máme promise inicializovanú to znamená, že volanie už bolo iniciované (prebieha, alebo
      // už skončilo).
      if (this._promise) {
        return this._promise;
      }

      // Volanie ešte neprebieha - iniciujeme ho.
      this._promise = this._http.get<Data.CityInfo[]>("api/CityRepository/GetAllCities");

      this._promise.success((cities: Data.CityInfo[]) => {
        // Event broadcast cez $rootScope service.
        this._rootScope.$broadcast(CityRepository.CitiesLoadedEvent, cities);
      });
      // Finally callback je volaný vždy (pri úspechu aj chybe).
      this._promise["finally"](() => {
        this._isReady = true;
      });

      // Promise z volania kešujeme, čím kešujeme aj vrátené údaje (teda pri úspešnom volaní :-).
      return this._promise;
    }


    public clearCities(): void {
      // Promise zahodíme, aby nám ho ďalšie volanie loadCities znovu inicializovalu.
      this._promise = undefined;
      this._isReady = false;
      this._rootScope.$broadcast(CityRepository.CitiesClearedEvent);
    }


    public isReady(): boolean {
      return !this._promise || this._isReady;
    }


    private _isReady: boolean = false;
    private _promise: ng.IHttpPromise<Data.CityInfo[]>;
  }

}