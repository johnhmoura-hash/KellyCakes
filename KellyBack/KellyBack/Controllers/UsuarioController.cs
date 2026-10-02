using Azure;
using KellyBack.Data;
using KellyBack.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages;

namespace KellyBack.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsuarioController :ControllerBase
    {
        private readonly DbKellyCakesContext _context;

        public UsuarioController(DbKellyCakesContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login(Usuario login)
        {

            var usuarioBd = _context.Usuarios.Where
                (c => c.Email.Equals(login.Email) &&
                c.Senha.Equals(login.Senha)).ToList();


            if (usuarioBd.Count == 0)

                return Unauthorized("Email ou Senha Incorretas");
            HttpContext.Session.SetString("Idusado", usuarioBd[0].IdUsuario.ToString());
            Response.Cookies.Append("Idusado", usuarioBd[0].IdUsuario.ToString(),

            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return Ok("Login realizado com sucesso");
        }

        [HttpPost]
        public async Task<IActionResult> CriarUsuario(Usuario usuario)
        {
            
            try
            {
                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }

            return Ok(usuario);
        }


        [HttpPost("logout")]
        public IActionResult logout()
        {
            HttpContext.Session.Clear();
            Response.Cookies.Delete("Idusado");
            Response.Cookies.Delete(".AspNetCore.Session");
            return Ok("Logout realizado com sucesso!");
        }

        [HttpDelete("Deletar/{id}")]
        public IActionResult DeletarPessoas(int id)
        {
            var Usuario = _context.Usuarios.Find(id);

            if (Usuario == null)
                return NotFound("Pessoa não encontarda");

            _context.Usuarios.Remove(Usuario);
            _context.SaveChanges();


            return Ok("Deletado");
        }

    }
}
