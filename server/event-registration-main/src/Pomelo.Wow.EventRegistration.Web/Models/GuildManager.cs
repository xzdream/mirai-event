using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class GuildManager
    {
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }

        public virtual User User { get; set; }

        [MaxLength(32)]
        [ForeignKey(nameof(Guild))]
        public string GuildId { get; set; }

        public virtual Guild Guild { get; set; }
    }
}
