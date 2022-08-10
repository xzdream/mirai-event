using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CharactorController : ControllerBase
    {
        ILogger<CharactorController> _logger;

        public CharactorController(ILogger<CharactorController> logger)
        {
            _logger = logger;
        }

        [HttpGet("{realm}/{charactorName}")]
        public async ValueTask<ApiResult<Charactor>> Get(
             [FromServices] WowContext db,
             [FromServices] IConfiguration configuration,
             [FromRoute] string realm,
             [FromRoute] string charactorName,
             CancellationToken cancellationToken = default)
        {
            var charactor = await ActivityController.FetchCharactorAsync(db, _logger, charactorName, realm, Convert.ToInt32(configuration["Partition"]));
            return ApiResult(charactor);
        }

        [HttpPost("batch")]
        public async ValueTask<ApiResult> Post(
            [FromServices] WowContext db,
             [FromServices] IConfiguration configuration,
            [FromBody] BatchUpdateWclRequest request,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult(403, "Permission Denied");
            }

            foreach (var x in request.Names)
            {
                try
                {
                    await ActivityController.FetchCharactorAsync(db, _logger, x, request.Realm, Convert.ToInt32(configuration["Partition"]));
                }
                catch (Exception ex) 
                {
                    _logger.LogError(ex.ToString());
                }
            }

            return ApiResult(200, "Done");
        }
    }
}
