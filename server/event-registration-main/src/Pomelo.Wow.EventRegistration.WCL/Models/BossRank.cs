using System;

namespace Pomelo.Wow.EventRegistration.WCL.Models
{
    public class BossRank
    {
        public string Name { get; set; }

        public float Highest { get; set; }

        public float Lowest { get; set; }

        public TimeSpan Fastest { get; set; }

        public TimeSpan Slowest { get; set; }

        public TimeSpan AverageDuration { get; set; }

        public int Killed { get; set; }

        public int Parse { get; set; }

        public int ItemLevel { get; set; }

        public bool ItemLevelIsExactly { get; set; }
    }
}
