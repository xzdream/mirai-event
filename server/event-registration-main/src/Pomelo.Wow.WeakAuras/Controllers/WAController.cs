using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Pomelo.Wow.WeakAuras.Models;

namespace Pomelo.Wow.WeakAuras.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WAController : ControllerBase
    {
        [HttpPost("encode")]
        public async ValueTask<string> PostEncode(
            [FromServices] IConfiguration configuration, 
            CancellationToken cancellationToken = default)
        {
            string weaktable = "";
            using (var sr = new StreamReader(Request.Body))
            {
                weaktable = await sr.ReadToEndAsync();
            }

            return await EncodeAsync(weaktable, configuration["LUA"], cancellationToken);
        }


        [HttpPost("decode")]
        public async ValueTask<string> PostDecode(
            [FromServices] IConfiguration configuration,
            CancellationToken cancellationToken = default)
        {
            string waString = "";
            using (var sr = new StreamReader(Request.Body))
            {
                waString = await sr.ReadToEndAsync();
            }

            return await DecodeAsync(waString, configuration["LUA"], cancellationToken);
        }

        [HttpGet("templates")]
        public async ValueTask<IEnumerable<WeakAurasTemplateSummary>> GetTemplates(
            CancellationToken cancellationToken = default)
        {
            return await GetTemplatesAsync(cancellationToken)
                .ToListAsync(cancellationToken);
        }

        [HttpPost("templates/{id}")]
        public async ValueTask<string> PostWA(
            [FromServices] IConfiguration configuration,
            string id,
            [FromBody] GetWeakAurasInstanceRequest request,
            CancellationToken cancellationToken = default)
        {
            var str = await CreateWeakAurasStringAsync(id, request.Arguments, cancellationToken);
            var encoded = await EncodeAsync(str, configuration["LUA"], cancellationToken);
            return encoded;
        }

        #region Internal Functions
        internal static async ValueTask<string> EncodeAsync(
            string weakTableString,
            string luaExePath,
            CancellationToken cancellationToken = default)
        {
            if (!Directory.Exists("Temp"))
            {
                Directory.CreateDirectory("Temp");
            }

            var id = Guid.NewGuid();
            var weakTablePath = Path.Combine("Temp", $"{id}.lua");
            var waStringPath = Path.Combine("Temp", $"{id}.wa");
            await System.IO.File.WriteAllTextAsync(weakTablePath, weakTableString, cancellationToken);
            using (var process = new Process())
            {
                process.StartInfo = new ProcessStartInfo
                {
                    UseShellExecute = false,
                    FileName = luaExePath,
                    Arguments = $"wa_encode.lua {weakTablePath} {waStringPath}",
                    CreateNoWindow = true
                };

                process.Start();
                if (!process.WaitForExit(5000))
                {
                    process.Kill();
                    return "Time out";
                }

                if (!System.IO.File.Exists(waStringPath) || process.ExitCode != 0)
                {
                    if (System.IO.File.Exists(weakTablePath))
                    {
                        System.IO.File.Delete(weakTablePath);
                    }

                    return null;
                }

                var ret = await System.IO.File.ReadAllTextAsync(waStringPath, cancellationToken);

                if (System.IO.File.Exists(waStringPath))
                {
                    System.IO.File.Delete(waStringPath);
                }

                if (System.IO.File.Exists(weakTablePath))
                {
                    System.IO.File.Delete(weakTablePath);
                }

                return ret;
            }
        }

        internal static async ValueTask<string> DecodeAsync(
            string weakAurasString,
            string luaExePath,
            CancellationToken cancellationToken = default)
        {
            if (!Directory.Exists("Temp"))
            {
                Directory.CreateDirectory("Temp");
            }

            var id = Guid.NewGuid();
            var waStringPath = Path.Combine("Temp", $"{id}.wa");
            var weakTablePath = Path.Combine("Temp", $"{id}.lua");
            await System.IO.File.WriteAllTextAsync(waStringPath, weakAurasString, cancellationToken);
            using (var process = new Process())
            {
                process.StartInfo = new ProcessStartInfo
                {
                    UseShellExecute = false,
                    FileName = luaExePath,
                    Arguments = $"wa_decode.lua {waStringPath} {weakTablePath}",
                    CreateNoWindow = true
                };
                process.Start();
                process.WaitForExit();
                if (!System.IO.File.Exists(weakTablePath) || process.ExitCode != 0)
                {
                    if (System.IO.File.Exists(waStringPath))
                    {
                        System.IO.File.Delete(waStringPath);
                    }
                    return null;
                }

                var ret = await System.IO.File.ReadAllTextAsync(weakTablePath, cancellationToken);

                if (System.IO.File.Exists(waStringPath))
                {
                    System.IO.File.Delete(waStringPath);
                }

                if (System.IO.File.Exists(weakTablePath))
                {
                    System.IO.File.Delete(weakTablePath);
                }

                return ret.Replace("\\\\\\", "\\").Replace("\\\\", "\\");
            }
        }

        internal static async ValueTask<string> CreateWeakAurasStringAsync(
            string templateId, 
            IEnumerable<GetWeakAurasInstanceRequestArgument> arguments = null,
            CancellationToken cancellationToken = default)
        {
            var metadataPath = Path.Combine("WATemplates", templateId + ".json");
            var templatePath = Path.Combine("WATemplates", templateId + ".lua");
            if (!System.IO.File.Exists(metadataPath) || !System.IO.File.Exists(templatePath))
            {
                return null;
            }

            var template = await System.IO.File.ReadAllTextAsync(templatePath, cancellationToken);
            var metadata = JsonConvert.DeserializeObject<WeakAurasTemplateMetadata>(await System.IO.File.ReadAllTextAsync(metadataPath, cancellationToken));
            foreach (var arg in metadata.Arguments)
            {
                if (arguments != null)
                {
                    var patch = arguments.SingleOrDefault(x => x.Key == arg.Key);
                    if (patch != null)
                    {
                        template = template.Replace($"<{patch.Key}>", patch.Value);
                        continue;
                    }

                    template = template.Replace($"<{arg.Key}>", arg.Default);
                }
            }

            return template;
        }

        internal static async IAsyncEnumerable<WeakAurasTemplateSummary> GetTemplatesAsync(
            CancellationToken cancellationToken = default)
        {
            foreach (var file in Directory.EnumerateFiles("WATemplates", "*.json"))
            {
                WeakAurasTemplateSummary template = null;

                try
                {
                    template = JsonConvert.DeserializeObject<WeakAurasTemplateSummary>(await System.IO.File.ReadAllTextAsync(file, cancellationToken));
                }
                catch { }

                if (template != null)
                {
                    yield return template;
                }
            }
        }
        #endregion
    }
}
