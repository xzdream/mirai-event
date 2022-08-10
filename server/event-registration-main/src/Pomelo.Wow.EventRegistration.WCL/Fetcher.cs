using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Linq;
using Newtonsoft.Json;
using Pomelo.Wow.EventRegistration.WCL.Models;

namespace Pomelo.Wow.EventRegistration.WCL
{
    public static class Fetcher
    {
        private static HttpClient clientWclCN = new HttpClient() { BaseAddress = new Uri("https://cn.classic.warcraftlogs.com") };
        private static HttpClient clientWowhead = new HttpClient() { BaseAddress = new Uri("https://tbc.wowhead.com") };
        private static HttpClient clientWowheadCN = new HttpClient() { BaseAddress = new Uri("https://cn.tbc.wowhead.com") };
        private static Regex equipmentRegex = new Regex("(?<=tbc.wowhead.com/item=)[0-9]{1,}");
        private static Regex itemLevelRegex = new Regex("(?<=\"level\":)[0-9]{1,}");
        private static Regex imageUrlRegex = new Regex("(?<=<link rel=\"image_src\" href=\").*(?=\">)");
        private static Regex itemNameRegex = new Regex("(?<=<title>)((?!&mdash).)*");
        private static Regex qualityRegex = new Regex("(?<=\"quality\":)[0-9]{1,}");
        private static string apiKey = null;
        private static int[] ignoreItems = new int[] { 30311, 30312, 30313, 30314, 30315, 30316, 30317, 30318, 30319, 30320 };

        public static void SetApiKey(string key)
        {
            apiKey = key;
        }

        public static async ValueTask<Charactor> FetchAsync(string name, string realm, CharactorRole role, int partition)
        {
            var charactor = new Charactor();
            charactor.Name = name;
            charactor.Realm = realm;
            charactor.Role = role;
            var parsed = await GetBossRanksAsync(name, realm, role, partition);
            if (parsed.ranks == null && parsed.gear == null && parsed.@class == null)
            {
                return null;
            }
            charactor.BossRanks = parsed.ranks;
            charactor.Equipments = parsed.gear
                .Where(x => x.Id.HasValue)
                .Select(x => x.Id.Value)
                .Where(x => !ignoreItems.Contains(x))
                .ToList();
            charactor.Class = parsed.@class;
            if (charactor.BossRanks.Count() > 0)
            {
                var validRanks = charactor.BossRanks.Where(x => x.ItemLevelIsExactly && !x.Name.Contains("凯尔萨斯"));
                if (validRanks.Count() > 0)
                {
                    charactor.HighestItemLevel = validRanks.Max(x => x.ItemLevel);
                }
                else
                {
                    charactor.HighestItemLevel = 0;
                }
            }

            return charactor;
        }

        public static async ValueTask<Equipment> FetchEquipmentAsync(int itemId, int retry = 3)
        {
            try
            {
                Equipment ret = null;
                using (var response = await clientWowhead.GetAsync($"/item={itemId}"))
                {
                    ret = new Equipment();
                    var html = await response.Content.ReadAsStringAsync();
                    ret.Id = itemId;
                    ret.ItemLevel = Convert.ToInt32(itemLevelRegex.Match(html).Value);
                    ret.ImageUrl = imageUrlRegex.Match(html).Value.Replace("https://wow.zamimg.com/images/wow/icons", "http://image.nfuwow.com/static/database/static/images/wow/icons");
                    ret.Name = await GetEquipmentNameCNAsync(itemId);
                    var quality = qualityRegex
                        .Matches(html)
                        .Cast<Match>()
                        .Select(x => Convert.ToInt32(x.Value))
                        .GroupBy(x => x)
                        .Select(x => new { x.Key, Count = x.Count() })
                        .OrderByDescending(x => x.Count)
                        .Select(x => x.Key)
                        .FirstOrDefault();
                    ret.Quality = (EquipmentQuality)quality;
                    ret.Position = GetEquipmentPosition(html);
                }

                return ret;
            }
            catch
            { 
                if (retry == 0)
                {
                    return null;
                }

                return await FetchEquipmentAsync(itemId, --retry);
            }
        }

