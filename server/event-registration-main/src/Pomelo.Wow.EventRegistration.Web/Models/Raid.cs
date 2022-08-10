namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class Raid
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public int Phase { get; set; }

        public int Priority { get; set; }

        public string BossList { get; set; }

        public int ItemLevelEntrance { get; set; }

        public int ItemLevelPreference { get; set; }

        public int ItemLevelGraduated { get; set; }

        public int ItemLevelFarm { get; set; }

        public float EstimatedDuration { get; set; }

        public string Enemies { get; set; }
    }
}
