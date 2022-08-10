using Microsoft.Extensions.Options;
using System.Diagnostics.CodeAnalysis;

namespace Pomelo.Wow.EventRegistration.Authentication
{
    [ExcludeFromCodeCoverage]
    public class TokenPostConfigureOptions : IPostConfigureOptions<TokenOptions>
    {
        public void PostConfigure(string name, TokenOptions options)
        {
        }
    }
}