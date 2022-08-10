using System.Collections.Generic;

namespace Pomelo.Wow.EventRegistration.WCL.Models
{
    internal class WclBattleRecord
    {
        public string CharacterName { get; set; }

        public string EncounterName { get; set; }

        public string Server { get; set; }

        public string Class { get; set; }

        public string Spec { get; set; }

        public float Total { get; set; }

        public float Percentile { get; set; }

        public int Duration { get; set; }

        public int IlvlKeyOrPatch { get; set; }

        public IEnumerable<Gear> Gear { get; set; }
    }
}
