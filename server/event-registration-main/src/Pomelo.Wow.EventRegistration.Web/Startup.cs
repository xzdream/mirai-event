using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Vue;
using Pomelo.Wow.EventRegistration.Authentication;
using Pomelo.Wow.EventRegistration.Web.Blob;
using Pomelo.Wow.MiniProgram;

namespace Pomelo.Wow.EventRegistration.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public static IConfiguration Configuration { get; set; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
                    options.SerializerSettings.DateFormatString = "yyyy'-'MM'-'dd'T'HH':'mm':'ssZ";
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });

            if (Configuration["Database:Engine"] == "SQLite")
            {
                services.AddDbContext<WowContext>(x => x.UseSqlite(Configuration["Database:ConnectionString"]))
                    .AddEntityFrameworkSqlite();
            }
            else if (Configuration["Database:Engine"] == "MySQL")
            {
                services.AddDbContext<WowContext>(x => x.UseMySql(
                    Configuration["Database:ConnectionString"],
                    ServerVersion.AutoDetect(Configuration["Database:ConnectionString"])))
                    .AddEntityFrameworkSqlite();
            }
            else
            {
                throw new NotSupportedException(Configuration["Database:Engine"]);
            }

            services.AddAuthentication(x => x.DefaultScheme = TokenAuthenticateHandler.Scheme)
                .AddPersonalAccessToken();

            services.AddDiskBlobStorage();
            services.AddSingleton(new MpApi(Configuration["MiniProgram:AppId"], Configuration["MiniProgram:AppSecret"]));

            services.AddCors(c => c.AddPolicy("Pomelo", x =>
                x.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader()
            ));
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                scope.ServiceProvider.GetRequiredService<WowContext>().InitAsync().GetAwaiter().GetResult();
            }

            app.UseCors("Pomelo");
            app.UseDeveloperExceptionPage();
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseStaticFiles();

            app.UseVueMiddleware();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
