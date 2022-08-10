using System.Collections.Generic;

namespace Pomelo.Wow.WeakAuras.Models
{
    public class GetWeakAurasInstanceRequest
    {
        public IEnumerable<GetWeakAurasInstanceRequestArgument> Arguments { get; set; }
    }

    public class GetWeakAurasInstanceRequestArgument
    {
        public string Key { get; set; }

        public string Value { get; set; }
    }

    public class WeakAurasTemplateSummary
    {
        public string Id { get; set; }

        public string Name { get; set; }
    }

    public class WeakAurasTemplateMetadata
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public IEnumerable<WeakAurasTemplateMetadataArgumentDefinition> Arguments { get; set; }
    }

    public class WeakAurasTemplateMetadataArgumentDefinition
    {
        public string Key { get; set; }

        public string Default { get; set; }

        public string Description { get; set; }
    }
}
