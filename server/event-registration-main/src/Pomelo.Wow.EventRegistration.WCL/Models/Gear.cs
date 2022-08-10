using System.Collections.Generic;

namespace Pomelo.Wow.EventRegistration.WCL.Models
{
    public class Gear
    {
        public int? Id { get; set; }

        public string PermanentEnchant { get; set; }

        public IEnumerable<GearGems> Gems { get; set; }
    }

    public class GearGems
    {
        public int? Id { get; set; }

        public int? ItemLevel { get; set; }
    }
}
