using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json;

namespace Pomelo.Wow.MiniProgram
{
    public class MpApi : IDisposable
    {
        private string _appId, _appIdSecret;
        private HttpClient client = new HttpClient { BaseAddress = new Uri("https://api.weixin.qq.com") };
        private string accessToken = null;
        private DateTime expireAt = DateTime.MinValue;

        public string AccessToken => accessToken;
        public DateTime ExpireAt => expireAt;

        public MpApi(string appId, string appSecret)
        { 
            _appId = appId;
            _appIdSecret = appSecret;
        }

        public void Dispose()
        {
            client.Dispose();
        }

        private async ValueTask<string> GetAccessTokenAsync(CancellationToken cancellationToken = default)
        {
            if (accessToken == null || DateTime.UtcNow >= expireAt)
            {
                using (var response = await client.GetAsync($"/cgi-bin/token?grant_type=client_credential&appid={_appId}&secret={_appIdSecret}", cancellationToken))
                {
                    if (!response.IsSuccessStatusCode)
                    {
                        throw new InvalidOperationException("App id or secret is incorrect");
                    }

                    var str = await response.Content.ReadAsStringAsync(cancellationToken);
                    var res = JsonConvert.DeserializeObject<GetAccessTokenResponse>(str);
                    accessToken = res.access_token;
                    expireAt = DateTime.UtcNow.AddSeconds(res.expires_in - 60);
                }
            }

            return accessToken;
        }

        public async ValueTask<byte[]> GenerateMiniProgramQrCodeAsync(string page, string scene, CancellationToken cancellationToken)
        {
            var requestBody = new 
            {
                page = page,
                scene = scene,
                check_path = true,
                width = 430,
                is_hyaline = true,
                auto_color = false,
                line_color = new { 
                    r = 30,
                    g = 29,
                    b = 50
                }
            };

            using (var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json"))
            using (var response = await client.PostAsync($"/wxa/getwxacodeunlimit?access_token={await GetAccessTokenAsync(cancellationToken)}", content, cancellationToken))
            {
                if (!response.IsSuccessStatusCode)
                {
                    throw new InvalidOperationException("Arguments are incorrect");
                }

                return await response.Content.ReadAsByteArrayAsync(cancellationToken);
            }
        }

        public async ValueTask<WxLoginResponse> GetLoginSessionAsync(string jscode, CancellationToken cancellationToken)
        {
            using (var response = await client.GetAsync($"/sns/jscode2session?appid={_appId}&secret={_appIdSecret}&js_code={jscode}&grant_type=authorization_code"))
            {
                if (!response.IsSuccessStatusCode)
                {
                    throw new InvalidOperationException("Invalid js code");
                }

                return JsonConvert.DeserializeObject<WxLoginResponse>(await response.Content.ReadAsStringAsync(cancellationToken));
            }
        }
    }
}