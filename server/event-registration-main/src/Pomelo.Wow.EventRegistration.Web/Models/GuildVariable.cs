using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class GuildVariable
    {
        [MaxLength(32)]
        [ForeignKey(nameof(Guild))]
        public string GuildId { get; set; }

        public virtual Guild Guild { get; set; }

        [MaxLength(64)]
        public string Key { get; set; }

        public string Value { get; set; }
    }
}