        private static async ValueTask<string> GetEquipmentNameCNAsync(int itemId)
        {
            using (var response = await clientWowheadCN.GetAsync($"/item={itemId}"))
            {
                var html = await response.Content.ReadAsStringAsync();
                return itemNameRegex.Match(html).Value;
            }
        }

        private static EquipmentPosition GetEquipmentPosition(string html)
        {
            try
            {
                html = html.Split("\n").Where(x => x.Contains("tooltip_enus")).First();
            }
            catch 
            {
                return EquipmentPosition.Unknown;
            }
            
            for (var i = 0; i < 11; ++i) 
            {
                var position = (EquipmentPosition)i;
                var str = position.ToString();
                if (html.Contains(str))
                {
                    return position;
                }
            }

            if (html.Contains("Main Hand"))
            {
                return EquipmentPosition.MainHand;
            }
            else if (html.Contains("Two-Hand"))
            {
                return EquipmentPosition.TwoHand;
            }
            else if (html.Contains("Held In Off-hand"))
            {
                return EquipmentPosition.HeldInOffHand;
            }
            else if (html.Contains("Off Hand"))
            {
                return EquipmentPosition.OffHand;
            }
            else if (html.Contains("One Hand"))
            {
                return EquipmentPosition.OneHand;
            }
            else
            {
                return EquipmentPosition.Unknown;
            }
        }

        private static async ValueTask<(List<BossRank> ranks, IEnumerable<Gear> gear, string @class)> GetBossRanksAsync(string name, string realm, CharactorRole role, int partition)
        {
            var metric = "dps";
            if (role == CharactorRole.Healer)
            {
                metric = "hps";
            }

            try
            {
                using (var response = await clientWclCN.GetAsync($"/v1/parses/character/{name}/{realm}/CN?includeCombatantInfo=true&metric={metric}&partition={partition}&api_key={apiKey}"))
                {
                    var jsonStr = await response.Content.ReadAsStringAsync();
                    var obj = JsonConvert.DeserializeObject<IEnumerable<WclBattleRecord>>(jsonStr);
                    var gear = obj
                        .SelectMany(x => x.Gear)
                        .Where(x => x.Id.HasValue)
                        .GroupBy(x => x.Id.Value)
                        .Select(x => x.First())
                        .ToList();
                    var ret = new List<BossRank>();
                    foreach (var boss in obj)
                    {
                        ret.Add(new BossRank
                        {
                            Parse = Convert.ToInt32(boss.Percentile),
                            Fastest = new TimeSpan(0, 0, boss.Duration / 1000),
                            Highest = boss.Total,
                            Name = boss.EncounterName,
                            ItemLevel = boss.IlvlKeyOrPatch,
                            ItemLevelIsExactly = boss.Gear.Where(x => x.Id.HasValue).All(x => !ignoreItems.Contains(x.Id.Value))
                        });
                    }

                    return (ret.GroupBy(x => x.Name)
                        .Select(x => new BossRank
                        {
                            Name = x.Key,
                            Slowest = x.Max(x => x.Fastest),
                            Fastest = x.Min(x => x.Fastest),
                            AverageDuration = new TimeSpan(Convert.ToInt64(x.Average(x => x.Fastest.Ticks))),
                            Highest = x.Max(x => x.Highest),
                            Lowest = x.Min(x => x.Highest),
                            ItemLevel = x.Max(x => x.ItemLevel),
                            Killed = x.Count(),
                            Parse = x.Max(x => x.Parse),
                            ItemLevelIsExactly = x.Any(y => y.ItemLevel == x.Max(z => z.ItemLevel) && y.ItemLevelIsExactly)
                        })
                        .ToList(), gear, obj.Count() > 0 ? obj.First().Class : null);
                }
            }
            catch
            {
                return (null, null, null);
            }
        }
    }
}
