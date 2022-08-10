using System;
using Pomelo.Wow.EventRegistration.WCL.Models;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class ItemSet
    {
        public int Id { get; set; }

        public string Items { get; set; }

        public string Name { get; set; }

        public CharactorRole Role { get; set; }

        public int Phase { get; set; }
    }
}
