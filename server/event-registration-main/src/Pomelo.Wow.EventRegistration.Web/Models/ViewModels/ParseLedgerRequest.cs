using System.Collections.Generic;

namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public class ParseLedgerRequest
    {
        public string String { get; set; }
    }

    public class ParseLedgerResponse
    {
        public ParseLedgerStatistics Statistics { get; set; } = new ParseLedgerStatistics();

        public List<ParseLedgerRecord> Income { get; set; } = new List<ParseLedgerRecord>();

        public List<ParseLedgerRecord> Other { get; set; } = new List<ParseLedgerRecord>();

        public List<ParseLedgerRecord> Expense { get; set; } = new List<ParseLedgerRecord>();
    }

    public class ParseLedgerRecord
    {
        public string Name { get; set; }

        public int? ItemId { get; set; }

        public Item Item { get; set; }

        public int Amount { get; set; }

        public string Player { get; set; }

        public Class? Class { get; set; }

        public int Price { get; set; }

        public string Category { get; set; }
    }

    public class ParseLedgerStatistics
    {
        public int Split { get; set; }

        public ParseLedgerStatisticsSummary Summary { get; set; } = new ParseLedgerStatisticsSummary();

        public List<ParseLedgerStatisticsConsumer> TopConsumers { get; set; } = new List<ParseLedgerStatisticsConsumer>();

        public List<ParseLedgerStatisticsCategory> Categories { get; set; } = new List<ParseLedgerStatisticsCategory>();

    }

    public class ParseLedgerStatisticsSummary
    {
        public int Split { get; set; }

        public int Per { get; set; }

        public int Total { get; set; }

        public int Expense { get; set; }

        public int Profit { get; set; }
    }

    public class ParseLedgerStatisticsConsumer
    { 
        public string Player { get; set; }

        public Class? Class { get; set; }

        public int Price { get; set; }
    }

    public class ParseLedgerStatisticsCategory
    { 
        public string Category { get; set; }

        public int Price { get; set; }

        public List<ParseLedgerRecord> Details { get; set; } = new List<ParseLedgerRecord>();
    }
}
