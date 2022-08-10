using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Pomelo.Wow.EventRegistration.Web.Blob
{
    public interface IBlobStorage
    {
        ValueTask<Blob> GetBlobAsync(Guid id, CancellationToken cancellationToken = default);

        ValueTask<Blob> SaveBlobAsync(string fileName, string contentType, Stream stream, CancellationToken cancellationToken = default);
    }
}
