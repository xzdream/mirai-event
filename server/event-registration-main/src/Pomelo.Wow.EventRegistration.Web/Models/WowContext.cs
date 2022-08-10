using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Pomelo.Wow.EventRegistration.Web.Models
{
    public class WowContext : DbContext
    {
        public WowContext(DbContextOptions<WowContext> opt) : base(opt)
        { }

        public DbSet<Activity> Activities { get; set; }

        public DbSet<Charactor> Charactors { get; set; }

        public DbSet<Guild> Guilds { get; set; }

        public DbSet<GuildManager> GuildManagers { get; set; }

        public DbSet<GuildVariable> GuildVariables { get; set; }

        public DbSet<Item> Items { get; set; }

        public DbSet<ItemSet> ItemSets { get; set; }

        public DbSet<Price> Prices { get; set; }

        public DbSet<Raid> Raids { get; set; }

        public DbSet<Registration> Registrations { get; set; }

        public DbSet<UnionActivity> UnionActivities { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<UserSession> UserSessions { get; set; }

        public DbSet<WclApiKey> WclApiKeys { get; set; }

        public async ValueTask InitAsync()
        {
            if (await Database.EnsureCreatedAsync())
            {
                // Init 
            }
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Activity>(e =>
            {
                e.HasMany(x => x.Registrations).WithOne(x => x.Activity).OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Charactor>(e =>
            {
                e.HasIndex(x => new { x.Name, x.Realm });
                e.HasMany<Registration>().WithOne(x => x.Charactor).OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<Guild>(e =>
            {
                e.HasIndex(x => x.Name).IsFullText();
                e.HasIndex(x => x.Faction);
                e.HasMany(x => x.Managers).WithOne(x => x.Guild).OnDelete(DeleteBehavior.Cascade);
                e.HasMany<Activity>().WithOne(x => x.Guild).OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<GuildManager>(e =>
            {
                e.HasKey(x => new { x.GuildId, x.UserId });
            });

            builder.Entity<GuildVariable>(e =>
            {
                e.HasKey(x => new { x.GuildId, x.Key });
            });

            builder.Entity<Registration>(e =>
            {
                e.HasOne(x => x.Guild).WithMany().IsRequired(false);
            });

            builder.Entity<UnionActivity>(e => 
            {
                e.HasKey(x => new { x.GuildId, x.ActivityId });
            }); 

            builder.Entity<User>(e =>
            {
                e.HasIndex(x => x.Username).IsUnique();
                e.HasMany<UserSession>().WithOne(x => x.User).OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
