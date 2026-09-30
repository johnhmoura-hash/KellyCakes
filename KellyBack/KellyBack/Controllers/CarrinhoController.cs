using KellyBack.Data;
using KellyBack.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CarrinhoController : ControllerBase
    {
        private readonly DbKellyCakesContext _context;

        public CarrinhoController(DbKellyCakesContext context)
        {
            _context = context;
        }

        [HttpPost("adicionar")]
        public async Task<IActionResult> AdicionarAoCarrinho(int idBolo)
        {
          
            var usuario = HttpContext.Session.GetString("Idusado");

            if (usuario == null)
                return Unauthorized("É necessário estar logado para adicionar ao carrinho.");

            int idUsuario = int.Parse(usuario);

            // Verifica se o bolo existe
            var bolo = await _context.Bolos
                .FirstOrDefaultAsync(b => b.IdBolo == idBolo);

            if (bolo == null)
                return NotFound("Bolo não encontrado.");

            // Procura o carrinho do usuário
            var carrinho = await _context.Carrinhos
                .FirstOrDefaultAsync(c => c.FkUsuarioIdUsuario == idUsuario);

            // Se não existir, cria um
            if (carrinho == null)
            {
                carrinho = new Carrinho
                {
                    FkUsuarioIdUsuario = idUsuario
                };

                _context.Carrinhos.Add(carrinho);

                await _context.SaveChangesAsync();
            }

            // Verifica se esse bolo já está no carrinho
            var item = await _context.ItemCarrinhos
                .FirstOrDefaultAsync(i =>
                    i.FkCarrinhoIdCarrinho == carrinho.IdCarrinho &&
                    i.FkBoloIdBolo == idBolo);

            if (item != null)
            {
                // Se já existe, aumenta a quantidade
                item.Quantidade++;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    mensagem = "Quantidade do bolo atualizada.",
                    item.IdItemCarrinho,
                    item.Quantidade
                });
            }

            // Se não existe, adiciona um novo item
            item = new ItemCarrinho
            {
                FkCarrinhoIdCarrinho = carrinho.IdCarrinho,
                FkBoloIdBolo = idBolo,
                Quantidade = 1
            };

            _context.ItemCarrinhos.Add(item);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Bolo adicionado ao carrinho.",
                item.IdItemCarrinho,
                item.FkBoloIdBolo,
                item.Quantidade
            });
        }

        [HttpGet]
        public async Task<IActionResult> MeuCarrinho()
        {
            var usuario = HttpContext.Session.GetString("Idusado");

            if (usuario == null)
                return Unauthorized("É necessário estar logado.");

            int idUsuario = int.Parse(usuario);

            var carrinho = await _context.Carrinhos
                .Include(c => c.ItemCarrinhos)
                    .ThenInclude(i => i.FkBoloIdBoloNavigation)
                .FirstOrDefaultAsync(c => c.FkUsuarioIdUsuario == idUsuario);

            if (carrinho == null)
            {
                return Ok(new
                {
                    idCarrinho = (int?)null,
                    itens = new List<object>(),
                    total = 0
                });
            }

            var itens = carrinho.ItemCarrinhos.Select(item => new
            {
                idItemCarrinho = item.IdItemCarrinho,
                quantidade = item.Quantidade,

                bolo = new
                {
                    idBolo = item.FkBoloIdBoloNavigation.IdBolo,
                    preco = item.FkBoloIdBoloNavigation.Preco,
                    peso = item.FkBoloIdBoloNavigation.Peso,
                    tipoCobertura = item.FkBoloIdBoloNavigation.TipoCobertura,
                    decoracao = item.FkBoloIdBoloNavigation.Decoracao,
                    fotoReferencia = item.FkBoloIdBoloNavigation.FotoReferencia,
                    observacao = item.FkBoloIdBoloNavigation.Observacao
                },

                subtotal =
                    (item.FkBoloIdBoloNavigation.Preco ?? 0) * item.Quantidade
            }).ToList();

            var total = itens.Sum(i => i.subtotal);

            return Ok(new
            {
                idCarrinho = carrinho.IdCarrinho,
                itens,
                total
            });
        }
        
    }
}