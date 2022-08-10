using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UtilController : ControllerBase
    {
        [HttpPost("ledger")]
        public async ValueTask<ParseLedgerResponse> PostParseLedger(
            [FromServices] WowContext db,
            [FromBody] ParseLedgerRequest request,
            CancellationToken cancellationToken = default)
        {
            var ret = new ParseLedgerResponse();
            var tmp = new List<ParseLedgerRecord>();
            var lines = request.String.Split('\n').Select(x => x.Trim());

            // Prase raw data
            foreach (var line in lines)
            {
                var splited = line.Split(',').Select(x => x.Trim()).ToArray();

                if (splited[0].ToLower() == "split")
                {
                    ret.Statistics.Split = Convert.ToInt32(splited[1]);
                    ret.Statistics.Summary.Split = ret.Statistics.Split;
                    continue;
                }

                if (splited[0] == "收入") 
                {
                    var rec = new ParseLedgerRecord();
                    if (splited.Length < 5)
                    {
                        continue;
                    }
                    var name = splited[1];
                    if (name.IndexOf("(ItemId:") > 0)
                    {
                        rec.Name = name.Substring(0, name.IndexOf("(ItemId:"));
                        rec.ItemId = Convert.ToInt32(name.Substring(name.IndexOf("(ItemId:")).Replace("(ItemId:", "").TrimEnd(')'));
                    }
                    else 
                    {
                        rec.Name = name;
                    }
                    rec.Amount = Convert.ToInt32(splited[2]);
                    rec.Player = splited[3];
                    rec.Price = Convert.ToInt32(splited[4]);
                    if (splited.Length >= 7)
                    {
                        rec.Category = splited[6];
                    }
                    if (splited.Length >= 8)
                    {
                        var classStr = splited[7].ToLower();
                        if (classStr.Length > 0)
                        {
                            var classChArr = classStr.ToCharArray();
                            classChArr[0] = char.ToUpper(classChArr[0]);
                            if (Enum.TryParse<Class>(new string(classChArr), out var cls))
                            {
                                if (!string.IsNullOrWhiteSpace(rec.Player))
                                {
                                    rec.Class = cls;
                                }
                            }
                        }
                    }
                    tmp.Add(rec);
                    continue;
                }

                if (splited[0] == "支出")
                {
                    if (splited.Length < 5)
                    {
                        continue;
                    }

                    Class? cls = null;
                    if (splited.Length >= 8)
                    {
                        var classStr = splited[7].ToLower();
                        if (classStr.Length > 0)
                        {
                            var classChArr = classStr.ToCharArray();
                            classChArr[0] = char.ToUpper(classChArr[0]);
                            if (Enum.TryParse<Class>(new string(classChArr), out var parsed))
                            {
                                if (!string.IsNullOrWhiteSpace(splited[1]))
                                {
                                    cls = parsed;
                                }
                            }
                        }
                    }

                    ret.Expense.Add(new ParseLedgerRecord 
                    {
                        Name = splited[1],
                        Amount = Convert.ToInt32(splited[2]),
                        Player = splited[3],
                        Price = Convert.ToInt32(splited[4]),
                        Class = cls
                    });
                }
            }

            // Split income & penalty
            var itemWithIds = tmp.Where(x => x.ItemId.HasValue);
            var itemIds = itemWithIds.Select(x => x.ItemId.Value);
            var items = await db.Items.Where(x => itemIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x, cancellationToken);
            foreach (var item in itemWithIds)
            {
                if (items.ContainsKey(item.ItemId.Value))
                {
                    item.Item = items[item.ItemId.Value];
                }
            }

            // Try to get item link by name
            var itemsWithoutIds = tmp.Where(x => !x.ItemId.HasValue);
            var itemNames = itemsWithoutIds.Select(x => x.Name);
            var items2 = (await db.Items
                .Where(x => itemNames.Contains(x.Name))
                .ToListAsync(cancellationToken))
                .GroupBy(x => x.Name)
                .Select(x => x.First())
                .ToDictionary(x => x.Name, x => x);
            foreach(var item in itemsWithoutIds)
            {
                if (items2.ContainsKey(item.Name))
                {
                    item.Item = items2[item.Name];
                    item.ItemId = items2[item.Name].Id;
                }
            }

            ret.Income = tmp.Where(x => x.ItemId.HasValue).OrderByDescending(x => x.Price).ToList();
            ret.Other = tmp.Where(x => !x.ItemId.HasValue).ToList();

            // Parse statistics
            ret.Statistics.TopConsumers = ret.Income
                .Where(x => !string.IsNullOrWhiteSpace(x.Player))
                .GroupBy(x => x.Player)
                .Select(x => new ParseLedgerStatisticsConsumer
                {
                    Player = x.Key,
                    Class = x.First().Class,
                    Price = x.Sum(y => y.Price)
                })
                .ToList();
            ret.Statistics.Summary.Total = ret.Income.Sum(x => x.Price) + ret.Other.Sum(x => x.Price);
            ret.Statistics.Summary.Expense = ret.Expense.Sum(x => x.Price);
            ret.Statistics.Summary.Profit = ret.Statistics.Summary.Total - ret.Statistics.Summary.Expense;
            if (ret.Statistics.Summary.Split > 0)
            {
                ret.Statistics.Summary.Per = ret.Statistics.Summary.Profit / ret.Statistics.Summary.Split;
            }
            ret.Statistics.Categories = ret.Income
                .GroupBy(x => x.Category)
                .Select(x => new ParseLedgerStatisticsCategory 
                { 
                    Category = x.Key,
                    Price = x.Sum(y => y.Price),
                    Details = x.OrderByDescending(y => y.Price).ToList()
                })
                .ToList();

            return ret;
        }

        [HttpPost("forward-activity")]
        public async ValueTask<ApiResult> PostForwardActivity(
            [FromServices] WowContext db,
            [FromBody] ForwardActivityRequest request,
            CancellationToken cancellationToken = default)
        {
            if (!await ValidateUserPermissionToCurrentGuildAsync(db, request.GuildId, false, cancellationToken))
            {
                return ApiResult(403, "您没有权限将活动转发至该公会");
            }

            if (await db.UnionActivities.AnyAsync(x => x.GuildId == request.GuildId && x.ActivityId == request.ActivityId, cancellationToken))
            {
                return ApiResult(400, "您已经转发过这个活动了");
            }

            db.UnionActivities.Add(new UnionActivity 
            {
                ActivityId = request.ActivityId,
                GuildId = request.GuildId
            });

            await db.SaveChangesAsync(cancellationToken);
            return ApiResult(200, "转发成功");
        }
    }
}
