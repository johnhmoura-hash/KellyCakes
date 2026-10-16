
using KellyBack.Data;
using KellyBack.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Controllers
{
    [ApiController]
    [Route("api/cartoes")]
    public class CartoesApiController : ControllerBase
    {
        private readonly DbKellyCakesContext _context;

        public CartoesApiController(DbKellyCakesContext context)
        {
            _context = context;
        }

        private bool TentarObterUsuario(out int idUsuario)
        {
            idUsuario = 0;

            var id = HttpContext.Session.GetString("Idusado");

            return int.TryParse(id, out idUsuario);
        }

        // Lista somente os cartões do usuário conectado.
        [HttpGet("meus-cartoes")]
        public async Task<IActionResult> MeusCartoes()
        {
            if (!TentarObterUsuario(out int idUsuario))
                return Unauthorized("Faça login para consultar seus cartões.");

            var cartoes = await _context.Cartaos
                .Where(c => c.FkUsuarioIdUsuario == idUsuario)
                .Select(c => new
                {
                    id = c.Id_cartao,
                    bandeira = c.Bandeira,
                    nomeCartao = c.NomeCartao,
                    ultimos4 = c.NumCartao.Length >= 4
                        ? c.NumCartao.Substring(c.NumCartao.Length - 4)
                        : c.NumCartao
                })
                .ToListAsync();

            return Ok(cartoes);
        }

        // Cadastra um cartão para o usuário conectado.
        [HttpPost("cadastrar")]
        public async Task<IActionResult> Cadastrar(
            [FromBody] Cartao cartao)
        {
            if (!TentarObterUsuario(out int idUsuario))
                return Unauthorized("Faça login para cadastrar um cartão.");

            if (cartao == null ||
                string.IsNullOrWhiteSpace(cartao.NumCartao) ||
                string.IsNullOrWhiteSpace(cartao.NomeCartao) ||
                string.IsNullOrWhiteSpace(cartao.Bandeira))
            {
                return BadRequest("Preencha os dados do cartão.");
            }

            // Nunca confiar no ID do usuário enviado pelo navegador.
            cartao.Id_cartao = 0;
            cartao.FkUsuarioIdUsuario = idUsuario;

            // Não armazenar o CVV.
            cartao.Codigo = 0;

            _context.Cartaos.Add(cartao);
            await _context.SaveChangesAsync();

            var numero = cartao.NumCartao;

            return Ok(new
            {
                id = cartao.Id_cartao,
                bandeira = cartao.Bandeira,
                nomeCartao = cartao.NomeCartao,
                ultimos4 = numero.Length >= 4
                    ? numero.Substring(numero.Length - 4)
                    : numero
            });
        }
    }
}
