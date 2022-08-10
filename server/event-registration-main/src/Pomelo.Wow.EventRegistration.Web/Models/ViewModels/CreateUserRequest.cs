namespace Pomelo.Wow.EventRegistration.Web.Models.ViewModels
{
    public class CreateUserRequest
    {
        public string Username { get; set; }

        public string Password { get; set; }

        public string Email { get; set; }

        public string DisplayName { get; set; }
    }
}
