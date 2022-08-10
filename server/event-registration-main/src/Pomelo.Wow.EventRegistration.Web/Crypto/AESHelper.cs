using System;
using System.Security.Cryptography;

namespace Pomelo.Wow.EventRegistration.Web.Crypto
{
    public class AESHelper : IDisposable
    {
        private string _key, _iv;
        private RijndaelManaged rijndael;

        public AESHelper(string key, string iv)
        {
            _key = key;
            _iv = iv;
            byte[] keyArray = System.Text.Encoding.UTF8.GetBytes(_key);
            rijndael = new RijndaelManaged();
            rijndael.Key = keyArray;
            rijndael.Mode = CipherMode.ECB;
            rijndael.Padding = PaddingMode.PKCS7;
            rijndael.IV = System.Text.Encoding.UTF8.GetBytes(_iv);
        }


        public string Encrypt(string str)
        {
            byte[] toEncryptArray = System.Text.Encoding.UTF8.GetBytes(str);
            ICryptoTransform cTransform = rijndael.CreateEncryptor();
            byte[] resultArray = cTransform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
            return Convert.ToBase64String(resultArray, 0, resultArray.Length);
        }

        public string Decrypt(string str)
        {
            byte[] toEncryptArray = Convert.FromBase64String(str);
            var cTransform = rijndael.CreateDecryptor();
            byte[] resultArray = cTransform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
            return System.Text.Encoding.UTF8.GetString(resultArray);
        }

        public void Dispose()
        {
            rijndael?.Dispose();
        }
    }
}
