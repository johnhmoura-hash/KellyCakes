using KellyBack.Data;
using KellyBack.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PedidoController : ControllerBase
    {
        private readonly DbKellyCakesContext _context;

        public PedidoController(DbKellyCakesContext context)
        {
            _context = context;
        }

        [HttpPost("finalizar")]
        public async Task<IActionResult> FinalizarPedido(
            string formaPagamento,
            int? idCartao)
        {
            // Verifica se o usuário está logado
            var usuario = HttpContext.Session.GetString("Idusado");

            if (usuario == null)
                return Unauthorized("É necessário estar logado para finalizar o pedido.");

            int idUsuario = int.Parse(usuario);

            // Verifica a forma de pagamento
            if (string.IsNullOrWhiteSpace(formaPagamento))
                return BadRequest("Informe a forma de pagamento.");

            // Se for cartão, precisa informar o cartão
            if (formaPagamento.ToLower() == "cartão" ||
                formaPagamento.ToLower() == "cartao")
            {
                if (idCartao == null)
                    return BadRequest("Informe o cartão utilizado.");

                // Verifica se o cartão pertence ao usuário
                var cartao = await _context.Cartaos
                    .FirstOrDefaultAsync(c =>
                        c.Id_cartao == idCartao &&
                        c.FkUsuarioIdUsuario == idUsuario);

                if (cartao == null)
                    return BadRequest("Cartão não encontrado ou não pertence ao usuário.");
            }
            else
            {
                // Para Pix, dinheiro etc., não deve existir cartão
                idCartao = null;
            }

            // Busca o carrinho do usuário
            var carrinho = await _context.Carrinhos
                .Include(c => c.ItemCarrinhos)
                    .ThenInclude(i => i.FkBoloIdBoloNavigation)
                .FirstOrDefaultAsync(c =>
                    c.FkUsuarioIdUsuario == idUsuario);

            if (carrinho == null)
                return BadRequest("Carrinho não encontrado.");

            // Verifica se o carrinho está vazio
            if (!carrinho.ItemCarrinhos.Any())
                return BadRequest("O carrinho está vazio.");

            // Cria o pedido
            var pedido = new Pedido
            {
                FkUsuarioIdUsuario = idUsuario,

                // Funcionário ainda não foi definido
                FkFuncionarioIdFuncionario = null,

                StatusPedido = "Pendente",

                DataPedido = DateOnly.FromDateTime(DateTime.Now),

                FormaPagamento = formaPagamento,

                FkCartaoIdCartao = idCartao
            };

            _context.Pedidos.Add(pedido);

            // Salva para gerar o IdPedido
            await _context.SaveChangesAsync();

            // Copia os produtos do carrinho para o pedido
            foreach (var item in carrinho.ItemCarrinhos)
            {
                var itemPedido = new ItemPedido
                {
                    FkPedidoIdPedido = pedido.IdPedido,

                    FkBoloIdBolo = item.FkBoloIdBolo,

                    Quantidade = item.Quantidade,

                    // Guarda o preço no momento da compra
                    PrecoUnitario =
                        item.FkBoloIdBoloNavigation.Preco ?? 0
                };

                _context.ItemPedidos.Add(itemPedido);
            }

            await _context.SaveChangesAsync();

            // Limpa o carrinho
            _context.ItemCarrinhos.RemoveRange(carrinho.ItemCarrinhos);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Pedido realizado com sucesso.",
                idPedido = pedido.IdPedido,
                status = pedido.StatusPedido,
                data = pedido.DataPedido,
                formaPagamento = pedido.FormaPagamento,
                idCartao = pedido.FkCartaoIdCartao
            });
        }

        [HttpGet("ultimo")]
        public async Task<IActionResult> ObterUltimoPedido()
        {
            // Recupera o ID do usuário pela sessão
            var idUsuario = HttpContext.Session.GetInt32("Idusado");

            if (idUsuario == null)
            {
                return Unauthorized(new
                {
                    mensagem = "Você precisa estar logado para consultar seu pedido."
                });
            }

            // Busca o pedido mais recente do usuário, incluindo os bolos
            var pedido = await _context.Pedidos
                .Where(p => p.FkUsuarioIdUsuario == idUsuario.Value)
                .Include(p => p.ItemPedidos)
                    .ThenInclude(i => i.FkBoloIdBoloNavigation)
                .OrderByDescending(p => p.DataPedido)
                .ThenByDescending(p => p.IdPedido)
                .FirstOrDefaultAsync();

            if (pedido == null)
            {
                return NotFound(new
                {
                    mensagem = "Nenhum pedido foi encontrado."
                });
            }

            // Monta a lista de itens do pedido
            var itens = pedido.ItemPedidos.Select(item =>
            {
                var bolo = item.FkBoloIdBoloNavigation;

                var precoUnitario = item.PrecoUnitario;
                var quantidade = item.Quantidade;

                return new
                {
                    idBolo = item.FkBoloIdBolo,
                    nome = "Bolo personalizado",
                    preco = precoUnitario,
                    quantidade = quantidade,
                    subtotal = precoUnitario * quantidade,
                    peso = bolo?.Peso,
                    tipoCobertura = bolo?.TipoCobertura,
                    decoracao = bolo?.Decoracao,
                    fotoReferencia = bolo?.FotoReferencia,
                    observacao = bolo?.Observacao
                };
            }).ToList();

            // Calcula o valor total do pedido
            var total = itens.Sum(item => item.subtotal);

            // Retorna os dados para o resumo do pedido
            return Ok(new
            {
                idPedido = pedido.IdPedido,
                statusPedido = pedido.StatusPedido,
                dataPedido = pedido.DataPedido,
                formaPagamento = pedido.FormaPagamento,
                idCartao = pedido.FkCartaoIdCartao,
                itens = itens,
                total = total
            });
        }
    }
}