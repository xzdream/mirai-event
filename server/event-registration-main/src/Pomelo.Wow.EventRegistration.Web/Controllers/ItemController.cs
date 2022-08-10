using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pomelo.Wow.EventRegistration.WCL;
using Pomelo.Wow.EventRegistration.Web.Models;
using Pomelo.Wow.EventRegistration.Web.Models.ViewModels;

namespace Pomelo.Wow.EventRegistration.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        ILogger<ItemController> _logger;

        public ItemController(ILogger<ItemController> logger)
        {
            _logger = logger;
        }

        [HttpGet("{id:int}")]
        [ResponseCache(Duration = 86400 * 30, Location = ResponseCacheLocation.Any, NoStore = false)]
        public async ValueTask<ApiResult<Item>> Get(
            [FromServices] WowContext db,
            [FromRoute] int id,
            CancellationToken cancellationToken = default)
        {
            var item = await db.Items.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (item == null)
            {
                var equipment = await Fetcher.FetchEquipmentAsync(id);
                item = new Item
                { 
                    Id = equipment.Id,
                    ImageUrl = equipment.ImageUrl,
                    ItemLevel = equipment.ItemLevel,
                    Name = equipment.Name,
                    Position = equipment.Position,
                    Quality = equipment.Quality
                };
                db.Items.Add(item);
                await db.SaveChangesAsync(cancellationToken);
            }

            return ApiResult(item);
        }

        [HttpPost("batch")]
        public async ValueTask<ApiResult<dynamic>> PostBatchIds(
            [FromServices] WowContext db,
            [FromBody] BatchItemRequest request,
            CancellationToken cancellationToken = default)
        {
            var ids = request.Queries.SelectMany(x => x.Ids).ToList();
            var existed = await db.Items
                .Where(x => ids.Contains(x.Id))
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);
            var needFetch = ids.Where(x => !existed.Contains(x)).ToList();
            var failed = new List<int>();
            foreach (var x in needFetch)
            {
                try
                {
                    var equipment = await Fetcher.FetchEquipmentAsync(x, 0);
                    if (equipment == null)
                    {
                        continue;
                    }

                    var item = new Item
                    {
                        Id = equipment.Id,
                        ImageUrl = equipment.ImageUrl,
                        ItemLevel = equipment.ItemLevel,
                        Name = equipment.Name,
                        Position = equipment.Position,
                        Quality = equipment.Quality
                    };
                    db.Items.Add(item);
                    await db.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.ToString());
                    failed.Add(x);
                }
            }

            var items = await db.Items.Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x);
            var ret = request.Queries.Select(x => new 
            {
                Group = x.Group,
                Items = x.Ids.Where(y => items.ContainsKey(y)).Select(y => items[y]),
                Failed = failed
            });
            return ApiResult<dynamic>(ret);
        }

        [HttpPost("batch/name")]
        public async ValueTask<ApiResult<dynamic>> PostBatchNames(
            [FromServices] WowContext db,
            [FromBody] BatchItemRequest request,
            CancellationToken cancellationToken = default)
        {
            var names = request.Queries.SelectMany(x => x.Names).ToList();

            var items = (await db.Items
                .Where(x => names.Contains(x.Name))
                .ToListAsync(cancellationToken))
                .GroupBy(x => x.Name)
                .ToDictionary(x => x.Key, x => x.First());
            var ret = request.Queries.Select(x => new
            {
                Group = x.Group,
                Items = items
            });
            return ApiResult<dynamic>(ret);
        }

        [HttpGet("set")]
        public async ValueTask<ApiResult<dynamic>> GetItemSets(
            [FromServices] WowContext db,
            CancellationToken cancellationToken = default)
        {
            var sets = (await db.ItemSets
                .ToListAsync(cancellationToken))
                .GroupBy(x => x.Role)
                .ToDictionary(x => (int)x.Key, x => x.OrderByDescending(y => y.Phase).Select(y => new { y.Name, y.Phase, Items = y.Items.Split(',').Select(z => Convert.ToInt32(z.Trim())) }).ToList());

            return ApiResult<dynamic>(sets);
        }
    }
}
