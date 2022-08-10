using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class GuildMember
    {
        [MaxLength(32)]
        public string GuildId { get; set; }

        public virtual Guild Guild { get; set; }

        [ForeignKey(nameof(Charactor))]
        public int CharactorId { get; set; }

        public virtual Charactor Charactor { get; set; }
    }
}
