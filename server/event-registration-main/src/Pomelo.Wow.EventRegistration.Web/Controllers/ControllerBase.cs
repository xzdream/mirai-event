using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public abstract class ControllerBase : Microsoft.AspNetCore.Mvc.ControllerBase
    {

        private Guild guild = null;
        private bool guildNotFound = false;
        private User user = null;

        public string GuildId
        {
            get
            {
                if (!HttpContext.Request.Headers.ContainsKey("Guild"))
                {
                    return null;
                }

                return HttpContext.Request.Headers["Guild"].ToString();
            }
        }

        public Guild Guild
        {
            get
            {
                if (guildNotFound || !HttpContext.Request.Headers.ContainsKey("Guild"))
                {
                    return this.guild;
                }

                var db = HttpContext.RequestServices.GetRequiredService<WowContext>();
                var guildId = HttpContext.Request.Headers["Guild"].ToString();
                var guild = db.Guilds.SingleOrDefault(x => x.Id == guildId);
                if (guild == null)
                {
                    guildNotFound = true;
                    return guild;
                }

                this.guild = guild;
                return guild;
            }
        }

        public User CurrentUser
        {
            get 
            {
                if (user == null)
                {
                    if (!User.Identity.IsAuthenticated)
                    {
                        return null;
                    }

                    var db = HttpContext.RequestServices.GetRequiredService<WowContext>();
                    var id = Convert.ToInt32(User.Identity.Name);
                    user = db.Users.Single(x => x.Id == id);
                }

                return user;
            }
        }

        public bool IsWeChatUser => CurrentUser != null && CurrentUser.WxOpenId != null;

        protected async ValueTask<bool> ValidateUserPermissionToCurrentGuildAsync(
            WowContext db,
            string guildId = null,
            bool isOwner = false,
            CancellationToken cancellationToken = default)
        {
            if (guildId == null)
            {
                guildId = GuildId;
            }

            if (!User.Identity.IsAuthenticated)
            {
                return false;
            }

            if (CurrentUser.Role == UserRole.Admin)
            {
                return true;
            }

            if (GuildId == null)
            {
                return false;
            }

            var userId = Convert.ToInt32(User.Identity.Name);
            if (isOwner)
            {
                return Guild.UserId == userId;
            }

            return Guild.UserId == userId || await db.GuildManagers.AnyAsync(x => x.GuildId == GuildId && x.UserId == userId, cancellationToken);
        }
        protected ApiResult ApiResult(int code = 200, string message = null)
        {
            message = message ?? "Succeeded";
            Response.StatusCode = code;
            return new ApiResult
            {
                Code = code,
                Message = message
            };
        }

        protected ApiResult<T> ApiResult<T>(T data)
        {
            return new ApiResult<T>
            {
                Code = 200,
                Message = "Succeeded",
                Data = data
            };
        }

        protected ApiResult<T> ApiResult<T>(int code = 200, string message = null)
        {
            message = message ?? "Succeeded";
            Response.StatusCode = code;
            return new ApiResult<T>
            {
                Code = code,
                Message = message
            };
        }

        protected PagedApiResult PagedApiResult(int code = 200, string message = null)
        {
            message = message ?? "Succeeded";
            Response.StatusCode = code;
            return new PagedApiResult
            {
                Code = code,
                Message = message
            };
        }

        protected async ValueTask<PagedApiResult<T>> PagedApiResultAsync<T>(
            IQueryable<T> data,
            int currentPage,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            var totalRecords = await data.CountAsync(cancellationToken);
            data = data.Skip(currentPage * pageSize).Take(pageSize);

            return new PagedApiResult<T>
            {
                Code = 200,
                Message = "Succeeded",
                Data = await data.ToListAsync(cancellationToken),
                CurrentPage = currentPage,
                PageSize = pageSize,
                TotalRecords = totalRecords,
                TotalPages = (totalRecords + pageSize - 1) / pageSize
            };
        }

        protected PagedApiResult<T> PagedApiResult<T>(int code = 200, string message = null)
        {
            message = message ?? "Succeeded";
            Response.StatusCode = code;
            return new PagedApiResult<T>
            {
                Code = code,
                Message = message
            };
        }
    }
}
