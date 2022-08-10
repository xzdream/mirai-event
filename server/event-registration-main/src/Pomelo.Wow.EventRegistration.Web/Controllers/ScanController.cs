using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;
using Pomelo.Wow.EventRegistration.Web.Crypto;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScanController : ControllerBase
    {
        private static ConcurrentDictionary<Guid, LoginResponse> dic = new ConcurrentDictionary<Guid, LoginResponse>();
        private static AESHelper aes = new AESHelper(Startup.Configuration["Aes:Key"], Startup.Configuration["Aes:IV"]);

        [HttpPost("generate")]
        public ApiResult<string> PostGenerateCode()
        {
            CleanUp();
            return ApiResult(GenerateCode());
        }

        [HttpPost("scan")]
        public async ValueTask<ApiResult> PostScanCode(
            [FromServices] WowContext db,
            [FromBody] ValidateQrCodeRequest request,
            CancellationToken cancellationToken = default)
        {
            var qrcode = ValidateCode(request.Code);
            if (qrcode == null)
            {
                return ApiResult(404, "二维码无效");
            }

            if (dic.ContainsKey(qrcode.Id))
            {
                return ApiResult(400, "二维码已被扫描");
            }

            if (!User.Identity.IsAuthenticated)
            {
                return ApiResult(403, "身份信息不正确");
            }

            var us = new UserSession
            {
                CreatedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(7),
                UserId = CurrentUser.Id,
                Id = UserController.GenerateTokenId()
            };

            db.UserSessions.Add(us);
            await db.SaveChangesAsync(cancellationToken);
            var response = new LoginResponse { Username = CurrentUser.Username, UserId = CurrentUser.Id, DisplayName = CurrentUser.DisplayName, Token = us.Id, Role = CurrentUser.Role.ToString() };
            dic.TryAdd(qrcode.Id, response);

            return ApiResult(200, "扫描成功");
        }

        [HttpPost("validate")]
        public ApiResult<LoginResponse> PostValidateCode(
            [FromBody] ValidateQrCodeRequest request)
        {
            var qrcode = ValidateCode(request.Code);
            if (qrcode == null)
            {
                return ApiResult<LoginResponse>(404, "请求无效");
            }

            if (dic.ContainsKey(qrcode.Id))
            {
                return ApiResult(dic[qrcode.Id]);
            }
            else
            {
                return ApiResult<LoginResponse>(400, "请求无效");
            }
        }

        private QrCodeContent ValidateCode(string code)
        {
            try
            {
                var decrypted = aes.Decrypt(code);
                var obj = JsonConvert.DeserializeObject<QrCodeContent>(decrypted);
                return obj;
            }
            catch 
            {
                return null;
            }
        }

        private string GenerateCode()
        {
            var code = new QrCodeContent 
            {
                Id = Guid.NewGuid(),
                IssuedAt = DateTime.UtcNow,
            };

            var jsonStr = JsonConvert.SerializeObject(code);
            var encrypted = aes.Encrypt(jsonStr);
            return encrypted;
        }

        private static void CleanUp()
        {
            foreach(var x in dic)
            {
                if (x.Value.IssuedAt.AddMinutes(20) < DateTime.UtcNow)
                {
                    dic.TryRemove(x.Key, out var val);
                }
            }
        }
    }
}
