using Newtonsoft.Json;

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace AngularJSWorkshop02.Controllers
{
  public class CityRepositoryController : ApiController
  {
    public async Task<List<CityInfo>> GetAllCities()
    {
      await Task.Delay(1200);

      string jsonPath = HttpContext.Current.Server.MapPath("~/Data/cities_with_countries.txt");
      string json = File.ReadAllText(jsonPath);
      var result = JsonConvert.DeserializeObject<List<CityInfo>>(json);
      return result;
    }
  }
}
