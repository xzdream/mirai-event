using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Pomelo.Wow.EventRegistration.Web.Blob;
using Pomelo.Wow.EventRegistration.WCL;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;
using Pomelo.Wow.MiniProgram;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivityController : ControllerBase
    {
        ILogger<ActivityController> _logger;

        public ActivityController(ILogger<ActivityController> logger)
        {
            _logger = logger;
        }

        #region Basics
        [HttpGet]
        public async ValueTask<PagedApiResult<ActivityViewModel>> Get(
            [FromServices] WowContext db,
            [FromQuery] int pageSize = 10,
            [FromQuery] int page = 1,
            [FromQuery] ActivityStatus status = ActivityStatus.All,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken cancellationToken = default)
        { 
            if (pageSize > 100)
            {
                pageSize = 100;
            }

            IQueryable<Activity> query = db.Activities
                .Include(x => x.Registrations)
                .Include(x => x.User)
                .Include(x => x.Guild);

            if (GuildId != null)
            {
                var union = db.UnionActivities
                    .Where(y => y.GuildId == GuildId)
                    .Select(y => y.ActivityId);

                query = query.Where(x => union.Contains(x.Id) 
                    || x.GuildId == GuildId);
            }

            if (from.HasValue)
            {
                query = query.Where(x => x.Begin >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(x => x.Begin < to.Value);
            }

            if (status == ActivityStatus.Registering)
            {
                query = query.Where(x => x.Deadline >= DateTime.UtcNow);
            }
            else if (status == ActivityStatus.RegistrationClosed)
            {
                query = query.Where(x => x.Deadline < DateTime.UtcNow && x.Begin > DateTime.UtcNow);
            }
            else if (status == ActivityStatus.InProgress)
            {
                query = query.Where(x => x.Begin <= DateTime.UtcNow && x.Begin.AddHours(x.EstimatedDurationInHours) > DateTime.UtcNow);
            }
            else if (status == ActivityStatus.Ended)
            {
                query = query.Where(x => x.Begin.AddHours(x.EstimatedDurationInHours) < DateTime.UtcNow);
            }

            if (status == ActivityStatus.InProgress || status == ActivityStatus.Registering)
            {
                return await PagedApiResultAsync(
                    query.OrderBy(x => x.Begin).Select(x => new ActivityViewModel
                    {
                        Begin = x.Begin,
                        Server = x.Server,
                        CreatedAt = x.CreatedAt,
                        Deadline = x.Deadline,
                        Description = x.Description,
                        EstimatedDurationInHours = x.EstimatedDurationInHours,
                        GuildId = x.GuildId,
                        GuildName = x.Guild.Name,
                        Name = x.Name,
                        RaidLeader = x.User.DisplayName,
                        Realm = x.Realm,
                        Raids = x.Raids,
                        RegisteredCount = x.Registrations.Count(),
                        Visibility = x.Visibility,
                        Faction = x.Guild.Faction,
                        Id = x.Id
                    }),
                    page - 1,
                    pageSize,
                    cancellationToken);
            }
            else
            {
                return await PagedApiResultAsync(
                    query.OrderByDescending(x => x.Begin).Select(x => new ActivityViewModel
                    {
                        Begin = x.Begin,
                        Server = x.Server,
                        CreatedAt = x.CreatedAt,
                        Deadline = x.Deadline,
                        Description = x.Description,
                        EstimatedDurationInHours = x.EstimatedDurationInHours,
                        GuildId = x.GuildId,
                        GuildName = x.Guild.Name,
                        Name = x.Name,
                        RaidLeader = x.User.DisplayName,
                        Realm = x.Realm,
                        Raids = x.Raids,
                        RegisteredCount = x.Registrations.Count(),
                        Visibility = x.Visibility,
                        Faction = x.Guild.Faction,
                        Id = x.Id
                    }),
                    page - 1,
                    pageSize,
                    cancellationToken);
            }
        }

        [HttpGet("{id:long}")]
        public async ValueTask<ApiResult<Activity>> Get(
            [FromServices] WowContext db,
            [FromRoute] long id, 
            CancellationToken cancellationToken = default)
        {
            var activity = await db.Activities
                .Include(x => x.User)
                .Include(x => x.Registrations)
                .ThenInclude(x => x.Charactor)
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (activity == null)
            {
                return ApiResult<Activity>(404, "没有找到指定的活动");
            }

            activity.Registrations = activity.Registrations
                .OrderByDescending(x => x.Status == RegistrationStatus.Accepted)
                .ThenByDescending(x => x.Status)
                .ThenBy(x => x.Class)
                .ToList();

            if (GuildId != null)
            {
                activity.DomainGuildId = GuildId;
                activity.DomainGuildName = Guild.Name;
            }

            return ApiResult(activity);
        }

        [HttpPost]
        public async ValueTask<ApiResult<Activity>> Post(
            [FromServices] WowContext db,
            [FromBody] Activity activity,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult<Activity>(403, "你没有权限创建活动");
            }

            if (string.IsNullOrWhiteSpace(activity.Name))
            {
                return ApiResult<Activity>(400, "活动名称不能为空");
            }

            if (GuildId == null)
            {
                return ApiResult<Activity>(400, "你必须在公会中创建活动");
            }

            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, false, cancellationToken))
            {
                return ApiResult<Activity>(400, "你没有权限在这个公会中创建活动");
            }

            activity.Realm = Guild.Realm;
            activity.GuildId = GuildId; 
            activity.UserId = Convert.ToInt32(User.Identity.Name);
            activity.Extension1 = "{}";
            activity.Extension2 = "{}";
            activity.Extension3 = "{}";
            db.Activities.Add(activity);
            await db.SaveChangesAsync(cancellationToken);
            return ApiResult(activity);
        }

        [HttpPost("clone")]
        public async ValueTask<ApiResult<Activity>> PostClone(
            [FromServices] WowContext db,
            [FromBody] CloneRequest request,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult<Activity>(403, "你没有权限创建活动");
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return ApiResult<Activity>(400, "活动名称不能为空");
            }

            if (GuildId == null)
            {
                return ApiResult<Activity>(400, "你必须在公会中创建活动");
            }

            if (!await ValidateUserPermissionToCurrentGuildAsync(db, null, false, cancellationToken))
            {
                return ApiResult<Activity>(400, "你没有权限在这个公会中创建活动");
            }

            var original = await db.Activities
                .Include(x => x.Guild)
                .Include(x => x.Registrations)
                .SingleOrDefaultAsync(x => x.Id == request.OriginalActivityId, cancellationToken);

            if (original == null)
            {
                return ApiResult<Activity>(404, "原活动未找到");
            }

            if (!await ValidateUserPermissionToCurrentGuildAsync(db, original.GuildId, false, cancellationToken))
            {
                return ApiResult<Activity>(403, "你没有权限克隆这个活动");
            }

            // 1. Clone activity
            var activity = new Activity 
            {
                Name = request.Name,
                Description = request.Description,
                Raids = request.Raids,
                Begin = request.Begin,
                Deadline = request.Deadline,
                Realm = original.Realm,
                EstimatedDurationInHours = original.EstimatedDurationInHours,
                Server = original.Server,
                UserId = Convert.ToInt32(User.Identity.Name),
                Visibility = original.Visibility,
                GuildId = GuildId,
                Registrations = new List<Registration>(),
                Password = original.Password,
                CreatedAt = DateTime.UtcNow,
                Extension1 = original.Extension1,
                Extension2 = original.Extension2,
                //Extension3 = original.Extension3
            };

            // 2. Clone registrations
            foreach (var x in original.Registrations)
            {
                if (request.Rule == MemberRule.None || request.Rule == MemberRule.AcceptedOnly && x.Status != RegistrationStatus.Accepted)
                {
                    continue;
                }

                activity.Registrations.Add(new Registration 
                {
                    RegisteredAt = DateTime.UtcNow,
                    CharactorId = x.CharactorId,
                    Name = x.Name,
                    Status = x.Status,
                    Class = x.Class,
                    Hint = x.Hint,
                    Microphone = x.Microphone,
                    Role = x.Role
                });
            }

            db.Activities.Add(activity);
            await db.SaveChangesAsync(cancellationToken);

            // 3. Patch extension fields
            foreach(var x in activity.Registrations)
            {
                var originalReg = original.Registrations.FirstOrDefault(y => y.Name == x.Name && y.Class == x.Class);
                if (originalReg == null)
                {
                    continue;
                }

                activity.Extension1 = activity.Extension1.Replace(originalReg.Id.ToString(), x.Id.ToString());
                activity.Extension2 = activity.Extension2.Replace(originalReg.Id.ToString(), x.Id.ToString());
                //activity.Extension3 = activity.Extension3.Replace(originalReg.Id.ToString(), x.Id.ToString());
            }
            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(activity);
        }

        [HttpDelete("{id:long}")]
        public async ValueTask<ApiResult> Delete(
            [FromServices] WowContext db,
            [FromRoute] long id,
             CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult(403, "你没有权限删除这个活动");
            }

            var activity = await db.Activities.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (activity == null)
            {
                return ApiResult(404, "没有找到指定的活动");
            }

            db.Activities.Remove(activity);
            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(200, "活动已删除");
        }

        [HttpPut("{id:long}")]
        [HttpPatch("{id:long}")]
        public async ValueTask<ApiResult<Activity>> Patch(
            [FromServices] WowContext db,
            [FromRoute] long id,
            [FromBody] PatchActivityRequest model,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult<Activity>(403, "你没有权限修改这个活动");
            }

            var activity = await db.Activities.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (activity == null)
            {
                return ApiResult<Activity>(404, "活动没有找到");
            }

            if (!string.IsNullOrEmpty(model.Name))
            {
                activity.Name = model.Name;
            }
            if (!string.IsNullOrEmpty(model.Description))
            {
                activity.Description = model.Description;
            }
            if (model.Deadline != default)
            {
                activity.Deadline = model.Deadline;
            }
            if (model.Begin != default)
            {
                activity.Begin = model.Begin;
            }
            if (model.EstimatedDurationInHours != default)
            {
                activity.EstimatedDurationInHours = model.EstimatedDurationInHours;
            }
            if (!string.IsNullOrEmpty(model.Raids))
            {
                activity.Raids = model.Raids;
            }
            if (!string.IsNullOrEmpty(model.Extension1))
            {
                activity.Extension1 = model.Extension1;
            }
            if (!string.IsNullOrEmpty(model.Extension2))
            {
                activity.Extension2 = model.Extension2;
            }
            if (!string.IsNullOrEmpty(model.Extension3))
            {
                activity.Extension3 = model.Extension3;
            }
            if (model.AllowForward.HasValue)
            {
                activity.AllowForward = model.AllowForward.Value;
            }

            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(activity);
        }
        #endregion

        #region Registration
        [HttpPost("{activityId:long}/registrations")]
        public async ValueTask<ApiResult<Registration>> Post(
            [FromServices] WowContext db,
            [FromServices] IConfiguration configuration,
            [FromRoute] long activityId,
            [FromBody] Registration registration,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(registration.Name))
            {
                return ApiResult<Registration>(400, "Invalid charactor name");
            }

            var activity = await db.Activities
                .Include(x => x.Guild)
                .SingleOrDefaultAsync(x => x.Id == activityId, cancellationToken);
            if (activity == null)
            {
                return ApiResult<Registration>(404, "没有找到活动");
            }

            if (!await ValidateUserPermissionToCurrentGuildAsync(db, activity.GuildId, false, cancellationToken) 
                && activity.Guild.RegisterPolicy == RegisterPolicy.RestrictWechat
                && (string.IsNullOrWhiteSpace(registration.WeChat)
                || !IsWeChatUser))
            {
                return ApiResult<Registration>(400, "请使用微信小程序进行报名");
            }

            registration.RegisteredAt = DateTime.UtcNow;
            registration.Status = RegistrationStatus.Pending;
            registration.ActivityId = activityId;
            if (IsWeChatUser) 
            {
                registration.WxOpenId = CurrentUser.WxOpenId;
                ++activity.Guild.Points;
            }

            if (await db.Registrations.AnyAsync(x => x.ActivityId == activityId && x.Name == registration.Name, cancellationToken))
            {
                return ApiResult<Registration>(400, "请不要重复报名");
            }

            var charactor = await FetchCharactorAsync(db, _logger, registration.Name, activity.Realm, Convert.ToInt32(configuration["Partition"]));
            if (charactor != null)
            {
                registration.CharactorId = charactor.Id;
                registration.Class = registration.Class;
            }

            if (registration.GuildId == null)
            {
                registration.GuildId = activity.GuildId;
                registration.GuildNameCache = activity.Guild.Name;
            }

            db.Registrations.Add(registration);

            if (CurrentUser != null && CurrentUser.WxAvatarUrl == null)
            {
                CurrentUser.WxAvatarUrl = registration.AvatarUrl;
                db.Attach(CurrentUser);
            }

            if (CurrentUser != null && CurrentUser.DisplayName == null)
            {
                CurrentUser.DisplayName = registration.WeChat;
                db.Attach(CurrentUser);
            }

            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(registration);
        }

        [HttpPut("{activityId:long}/registrations/{id:Guid}")]
        [HttpPatch("{activityId:long}/registrations/{id:Guid}")]
        public async ValueTask<ApiResult<Registration>> Patch(
            [FromServices] WowContext db,
            [FromRoute] long activityId,
            [FromRoute] Guid id,
            [FromBody] Registration model,
            CancellationToken cancellationToken = default)
        { 
            var registration = await db.Registrations.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (registration == null)
            {
                return ApiResult<Registration>(404, "Registration not found");
            }

            if (!string.IsNullOrWhiteSpace(model.Hint))
            {
                registration.Hint = model.Hint;
            }

            if (model.Status == RegistrationStatus.Leave || model.Status == RegistrationStatus.Pending || User.Identity.IsAuthenticated)
            {
                registration.Status = model.Status;
            }

            if (User.Identity.IsAuthenticated)
            {
                registration.Role = model.Role;
            }

            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(registration);
        }

        [HttpDelete("{activityId:long}/registrations/{id:Guid}")]
        public async ValueTask<ApiResult> Delete(
            [FromServices] WowContext db,
            [FromRoute] long activityId,
            [FromRoute] Guid id,
            CancellationToken cancellationToken = default)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult(403, "You don't have permission to modify an activity");
            }

            var registration = await db.Registrations.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (registration == null)
            {
                return ApiResult(404, "Registration not found");
            }

            db.Registrations.Remove(registration);
            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(200, "Registration removed");
        }
        #endregion

        internal static async ValueTask<string> GetApiKeyAsync(WowContext db, CancellationToken cancellationToken = default)
        {
            var keys = await db.WclApiKeys
                .Where(x => !x.Disabled)
                .ToListAsync(cancellationToken);
            return keys.OrderBy(x => Guid.NewGuid()).First().Id;
        }

        internal static async ValueTask<Charactor> FetchCharactorAsync(WowContext db, ILogger logger, string name, string realm, int partition)
        {
            try
            {
                var charactor = await db.Charactors.SingleOrDefaultAsync(x => x.Name == name && x.Realm == realm);
                if (charactor != null && charactor.UpdatedAt.AddDays(1) > DateTime.UtcNow)
                {
                    return charactor;
                }

                Fetcher.SetApiKey(await GetApiKeyAsync(db));
                var wclCharactorDps = await Fetcher.FetchAsync(name, realm, WCL.Models.CharactorRole.DPS, partition);
                if (wclCharactorDps == null)
                {
                    return null;
                }

                Fetcher.SetApiKey(await GetApiKeyAsync(db));
                var wclCharactorHealer = await Fetcher.FetchAsync(name, realm, WCL.Models.CharactorRole.Healer, partition);

                if (charactor == null)
                {
                    charactor = new Charactor();
                    db.Charactors.Add(charactor);
                }

                charactor.Name = name;
                charactor.Realm = realm;
                charactor.HighestItemLevel = wclCharactorDps.HighestItemLevel;
                charactor.Equipments = String.Join(',', wclCharactorDps.Equipments);
                charactor.DpsBossRanks = JsonConvert.SerializeObject(wclCharactorDps.BossRanks);
                charactor.HpsBossRanks = JsonConvert.SerializeObject(wclCharactorHealer.BossRanks);
                if (Enum.TryParse<Class>(wclCharactorDps.Class, out var cls))
                {
                    charactor.Class = cls;
                }

                if (Enum.TryParse<ClassCN>(wclCharactorDps.Class, out var cls2))
                {
                    charactor.Class = (Class)(int)cls2;
                }

                charactor.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();

                return charactor;
            }
            catch (Exception ex)
            {
                logger.LogWarning($"Fetch charactor from WCL failed: {ex}");
                return null;
            }
        }

        #region Mini Program
        [HttpGet("{activityId}/miniprogram-qrcode.png")]
        public async ValueTask<IActionResult> GetMiniProgramQrCode(
            [FromServices] WowContext db,
            [FromServices] IBlobStorage bs,
            [FromServices] MpApi mp,
            [FromRoute] long activityId,
            CancellationToken cancellationToken = default)
        {
            var activity = await db.Activities.SingleOrDefaultAsync(x => x.Id == activityId, cancellationToken);
            if (activity == null)
            {
                return NotFound();
            }

            if (activity.MiniProgramImageId == null)
            {
                var bytes = await mp.GenerateMiniProgramQrCodeAsync("pages/activity", activity.Id.ToString(), cancellationToken);
                using (var ms = new MemoryStream(bytes))
                {
                    var blob = await bs.SaveBlobAsync($"act-{activity.Id}-mp.png", "image/png", ms, cancellationToken);
                    activity.MiniProgramImageId = blob.Id;
                    await db.SaveChangesAsync(cancellationToken);
                }
            }

            var ret = await bs.GetBlobAsync(activity.MiniProgramImageId.Value, cancellationToken);
            return File(ret.Stream, "image/png", true);
        }
        #endregion
    }
}
