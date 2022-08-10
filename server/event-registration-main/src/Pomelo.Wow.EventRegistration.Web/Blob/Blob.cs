using System;
using System.IO;
using Newtonsoft.Json;

namespace Pomelo.Wow.EventRegistration.Web.Blob
{
    public class Blob
    {
        public Guid Id { get; set; }

        public string FileName { get; set; }

        public long Size { get; set; }

        public string ContentType { get; set; }

        public DateTime CreationTime { get; set; }

        [JsonIgnore]
        public Stream Stream { get; set; }
    }
}
