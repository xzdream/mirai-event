namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public class ActivityViewModel : Activity
    {
        public string RaidLeader { get; set; }

        public int RegisteredCount { get; set; }

        public string GuildName { get; set; }

        public Faction Faction { get; set; }
    }
}
