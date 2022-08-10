using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Pomelo.Wow.EventRegistration.Web.Vue
{
    public class VueMiddleware
    {
        private readonly RequestDelegate _next;

        public VueMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            var env = httpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            var path = Path.Combine(env.WebRootPath, httpContext.Request.Path.ToString().Split('?')[0].Trim('/'));
            if (File.Exists(path + ".html") || File.Exists(path + "/index.html") || File.Exists(path + ".m.html") || File.Exists(path + "/index.m.html") || File.Exists(path + "/main.html"))
            {
                httpContext.Response.StatusCode = 200;
                httpContext.Response.ContentType = "text/html";
                if (File.Exists(path + ".html") && path.Substring(env.WebRootPath.Length).Trim('/').IndexOf('/') == -1)
                {
                    await httpContext.Response.WriteAsync(File.ReadAllText(path + ".html"));
                }
                else if (File.Exists(path + ".m.html") && path.Substring(env.WebRootPath.Length).Trim('/').IndexOf('/') == -1)
                {
                    await httpContext.Response.WriteAsync(File.ReadAllText(path + ".m.html"));
                }
                else
                {
                    await httpContext.Response.WriteAsync(File.ReadAllText(Path.Combine(env.WebRootPath, "main.html")));
                }
                await httpContext.Response.CompleteAsync();
                httpContext.Response.Body.Close();
                return;
            }
            await _next(httpContext);
        }
    }

    public static class VueMiddlewareExtensions
    {
        public static IApplicationBuilder UseVueMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<VueMiddleware>();
        }
    }
}
