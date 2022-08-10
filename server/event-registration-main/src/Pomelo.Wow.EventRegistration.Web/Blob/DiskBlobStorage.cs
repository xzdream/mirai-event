using System;
using System.Threading;
using System.Threading.Tasks;
using System.IO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace Pomelo.Wow.EventRegistration.Web.Blob
{
    public class DiskBlobStorage : IBlobStorage
    {
        IConfiguration _config;
        private string _storePath = null;

        public DiskBlobStorage(IConfiguration config)
        {
            _config = config;
            _storePath = String.IsNullOrWhiteSpace(_config["Storage"]) ? "Blobs" : _config["Storage"];
            if (!Directory.Exists(_storePath))
            {
                Directory.CreateDirectory(_storePath);
            }
        }

        public async ValueTask<Blob> GetBlobAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var metaPath = GetFilePath(id, true);
            var blobPath = GetFilePath(id, false);
            if (!File.Exists(metaPath) || !File.Exists(blobPath))
            {
                return null;
            }

            var metadata = JsonConvert.DeserializeObject<Blob>(await File.ReadAllTextAsync(metaPath, cancellationToken));
            metadata.Stream = new FileStream(blobPath, FileMode.Open, FileAccess.Read);
            return metadata;
        }

        public async ValueTask<Blob> SaveBlobAsync(string fileName, string contentType, Stream stream, CancellationToken cancellationToken = default)
        {
            var blob = new Blob
            {
                Id = Guid.NewGuid(),
                ContentType = contentType,
                FileName = fileName,
                CreationTime = DateTime.UtcNow
            };

            var blobPath = GetFilePath(blob.Id);
            var metaPath = GetFilePath(blob.Id, true);

            using (var fileStream = new FileStream(blobPath, FileMode.CreateNew, FileAccess.Write))
            {
                await stream.CopyToAsync(fileStream);
            }

            var fi = new FileInfo(blobPath);
            blob.Size = fi.Length;
            await File.WriteAllTextAsync(metaPath, JsonConvert.SerializeObject(blob));
            return blob;
        }

        private string GetFilePath(Guid id, bool metadata = false)
        {
            return Path.Combine(_storePath, id + (metadata ? ".json" : ".data"));
        }
    }

    public static class DiskBlobStorageExtensions
    {
        public static IServiceCollection AddDiskBlobStorage(this IServiceCollection collection)
        {
            return collection.AddSingleton<IBlobStorage, DiskBlobStorage>();
        }
    }
}
