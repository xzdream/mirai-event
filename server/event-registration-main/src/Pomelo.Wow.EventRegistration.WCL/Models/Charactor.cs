using System.Collections.Generic;

namespace Pomelo.Wow.EventRegistration.WCL.Models
{
    public enum CharactorRole
    {
        Tank,
        DPS,
        Healer
    }

    public class Charactor
    {
        public string Name { get; set; }

        public string Realm { get; set; }

        public string Class { get; set; }

        public CharactorRole Role { get; set; }

        public int HighestItemLevel { get; set; }

        public IEnumerable<int> Equipments { get; set; }

        public IEnumerable<BossRank> BossRanks { get; set; }
    }
}
