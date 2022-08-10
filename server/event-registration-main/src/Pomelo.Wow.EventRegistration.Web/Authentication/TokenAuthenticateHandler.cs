using System;
using System.Collections.Concurrent;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Pomelo.Wow.EventRegistration.Web.Models;

namespace Pomelo.Wow.EventRegistration.Authentication
{
    [ExcludeFromCodeCoverage]
    public class TokenAuthenticateHandler : AuthenticationHandler<TokenOptions>
    {
        public new const string Scheme = "Token";

        private WowContext _db;

        public TokenAuthenticateHandler(
            IOptionsMonitor<TokenOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock,
            WowContext db)
            : base(options, logger, encoder, clock)
        {
            this._db = db;
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var authorization = Request.Headers["Authorization"].ToArray();
            if (authorization.Length == 0)
            {
                if (!string.IsNullOrEmpty(Request.Query["token"]))
                {
                    authorization = new[] { $"Token {Request.Query["token"]}" };
                }
                else
                {
                    return AuthenticateResult.NoResult();
                }
            }

            User tokenOwner = null;
            if (authorization.First().StartsWith("Token", StringComparison.OrdinalIgnoreCase))
            {
                var t = authorization.First().Substring("Token ".Length);
                var us = await _db.UserSessions.SingleOrDefaultAsync(x => x.Id == t);
                if (us == null)
                {
                    return AuthenticateResult.NoResult();
                }

                var user = await _db.Users.SingleAsync(x => x.Id == us.UserId);
                tokenOwner = user;
            }
            else
            {
                return AuthenticateResult.NoResult();
            }

            var claimIdentity = new ClaimsIdentity(Scheme, ClaimTypes.Name, ClaimTypes.Role);
            claimIdentity.AddClaim(new Claim(ClaimTypes.Name, tokenOwner.Id.ToString()));
            claimIdentity.AddClaim(new Claim(ClaimTypes.Role, tokenOwner.Role.ToString()));
            var ticket = new AuthenticationTicket(new ClaimsPrincipal(claimIdentity), Scheme);
            await _db.SaveChangesAsync();

            return AuthenticateResult.Success(ticket);
        }
    }
}
