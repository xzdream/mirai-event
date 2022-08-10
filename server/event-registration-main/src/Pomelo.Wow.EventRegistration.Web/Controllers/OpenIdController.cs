using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Pomelo.Wow.MiniProgram;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OpenIdController : ControllerBase
    {
        public static Regex EmailRegex = new Regex("^\\s*([A-Za-z0-9_-]+(\\.\\w+)*@(\\w+\\.)+\\w{2,5})\\s*$");
        internal static Random Random = new Random();
        internal static SHA256 Sha256 = SHA256.Create();
        internal static Aes Aes = Aes.Create();

        ILogger<OpenIdController> _logger;
        IConfiguration _configuration;


        public OpenIdController(ILogger<OpenIdController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }


        [HttpPost("session")]
        public async ValueTask<ApiResult<LoginResponse>> Post(
            [FromServices] WowContext db,
            [FromServices] MpApi mp,
            [FromBody] CreateUserFromWxRequest request,
            CancellationToken cancellationToken = default)
        {
            var session = await mp.GetLoginSessionAsync(request.JsCode, cancellationToken);
            var user = await db.Users.FirstOrDefaultAsync(x => x.WxOpenId == session.openid, cancellationToken);
            if (user == null)
            {
                var username = "wx_" + Guid.NewGuid().ToString().Replace("-", "");
                username = username.Substring(0, 32);
                user = new User 
                {
                    Username = username,
                    DisplayName = request.DisplayName,
                    Email = null,
                    Role = UserRole.User,
                    WxOpenId = session.openid,
                    Salt = new byte[32]
                };

                var buffer = new List<byte>(Encoding.UTF8.GetBytes(GenerateRandomString(32)));
                Random.NextBytes(user.Salt);
                buffer.AddRange(user.Salt);
                user.PasswordHash = Sha256.ComputeHash(buffer.ToArray());

                db.Users.Add(user);
                await db.SaveChangesAsync(cancellationToken);
            }

            var us = new UserSession
            {
                CreatedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(7),
                UserId = user.Id,
                Id = GenerateTokenId()
            };

            db.UserSessions.Add(us);
            await db.SaveChangesAsync(cancellationToken);

            return ApiResult(new LoginResponse { Username = user.Username, UserId = user.Id, DisplayName = user.DisplayName, Token = us.Id, Role = user.Role.ToString() });
        }

        private string GenerateTokenId()
        {
            return $"{DateTime.UtcNow.Ticks}-{GenerateRandomString(64)}";
        }

        static string randomStringDic = "1234567890qwertyuiopasdfghjklzxcvbnm";

        private string GenerateRandomString(int length)
        {
            var sb = new StringBuilder();
            while(sb.Length < length)
            {
                sb.Append(randomStringDic[Random.Next(0, randomStringDic.Length)]);
            }
            return sb.ToString();
        }

        internal string Encrypt(string input)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["MiniProgram:AppSecret"]);
            var iv = Encoding.UTF8.GetBytes(_configuration["MiniProgram:AppId"]);

            using (var encryptor = Aes.CreateEncryptor(key, iv))
            {
                using (var msEncrypt = new MemoryStream())
                {
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor,
                        CryptoStreamMode.Write))

                    using (var swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(input);
                    }
                    var decryptedContent = msEncrypt.ToArray();

                    return Convert.ToBase64String(decryptedContent);
                }
            }
        }

        internal string DecryptString(string text)
        {
            var fullCipher = Convert.FromBase64String(text);
            var key = Encoding.UTF8.GetBytes(_configuration["MiniProgram:AppSecret"]);
            var iv = Encoding.UTF8.GetBytes(_configuration["MiniProgram:AppId"]);

            using (var decryptor = Aes.CreateDecryptor(key, iv))
            {
                string result;
                using (var msDecrypt = new MemoryStream(fullCipher))
                {
                    using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (var srDecrypt = new StreamReader(csDecrypt))
                        {
                            result = srDecrypt.ReadToEnd();
                        }
                    }
                }

                return result;
            }
        }
    }
}
