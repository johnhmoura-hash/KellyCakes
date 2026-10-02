using KellyBack.Data;
using KellyBack.DTOs;
using KellyBack.Models;
using Microsoft.AspNetCore.Mvc;

namespace KellyBack.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BoloController: ControllerBase
    {
        private readonly DbKellyCakesContext _context;

        public BoloController(DbKellyCakesContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CriarObjeto([FromForm] CriarBoloDTO dados)
        {
            // Validação dos andares
            if (dados.Andares < 1 || dados.Andares > 3)
            {
                return BadRequest("O bolo deve ter de 1 a 3 andares.");
            }

            // Quantidade de massas
            if (dados.Massas.Count != dados.Andares)
            {
                return BadRequest(
                    $"Um bolo de {dados.Andares} andar(es) precisa de " +
                    $"{dados.Andares} massa(s)."
                );
            }

            // Quantidade de recheios
            int quantidadeRecheios = dados.Andares * 2;

            if (dados.Recheios.Count != quantidadeRecheios)
            {
                return BadRequest(
                    $"Um bolo de {dados.Andares} andar(es) precisa de " +
                    $"{quantidadeRecheios} recheio(s)."
                );
            }

            // Cria o bolo
            var bolo = new Bolo
            {
                Preco = dados.Preco,
                Peso = dados.Peso,
                TipoCobertura = dados.TipoCobertura,
                Decoracao = dados.Decoracao,
                Observacao = dados.Observacao
            };

            // Upload da foto
            if (dados.ArquivoFoto != null)
            {
                var nomeArquivo =
                    Guid.NewGuid().ToString() +
                    Path.GetExtension(dados.ArquivoFoto.FileName);

                var caminho = Path.Combine(
                    "wwwroot/Uploads",
                    nomeArquivo
                );

                using (var stream = new FileStream(caminho, FileMode.Create))
                {
                    await dados.ArquivoFoto.CopyToAsync(stream);
                }

                bolo.FotoReferencia = nomeArquivo;
            }

            // Salva o bolo primeiro
            _context.Bolos.Add(bolo);

            await _context.SaveChangesAsync();


            // Relaciona as massas
            for (int i = 0; i < dados.Massas.Count; i++)
            {
                var boloMassa = new BoloMassa
                {
                    FkBoloIdBolo = bolo.IdBolo,
                    FkMassaIdMassa = dados.Massas[i],
                    NumeroAndar = i + 1
                };

                _context.BoloMassas.Add(boloMassa);
            }


            // Relaciona os recheios
            for (int i = 0; i < dados.Recheios.Count; i++)
            {
                var boloRecheio = new BoloRecheio
                {
                    FkBoloIdBolo = bolo.IdBolo,
                    FkRecheioIdRecheio = dados.Recheios[i],
                    NumeroAndar = (i/2) + 1
                };

                _context.BoloRecheios.Add(boloRecheio);
            }
            await _context.SaveChangesAsync();

            return Created("", new
            {
                mensagem = "Bolo criado com sucesso.",
                idBolo = bolo.IdBolo,
                massas = dados.Massas,
                recheios = dados.Recheios
            });
        }

        [HttpGet]
        public IActionResult BuscaObjetoPerfil()
        {
            var bolo = _context.Bolos.ToList();

            for (int i = 0; i < bolo.Count; i++)
            {

                var pastaBase = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                var caminho = Path.Combine(pastaBase, bolo[i].FotoReferencia);
                var nomeArquivo = Path.GetFileName(bolo[i].FotoReferencia);
                bolo[i].FotoReferencia = $"{Request.Scheme}://{Request.Host}/uploads/{nomeArquivo}";
            }
            return Ok(bolo);
        }
    }
}
