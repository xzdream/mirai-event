using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class UnionActivity
    {
        [ForeignKey(nameof(Activity))]
        public long ActivityId { get; set; }

        public virtual Activity Activity { get; set; }

        [MaxLength(32)]
        [ForeignKey(nameof(Guild))]
        public string GuildId { get; set; }

        public virtual Guild Guild { get; set; }
    }
}
