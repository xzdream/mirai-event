using System;
using System.Threading.Tasks;
using Xunit;

namespace Pomelo.Wow.EventRegistration.WCL.Tests
{
    public class FetcherTests
    {
        [Fact]
        public async Task FetchCharacterTest()
        {
            Fetcher.SetApiKey("577ca89dd52bb404003e3f50bab35bcf");
            var ch = await Fetcher.FetchAsync("√»–°Ë÷", "¡˙÷Æ’ŸªΩ", Models.CharactorRole.Tank, 3);
            var ch2 = await Fetcher.FetchAsync("√»–°Ë÷", "¡˙÷Æ’ŸªΩ", Models.CharactorRole.Tank, 4);

            Assert.NotNull(ch);
            Assert.NotNull(ch2);
        }
    }
}
