using System;

namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public class LoginResponse
    {
        public string Username { get; set; }

        public string DisplayName { get; set; }

        public int UserId { get; set; }

        public string Token { get; set; }

        public string Role { get; set; }

        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    }
}
