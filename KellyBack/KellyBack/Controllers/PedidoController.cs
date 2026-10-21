
using KellyBack.Data;
using KellyBack.Models;
using KellyBack.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;


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

        // Aceita o formato de sessão usado no login.
        private bool TentarObterUsuario(out int idUsuario)
        {
            idUsuario = 0;

            try
            {
                var idTexto = HttpContext.Session.GetString("Idusado");

                if (int.TryParse(idTexto, out idUsuario))
                    return true;
            }
            catch
            {
                // A sessão pode ter sido gravada como inteiro.
            }

            try
            {
                var idInteiro = HttpContext.Session.GetInt32("Idusado");

                if (idInteiro.HasValue)
                {
                    idUsuario = idInteiro.Value;
                    return true;
                }
            }
            catch
            {
                // Sessão inexistente ou em formato incompatível.
            }

            return false;
        }

        // Gera um identificador demonstrativo, não é um Pix bancário.
        private static string GerarPixDemonstrativo(
            int idPedido,
            decimal total)
        {
            return $"DEMO-KELLY-CAKES-PEDIDO-{idPedido}-VALOR-" +
                   total.ToString("F2", CultureInfo.InvariantCulture);
        }

        [HttpPost("finalizar")]
        public async Task<IActionResult> FinalizarPedido(
            [FromQuery] string formaPagamento,
            [FromQuery] int? idCartao)
        {
            if (!TentarObterUsuario(out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensagem = "É necessário estar logado para finalizar o pedido."
                });
            }

            if (string.IsNullOrWhiteSpace(formaPagamento))
                return BadRequest(new { mensagem = "Informe a forma de pagamento." });

            formaPagamento = formaPagamento.Trim().ToLowerInvariant();

            if (formaPagamento == "cartão")
                formaPagamento = "cartao";

            if (formaPagamento != "cartao" &&
                formaPagamento != "pix" &&
                formaPagamento != "boleto")
            {
                return BadRequest(new
                {
                    mensagem = "Forma de pagamento inválida."
                });
            }

            if (formaPagamento == "cartao")
            {
                if (!idCartao.HasValue)
                {
                    return BadRequest(new
                    {
                        mensagem = "Selecione um cartão."
                    });
                }

                var cartao = await _context.Cartaos
                    .FirstOrDefaultAsync(c =>
                        c.Id_cartao == idCartao.Value &&
                        c.FkUsuarioIdUsuario == idUsuario);

                if (cartao == null)
                {
                    return BadRequest(new
                    {
                        mensagem = "Cartão não encontrado ou não pertence ao usuário."
                    });
                }
            }
            else
            {
                idCartao = null;
            }

            var carrinho = await _context.Carrinhos
                .Include(c => c.ItemCarrinhos)
                    .ThenInclude(i => i.FkBoloIdBoloNavigation)
                .FirstOrDefaultAsync(c =>
                    c.FkUsuarioIdUsuario == idUsuario);

            if (carrinho == null || !carrinho.ItemCarrinhos.Any())
            {
                return BadRequest(new
                {
                    mensagem = "O carrinho está vazio."
                });
            }

            var pedido = new Pedido
            {
                FkUsuarioIdUsuario = idUsuario,
                FkFuncionarioIdFuncionario = null,
                StatusPedido = "Pendente",
                DataPedido = DateOnly.FromDateTime(DateTime.Now),
                FormaPagamento = formaPagamento,
                FkCartaoIdCartao = idCartao
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            foreach (var item in carrinho.ItemCarrinhos)
            {
                _context.ItemPedidos.Add(new ItemPedido
                {
                    FkPedidoIdPedido = pedido.IdPedido,
                    FkBoloIdBolo = item.FkBoloIdBolo,
                    Quantidade = item.Quantidade,
                    PrecoUnitario =
                        item.FkBoloIdBoloNavigation.Preco ?? 0
                });
            }

            await _context.SaveChangesAsync();

            var total = carrinho.ItemCarrinhos.Sum(item =>
                (item.FkBoloIdBoloNavigation.Preco ?? 0) *
                item.Quantidade);

            _context.ItemCarrinhos.RemoveRange(carrinho.ItemCarrinhos);
            await _context.SaveChangesAsync();

            string? codigoPix = null;
            string? boletoPdfUrl = null;

            if (formaPagamento == "pix")
            {
                codigoPix = GerarPixDemonstrativo(pedido.IdPedido, total);
            }
            else if (formaPagamento == "boleto")
            {
                boletoPdfUrl = Url.Action(
                    nameof(BaixarBoletoDemonstrativo),
                    "Pedido",
                    new { id = pedido.IdPedido },
                    Request.Scheme);
            }

            return Ok(new
            {
                mensagem = "Pedido demonstrativo registrado com sucesso.",
                idPedido = pedido.IdPedido,
                status = pedido.StatusPedido,
                data = pedido.DataPedido,
                formaPagamento = pedido.FormaPagamento,
                total,
                codigoPix,
                boletoPdfUrl,
                pagamentoDemonstrativo = formaPagamento == "pix" ||
                                         formaPagamento == "boleto"
            });
        }

        [HttpGet("historico")]
        public async Task<IActionResult> ObterHistorico()
        {
            if (!TentarObterUsuario(out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensagem = "Faça login para consultar seu histórico."
                });
            }

            var pedidos = await _context.Pedidos
                .Where(p => p.FkUsuarioIdUsuario == idUsuario)
                .Include(p => p.ItemPedidos)
                    .ThenInclude(i => i.FkBoloIdBoloNavigation)
                .OrderByDescending(p => p.DataPedido)
                .ThenByDescending(p => p.IdPedido)
                .ToListAsync();

            var resultado = pedidos.Select(p =>
            {
                var itens = p.ItemPedidos.Select(item =>
                {
                    var bolo = item.FkBoloIdBoloNavigation;
                    var preco = item.PrecoUnitario;
                    var quantidade = item.Quantidade;

                    return new
                    {
                        idBolo = item.FkBoloIdBolo,
                        nome = "Bolo personalizado",
                        preco,
                        quantidade,
                        subtotal = preco * quantidade,
                        peso = bolo?.Peso,
                        tipoCobertura = bolo?.TipoCobertura,
                        decoracao = bolo?.Decoracao,
                        fotoReferencia = bolo?.FotoReferencia,
                        observacao = bolo?.Observacao
                    };
                }).ToList();

                var total = itens.Sum(i => i.subtotal);
                var forma = (p.FormaPagamento ?? "").ToLowerInvariant();

                return new
                {
                    idPedido = p.IdPedido,
                    status = p.StatusPedido,
                    data = p.DataPedido,
                    formaPagamento = p.FormaPagamento,
                    itens,
                    total,

                    codigoPix = forma == "pix"
                        ? GerarPixDemonstrativo(p.IdPedido, total)
                        : null,

                    boletoPdfUrl = forma == "boleto"
                        ? Url.Action(
                            nameof(BaixarBoletoDemonstrativo),
                            "Pedido",
                            new { id = p.IdPedido },
                            Request.Scheme)
                        : null,

                    pagamentoDemonstrativo =
                        forma == "pix" || forma == "boleto"
                };
            }).ToList();

            return Ok(resultado);
        }

        // Visão operacional da equipe: lista pedidos, cliente e composição.
        [HttpGet("equipe")]
        public async Task<IActionResult> ObterPedidosDaEquipe()
        {
            var pedidos = await _context.Pedidos
                .Include(p => p.ItemPedidos)
                    .ThenInclude(i => i.FkBoloIdBoloNavigation)
                .OrderByDescending(p => p.DataPedido)
                .ThenByDescending(p => p.IdPedido)
                .ToListAsync();

            var usuarios = await _context.Usuarios
                .Where(u => pedidos.Select(p => p.FkUsuarioIdUsuario).Contains(u.IdUsuario))
                .ToDictionaryAsync(u => u.IdUsuario);

            return Ok(pedidos.Select(p =>
            {
                usuarios.TryGetValue(p.FkUsuarioIdUsuario ?? 0, out var usuario);
                var itens = p.ItemPedidos.Select(item => new
                {
                    idBolo = item.FkBoloIdBolo,
                    nome = "Bolo personalizado",
                    quantidade = item.Quantidade,
                    preco = item.PrecoUnitario,
                    subtotal = item.PrecoUnitario * item.Quantidade,
                    peso = item.FkBoloIdBoloNavigation?.Peso,
                    tipoCobertura = item.FkBoloIdBoloNavigation?.TipoCobertura,
                    decoracao = item.FkBoloIdBoloNavigation?.Decoracao,
                    observacao = item.FkBoloIdBoloNavigation?.Observacao
                }).ToList();

                return new
                {
                    idPedido = p.IdPedido,
                    status = p.StatusPedido ?? "Pendente",
                    data = p.DataPedido,
                    formaPagamento = p.FormaPagamento,
                    total = itens.Sum(i => i.subtotal),
                    cliente = usuario == null ? null : new
                    {
                        idUsuario = usuario.IdUsuario,
                        nome = usuario.Nome,
                        email = usuario.Email,
                        telefone = usuario.Telefone,
                        cpf = usuario.Cpf
                    },
                    itens
                };
            }));
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> AtualizarStatus(int id, [FromBody] AtualizarStatusPedido request)
        {
            var statusPermitidos = new[] { "Pendente", "Em produção", "Pronto para retirada", "Finalizado", "Cancelado" };
            if (request == null || !statusPermitidos.Contains(request.Status?.Trim(), StringComparer.OrdinalIgnoreCase))
                return BadRequest(new { mensagem = "Status inválido." });

            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null)
                return NotFound(new { mensagem = "Pedido não encontrado." });

            pedido.StatusPedido = statusPermitidos.First(s => string.Equals(s, request.Status!.Trim(), StringComparison.OrdinalIgnoreCase));
            await _context.SaveChangesAsync();
            return Ok(new { idPedido = pedido.IdPedido, status = pedido.StatusPedido });
        }

        [HttpGet("ultimo")]
        public async Task<IActionResult> ObterUltimoPedido()
        {
            if (!TentarObterUsuario(out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensagem = "Você precisa estar logado para consultar seu pedido."
                });
            }

            var pedido = await _context.Pedidos
                .Where(p => p.FkUsuarioIdUsuario == idUsuario)
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

            var itens = pedido.ItemPedidos.Select(item =>
            {
                var bolo = item.FkBoloIdBoloNavigation;
                var preco = item.PrecoUnitario;
                var quantidade = item.Quantidade;

                return new
                {
                    idBolo = item.FkBoloIdBolo,
                    nome = "Bolo personalizado",
                    preco,
                    quantidade,
                    subtotal = preco * quantidade,
                    peso = bolo?.Peso,
                    tipoCobertura = bolo?.TipoCobertura,
                    decoracao = bolo?.Decoracao,
                    fotoReferencia = bolo?.FotoReferencia,
                    observacao = bolo?.Observacao
                };
            }).ToList();

            var total = itens.Sum(i => i.subtotal);
            var forma = (pedido.FormaPagamento ?? "").ToLowerInvariant();

            return Ok(new
            {
                idPedido = pedido.IdPedido,
                status = pedido.StatusPedido,
                data = pedido.DataPedido,
                formaPagamento = pedido.FormaPagamento,
                itens,
                total,
                codigoPix = forma == "pix"
                    ? GerarPixDemonstrativo(pedido.IdPedido, total)
                    : null,
                boletoPdfUrl = forma == "boleto"
                    ? Url.Action(
                        nameof(BaixarBoletoDemonstrativo),
                        "Pedido",
                        new { id = pedido.IdPedido },
                        Request.Scheme)
                    : null,
                pagamentoDemonstrativo =
                    forma == "pix" || forma == "boleto"
            });
        }

        [HttpGet("{id:int}/boleto.pdf")]
        public async Task<IActionResult> BaixarBoletoDemonstrativo(int id)
        {
            if (!TentarObterUsuario(out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensagem = "Faça login para acessar o boleto."
                });
            }

            var pedido = await _context.Pedidos
                .Where(p =>
                    p.IdPedido == id &&
                    p.FkUsuarioIdUsuario == idUsuario &&
                    p.FormaPagamento != null &&
                    p.FormaPagamento.ToLower() == "boleto")
                .Include(p => p.ItemPedidos)
                .FirstOrDefaultAsync();

            if (pedido == null)
            {
                return NotFound(new
                {
                    mensagem = "Boleto não encontrado para este pedido."
                });
            }

            var total = pedido.ItemPedidos.Sum(i =>
                i.PrecoUnitario * i.Quantidade);

            var dataPedido = pedido.DataPedido.HasValue
    ? pedido.DataPedido.Value.ToString("dd/MM/yyyy")
    : "Não informada";
            var valor = total.ToString(
                "C2", CultureInfo.GetCultureInfo("pt-BR"));

            var linhas = new[]
            {
                "KELLY CAKES - BOLETO DEMONSTRATIVO",
                "SEM VALOR DE COBRANCA - NAO PAGAR",
                "",
                $"Pedido: {pedido.IdPedido}",
                $"Data do pedido: {dataPedido}",
                $"Valor demonstrativo: {valor}",
                $"Status do pedido: {pedido.StatusPedido}",
                "",
                "Este documento foi gerado para demonstracao",
                "academica. Nao e um boleto bancario valido.",
                "Nenhum pagamento sera processado por este PDF."
            };

            var pdf = GerarPdfSimples(linhas);

            return File(
                pdf,
                "application/pdf",
                $"boleto-demonstrativo-pedido-{pedido.IdPedido}.pdf");
        }

        // Gera um PDF simples sem biblioteca externa.
        private static byte[] GerarPdfSimples(string[] linhas)
        {
            var conteudo = new StringBuilder();
            conteudo.AppendLine("BT");
            conteudo.AppendLine("/F1 12 Tf");
            conteudo.AppendLine("50 790 Td");

            for (int i = 0; i < linhas.Length; i++)
            {
                if (i > 0)
                    conteudo.AppendLine("0 -28 Td");

                var texto = linhas[i]
                    .Normalize(NormalizationForm.FormD);

                texto = new string(texto
                    .Where(c => CharUnicodeInfo.GetUnicodeCategory(c)
                        != UnicodeCategory.NonSpacingMark)
                    .ToArray());

                texto = new string(texto
                    .Where(c => c <= 127)
                    .ToArray());

                texto = texto
                    .Replace("\\", "\\\\")
                    .Replace("(", "\\(")
                    .Replace(")", "\\)");

                conteudo.AppendLine($"({texto}) Tj");
            }

            conteudo.AppendLine("ET");

            var stream = conteudo.ToString();
            var objetos = new[]
            {
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
                $"<< /Length {Encoding.ASCII.GetByteCount(stream)} >>\nstream\n{stream}endstream"
            };

            using var memoria = new MemoryStream();
            using var escritor = new StreamWriter(
                memoria, Encoding.ASCII, 1024, leaveOpen: true);

            escritor.NewLine = "\n";
            escritor.Write("%PDF-1.4\n");
            escritor.Flush();

            var offsets = new List<long> { 0 };

            for (int i = 0; i < objetos.Length; i++)
            {
                offsets.Add(memoria.Position);
                escritor.Write($"{i + 1} 0 obj\n{objetos[i]}\nendobj\n");
                escritor.Flush();
            }

            var inicioXref = memoria.Position;

            escritor.Write($"xref\n0 {objetos.Length + 1}\n");
            escritor.Write("0000000000 65535 f \n");

            for (int i = 1; i < offsets.Count; i++)
            {
                escritor.Write($"{offsets[i]:D10} 00000 n \n");
            }

            escritor.Write(
                $"trailer\n<< /Size {objetos.Length + 1} /Root 1 0 R >>\n" +
                $"startxref\n{inicioXref}\n%%EOF");

            escritor.Flush();
            return memoria.ToArray();
        }
    }
}
