using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public enum Faction
    {
        Alliance,
        Horde
    }

    public enum RegisterPolicy
    {
        AllowAll,
        RestrictWechat
    }

    public class Guild
    {
        [MaxLength(32)]
        public string Id { get; set; }

        [MaxLength(64)]
        public string Name { get; set; }

        [MaxLength(64)]
        public string Realm { get; set; }

        public string Description { get; set; }

        public Faction Faction { get; set; }

        [ForeignKey(nameof(User))]
        public int UserId { get; set; } // Owner

        [MaxLength(256)]
        public string GuildLogoUrl { get; set; }

        [MaxLength(256)]
        public string GuildListImageUrl { get; set; }

        public Guid? GuildMiniProgramImageId { get; set; }

        public virtual User User { get; set; }

        public virtual ICollection<GuildManager> Managers { get; set; } = new List<GuildManager>();

        public RegisterPolicy RegisterPolicy { get; set; }

        public int Points { get; set; }
    }
}
