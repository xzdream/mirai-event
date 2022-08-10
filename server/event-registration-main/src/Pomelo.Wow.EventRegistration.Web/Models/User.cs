using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public enum UserRole
    { 
        User,
        Admin
    }

    public class User
    {
        public int Id { get; set; }

        [MaxLength(32)]
        public string Username { get; set; }

        [MaxLength(32)]
        public string DisplayName { get; set; }

        [MaxLength(128)]
        public string Email { get; set; }

        [MaxLength(32)]
        [JsonIgnore]
        public byte[] PasswordHash { get; set; } // SHA256

        [MaxLength(32)]
        [JsonIgnore]
        public byte[] Salt { get; set; }

        public UserRole Role { get; set; }

        [MaxLength(64)]
        [JsonIgnore]
        public string WxOpenId { get; set; }

        [MaxLength(256)]
        public string WxAvatarUrl { get; set; }
    }
}
