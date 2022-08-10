using System;
using System.Threading;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;
using Pomelo.Wow.EventRegistration.Web.Blob;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlobController : ControllerBase
    {
        ILogger<BlobController> _logger;

        public BlobController(ILogger<BlobController> logger)
        {
            _logger = logger;
        }

        [HttpGet("{id:Guid}")]
        public async ValueTask<IActionResult> Get(
            [FromServices] IBlobStorage bs,
            [FromRoute] Guid id)
        {
            var blob = await bs.GetBlobAsync(id);
            if (blob == null)
            {
                return NotFound();
            }

            return File(blob.Stream, blob.ContentType, blob.FileName, true);
        }

        [HttpGet("{id}")]
        public async ValueTask<IActionResult> GetStatic(
            [FromRoute] string id)
        {
            var env = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            var path = Path.Combine(env.WebRootPath, "downloads", id);
            if (!System.IO.File.Exists(path))
            {
                return NotFound();
            }

            return File(new FileStream(path, FileMode.Open, FileAccess.Read), "application/octet-stream", id, true);
        }

        [HttpPost("multi-part")]
        public async ValueTask<ApiResult<Blob.Blob>> PostMP(
            IFormFile file,
            [FromServices] IBlobStorage bs)
        {
            using (var rs = file.OpenReadStream())
            {
                var blob = await bs.SaveBlobAsync(file.FileName, file.ContentType, rs);
                return ApiResult(blob);
            }
        }

        [HttpPost("base64-string")]
        public async ValueTask<ApiResult<Blob.Blob>> PostB64(
            string base64,
            [FromServices] IBlobStorage bs,
            [FromQuery] string contentType = "application/octet-stream",
            [FromQuery] string filename = "unknown",
            CancellationToken cancellationToken = default)
        {
            var bytes = Convert.FromBase64String(base64);
            using (var ms = new MemoryStream(bytes))
            {
                var blob = await bs.SaveBlobAsync(filename, contentType, ms, cancellationToken);
                return ApiResult(blob);
            }
        }
    }
}
