using System;

namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public enum MemberRule
    {
        None,
        AcceptedOnly,
        All
    }

    public class CloneRequest
    {
        public long OriginalActivityId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public DateTime Begin { get; set; }

        public DateTime Deadline { get; set; }

        public string Raids { get; set; }

        public MemberRule Rule { get; set; }
    }
}
