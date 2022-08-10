using System.Collections.Generic;

namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public class BatchUpdateWclRequest
    {
        public string Realm { get; set; }
        public IEnumerable<string> Names { get; set; }
    }
}
