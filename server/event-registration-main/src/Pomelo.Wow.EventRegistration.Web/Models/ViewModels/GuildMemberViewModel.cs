using System.Collections.Generic;

namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public class GuildMemberViewModel
    {
        public string Nickname { get; set; }

        public string AvatarUrl { get; set; }

        public int Attend { get; set; }

        public List<GuildMemberCharactorViewModel> Charactors { get; set; }
    }

    public class GuildMemberCharactorViewModel
    { 
        public string Name { get; set; }

        public Class Class { get; set; }

        public int Attend { get; set; }
    }
}
