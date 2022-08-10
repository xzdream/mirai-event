using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pomelo.Wow.EventRegistration.WCL.Models;
using Newtonsoft.Json;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public enum RegistrationStatus
    {
        Pending,
        Rejected,
        Standby,
        Leave,
        Accepted
    }

    public class Registration
    {
        public Guid Id { get; set; }

        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        [MaxLength(64)]
        public string Name { get; set; }

        public CharactorRole Role { get; set; }

        public RegistrationStatus Status { get; set; }

        public string Hint { get; set; }

        public string WeChat { get; set; }

        public string AvatarUrl { get; set; }

        public bool Microphone { get; set; } = true;

        public Class Class { get; set; }

        [ForeignKey(nameof(Charactor))]
        public Guid? CharactorId { get; set; }

        public virtual Charactor Charactor { get; set; }

        [ForeignKey(nameof(Activity))]
        public long ActivityId { get; set; }

        public virtual Activity Activity { get; set; }

        public int Evaluation { get; set; }

        [JsonIgnore]
        [MaxLength(64)]
        public string WxOpenId { get; set; }

        [MaxLength(32)]
        [ForeignKey(nameof(Guild))]
        public string GuildId { get; set; }

        public virtual Guild Guild { get; set; }

        [MaxLength(64)]
        public string GuildNameCache { get; set; }
    }
}
