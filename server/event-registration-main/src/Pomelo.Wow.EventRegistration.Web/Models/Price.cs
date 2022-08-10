using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class Price
    {
        public Guid Id { get; set; }

        [MaxLength(64)]
        public string Name { get; set; }

        [MaxLength(32)]
        [ForeignKey(nameof(Guild))]
        public string GuildId { get; set; }

        public virtual Guild Guild { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Data { get; set; } = "[]";
    }
}
