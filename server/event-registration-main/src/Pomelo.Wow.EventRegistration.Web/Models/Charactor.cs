using System;
using System.ComponentModel.DataAnnotations;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class Charactor
    {
        public Guid Id { get; set; }

        [MaxLength(64)]
        public string Name { get; set; }

        [MaxLength(64)]
        public string Realm { get; set; }

        public int HighestItemLevel { get; set; }

        public string Equipments { get; set; } = "[]";

        public string DpsBossRanks { get; set; } = "[]";

        public string HpsBossRanks { get; set; } = "[]";

        public Class Class { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
