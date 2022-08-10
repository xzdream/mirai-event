using System.Collections.Generic;

namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public class BatchItemRequest
    {
        public IEnumerable<BatchItemRequestSingle> Queries { get; set; }
    }

    public class BatchItemRequestSingle
    { 
        public string Group { get; set; }

        public IEnumerable<int> Ids { get; set; }

        public IEnumerable<string> Names { get; set; }
    }
}
