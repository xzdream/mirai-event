using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RaidController : ControllerBase
    {
        ILogger<RaidController> _logger;

        public RaidController(ILogger<RaidController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public async ValueTask<ApiResult<List<Raid>>> Get(
            [FromServices] WowContext db,
            CancellationToken cancellationToken = default)
        {
            var raids = await db.Raids
                .OrderByDescending(x =>x.Phase)
                .ThenByDescending(x => x.Priority)
                .ToListAsync(cancellationToken);
            return ApiResult(raids);
        }
    }
}
