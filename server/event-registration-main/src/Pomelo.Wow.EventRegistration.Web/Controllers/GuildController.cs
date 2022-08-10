using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pomelo.Wow.MiniProgram;
using Pomelo.Wow.EventRegistration.Web.Blob;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GuildController : ControllerBase
    {
        ILogger<UserController> _logger;
        static Regex guildDomainRegex = new Regex("^[0-9a-zA-Z-_]{4,16}$");

        public GuildController(ILogger<UserController> logger)
        {
            _logger = logger;
        }

        #region Common
        [HttpGet]
        public async ValueTask<PagedApiResult<Guild>> Get(
            [FromServices] WowContext db,
            [FromQuery] string name = null,
            [FromQuery] int pageSize = 60,
            [FromQuery] int page = 1,
            CancellationToken cancellationToken = default)
        {
            if (pageSize > 100)
            {
                pageSize = 100;
            }

            IQueryable<Guild> query = db.Guilds;

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(x => x.Name.Contains(name));
            }

            return await PagedApiResultAsync(
                query.OrderByDescending(x => x.Points),
                page - 1,
                pageSize,
                cancellationToken);
        }

        [HttpGet("my")]
        public async ValueTask<ApiResult<List<Guild>>> GetMy(
            [FromServices] WowContext db,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult<List<Guild>>(401, "Unauthorized");
            }

            var uid = Convert.ToInt32(User.Identity.Name);
            var guilds = await db.GuildManagers
                .Include(x => x.Guild)
                .Where(x => x.UserId == uid)
                .Select(x => x.Guild)
                .ToListAsync(cancellationToken);

            return ApiResult(guilds);
        }

        [HttpGet("{id}")]
        public async ValueTask<ApiResult<Guild>> Get(
            [FromServices] WowContext db,
            [FromRoute] string id,
            CancellationToken cancellationToken = default)
        {
            var guild = await db.Guilds.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (guild == null)
            {
                return ApiResult<Guild>(404, "没有找到指定的公会");
            }

            return ApiResult(guild);
        }

        [HttpPost]
        public async ValueTask<ApiResult<Guild>> Post(
            [FromServices] WowContext db,
            [FromBody] Guild guild,
            CancellationToken cancellationToken = default)
        { 
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult<Guild>(401, "请登录");
            }

            if (await db.Guilds.AnyAsync(x => x.Id == guild.Id, cancellationToken))
            {
                return ApiResult<Guild>(400, $"公会ID {guild.Id} 已经存在，请更换后再试");
            }

            if (!guildDomainRegex.IsMatch(guild.Id))
            {
                return ApiResult<Guild>(400, "公会ID不合法");
            }

            guild.UserId = Convert.ToInt32(User.Identity.Name);
            guild.Managers.Add(new GuildManager 
            {
                UserId = guild.UserId
            });
            db.Guilds.Add(guild);
            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(guild);
        }

        [HttpPut("{guildId}")]
        [HttpPatch("{guildId}")]
        public async ValueTask<ApiResult<Guild>> Patch(
            [FromServices] WowContext db,
            [FromRoute] string guildId,
            [FromBody] Guild model,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult<Guild>(401, "请登录");
            }

            if (GuildId == null)
            {
                return ApiResult<Guild>(400, "请在公会中进行该操作");
            }

            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, true, cancellationToken))
            {
                return ApiResult<Guild>(403, "您没有权限这样做");
            }

            if (guildId != GuildId)
            {
                return ApiResult<Guild>(400, "请在正确的公会中进行该操作");
            }

            if (!string.IsNullOrEmpty(model.GuildLogoUrl))
            {
                Guild.GuildLogoUrl = model.GuildLogoUrl;
            }
            if (!string.IsNullOrEmpty(model.GuildListImageUrl))
            {
                Guild.GuildListImageUrl = model.GuildListImageUrl;
            }
            if (!string.IsNullOrEmpty(model.Name))
            {
                Guild.Name = model.Name;
            }
            if (!string.IsNullOrEmpty(model.Description))
            {
                Guild.Description = model.Description;
            }
            if (!string.IsNullOrEmpty(model.Realm))
            {
                Guild.Realm = model.Realm;
            }

            await db.SaveChangesAsync(cancellationToken);
            return ApiResult(Guild);
        }


        [HttpPut("{guildId}/reg-policy")]
        [HttpPatch("{guildId}/reg-policy")]
        public async ValueTask<ApiResult<Guild>> PatchRegPolicy(
            [FromServices] WowContext db,
            [FromBody] PatchRegisterPolicyRequest request,
            [FromRoute] string guildId,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult<Guild>(401, "请登录");
            }

            if (GuildId == null)
            {
                return ApiResult<Guild>(400, "请在公会中进行该操作");
            }

            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, true, cancellationToken))
            {
                return ApiResult<Guild>(403, "您没有权限这样做");
            }

            if (guildId != GuildId)
            {
                return ApiResult<Guild>(400, "请在正确的公会中进行该操作");
            }

            Guild.RegisterPolicy = request.RegisterPolicy;
            await db.SaveChangesAsync(cancellationToken);
            return ApiResult(Guild);
        }

        [HttpGet("{guildId}/manager")]
        public async ValueTask<ApiResult<List<GuildManagerResponse>>> GetManagers(
            [FromServices] WowContext db,
            [FromRoute] string guildId,
            CancellationToken cancellationToken = default)
        {
            var managers = await db.GuildManagers
                .Include(x => x.User)
                .Where(x => x.GuildId == guildId)
                .Select(x => new GuildManagerResponse
                {
                    Username = x.User.Username,
                    DisplayName = x.User.DisplayName
                })
                .ToListAsync(cancellationToken);

            return ApiResult(managers);
        }

        [HttpPut("{guildId}/manager/{username}")]
        public async ValueTask<ApiResult> Put(
            [FromServices] WowContext db,
            [FromRoute] string username,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult(401, "请登录");
            }

            if (GuildId == null)
            {
                return ApiResult(400, "请在公会中进行该操作");
            }

            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, true, cancellationToken))
            {
                return ApiResult(403, "您没有权限这样做");
            }

            var user = await db.Users.SingleOrDefaultAsync(x => x.Username == username, cancellationToken);
            if (user == null)
            {
                return ApiResult(400, "指定的用户不存在");
            }

            if (!await db.GuildManagers.AnyAsync(x => x.GuildId == GuildId && x.UserId == user.Id))
            {
                db.GuildManagers.Add(new GuildManager
                {
                    GuildId = GuildId,
                    UserId = user.Id
                });
                await db.SaveChangesAsync(cancellationToken);
            }

            return ApiResult(200, $"已将{username}添加为公会管理员");
        }

        [HttpDelete("{guildId}/manager/{username}")]
        public async ValueTask<ApiResult> Delete(
            [FromServices] WowContext db,
            [FromRoute] string username,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult(401, "请登录");
            }

            if (GuildId == null)
            {
                return ApiResult(400, "请在公会中进行该操作");
            }

            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, true, cancellationToken))
            {
                return ApiResult(403, "您没有权限这样做");
            }

            var manager = await db.GuildManagers.SingleOrDefaultAsync(x => x.GuildId == GuildId && x.User.Username == username, cancellationToken);
            if (manager == null)
            {
                return ApiResult(404, "指定的管理员不存在");
            }

            db.GuildManagers.Remove(manager);
            await db.SaveChangesAsync(cancellationToken);
            return ApiResult(200, $"已移除管理员{username}");
        }
        #endregion

        #region Price
        [HttpGet("{guildId}/price")]
        public async ValueTask<ApiResult<List<PriceResponse>>> GetPrices(
            [FromServices] WowContext db,
            [FromRoute] string guildId,
            CancellationToken cancellationToken = default)
        {
            var prices = await db.Prices
                .Where(x => x.GuildId == guildId)
                .Select(x => new PriceResponse 
                {
                    CreatedAt = x.CreatedAt,
                    Id = x.Id,
                    Name = x.Name
                })
                .ToListAsync(cancellationToken);

            return ApiResult(prices);
        }

        [HttpGet("{guildId}/price/{id:Guid}")]
        public async ValueTask<ApiResult<Price>> GetPrice(
            [FromServices] WowContext db,
            [FromRoute] Guid id,
            [FromRoute] string guildId,
            CancellationToken cancellationToken = default)
        {
            var price = await db.Prices
                .Where(x => x.GuildId == guildId && x.Id == id)
                .SingleOrDefaultAsync(cancellationToken);

            if (price == null)
            {
                return ApiResult<Price>(404, "没有找到这个价目表");
            }

            return ApiResult(price);
        }

        [HttpPost("{guildId}/price")]
        public async ValueTask<ApiResult<Price>> PostPrice(
            [FromServices] WowContext db,
            [FromRoute] string guildId,
            [FromBody] Price price,
            CancellationToken cancellationToken = default)
        {
            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, false, cancellationToken))
            {
                return ApiResult<Price>(403, "您没有权限这样做");
            }

            price.GuildId = GuildId;
            db.Prices.Add(price);
            await db.SaveChangesAsync(cancellationToken);
            return ApiResult(price);
        }

        [HttpPut("{guildId}/price/{id:Guid}")]
        [HttpPatch("{guildId}/price/{id:Guid}")]
        public async ValueTask<ApiResult<Price>> PatchPrice(
            [FromServices] WowContext db,
            [FromRoute] Guid id,
            [FromRoute] string guildId,
            [FromBody] Price model,
            CancellationToken cancellationToken = default)
        {
            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, false, cancellationToken))
            {
                return ApiResult<Price>(403, "您没有权限这样做");
            }

            var price = await db.Prices
                .Where(x => x.GuildId == guildId && x.Id == id)
                .SingleOrDefaultAsync(cancellationToken);

            if (price == null)
            {
                return ApiResult<Price>(404, "没有找到这个价目表");
            }

            price.Name = model.Name;
            price.Data = model.Data;
            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(price);
        }

        [HttpDelete("{guildId}/price/{id:Guid}")]
        public async ValueTask<ApiResult> DeletePrice(
            [FromServices] WowContext db,
            [FromRoute] Guid id,
            [FromRoute] string guildId,
            [FromBody] Price model,
            CancellationToken cancellationToken = default)
        {
            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, false, cancellationToken))
            {
                return ApiResult(403, "您没有权限这样做");
            }

            var price = await db.Prices
                .Where(x => x.GuildId == guildId && x.Id == id)
                .SingleOrDefaultAsync(cancellationToken);

            if (price == null)
            {
                return ApiResult(404, "没有找到这个价目表");
            }

            db.Prices.Remove(price);
            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(200, "已删除价目表");
        }
        #endregion

        #region Variables
        [HttpGet("{guildId}/var/{key}")]
        public async ValueTask<ApiResult<GuildVariable>> GetVariable(
            [FromServices] WowContext db,
            [FromRoute] string guildId,
            [FromRoute] string key,
            CancellationToken cancellationToken = default)
        {
            var variable = await db.GuildVariables.SingleOrDefaultAsync(x => x.GuildId == guildId && x.Key == key, cancellationToken);
            if (variable == null)
            {
                return ApiResult<GuildVariable>(404, "没有找到变量");
            }

            return ApiResult(variable);
        }

        [HttpPut("{guildId}/var/{key}")]
        [HttpPost("{guildId}/var/{key}")]
        [HttpPatch("{guildId}/var/{key}")]
        public async ValueTask<ApiResult<GuildVariable>> PutVariable(
            [FromServices] WowContext db,
            [FromRoute] string guildId,
            [FromRoute] string key,
            [FromBody] GuildVariable variable,
            CancellationToken cancellationToken = default)
        {
            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, false, cancellationToken))
            {
                return ApiResult<GuildVariable>(403, "您没有权限这样做");
            }

            variable.GuildId = guildId;
            variable.Key = key;

            var _variable = await db.GuildVariables.SingleOrDefaultAsync(x => x.GuildId == guildId && x.Key == key, cancellationToken);
            if (_variable == null)
            {
                db.GuildVariables.Add(variable);
            }
            else
            {
                _variable.Value = variable.Value;
            }

            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(variable);
        }
        #endregion

        #region Mini Program
        [HttpGet("{guildId}/miniprogram-qrcode.png")]
        public async ValueTask<IActionResult> GetMiniProgramQrCode(
            [FromServices] WowContext db,
            [FromServices] IBlobStorage bs,
            [FromServices] MpApi mp,
            [FromRoute] string guildId,
            CancellationToken cancellationToken = default)
        {
            var guild = await db.Guilds.SingleOrDefaultAsync(x => x.Id == guildId, cancellationToken);
            if (guild == null)
            {
                return NotFound();
            }

            if (guild.GuildMiniProgramImageId == null) 
            {
                var bytes = await mp.GenerateMiniProgramQrCodeAsync("pages/guild", guild.Id, cancellationToken);
                using (var ms = new MemoryStream(bytes))
                {
                    var blob = await bs.SaveBlobAsync($"{guild.Id}-mp.png", "image/png", ms, cancellationToken);
                    guild.GuildMiniProgramImageId = blob.Id;
                    await db.SaveChangesAsync(cancellationToken);
                }
            }

            var ret = await bs.GetBlobAsync(guild.GuildMiniProgramImageId.Value, cancellationToken);
            return File(ret.Stream, "image/png", true);
        }
        #endregion

        #region Members
        [HttpGet("{guildId}/members")]
        public async ValueTask<ApiResult<List<GuildMemberViewModel>>> GetMembers(
            [FromServices] WowContext db,
            [FromRoute] string guildId,
            int days = 30,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(guildId))
            {
                return ApiResult<List<GuildMemberViewModel>>(400, "缺少公会ID");
            }

            if (days > 365)
            {
                days = 365;
            }

            var now = DateTime.UtcNow;
            var from = now.AddDays(-days);
            var ret = (await db.Registrations
                .Where(x => !string.IsNullOrEmpty(x.WxOpenId) && !string.IsNullOrEmpty(x.WeChat))
                .Where(x => x.RegisteredAt >= from && x.RegisteredAt < now)
                .Where(x => x.Activity.GuildId == guildId)
                .Where(x => x.Status != RegistrationStatus.Leave && x.Status != RegistrationStatus.Rejected)
                .OrderBy(x => x.RegisteredAt)
                .ToListAsync(cancellationToken))
                .GroupBy(x => x.WxOpenId)
                .Select(x => new GuildMemberViewModel
                {
                    Nickname = x.Last(y => y.WxOpenId == x.Key).WeChat,
                    Attend = x.Count(),
                    AvatarUrl = x.Last(y => y.WxOpenId == x.Key).AvatarUrl,
                    Charactors = x.GroupBy(x => x.Name)
                        .Select(y => new GuildMemberCharactorViewModel { Name = y.First().Name, Class = y.First().Class, Attend = y.Count() })
                        .OrderByDescending(y => y.Attend)
                        .ToList()
                })
                .OrderByDescending(x => x.Attend)
                .ToList();

            return ApiResult(ret);
        }
        #endregion
    }
}
