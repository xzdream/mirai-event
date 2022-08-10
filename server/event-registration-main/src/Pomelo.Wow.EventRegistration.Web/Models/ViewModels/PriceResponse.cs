using System;

namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public class PriceResponse
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
