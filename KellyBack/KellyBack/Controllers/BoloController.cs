using KellyBack.Data;
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
        public async Task<IActionResult> CriarObjeto([FromForm]Bolo bolo)
        {

            if (bolo.ArquivoFoto != null)
            {
                var nomeArquivo = Guid.NewGuid().ToString() + Path.GetExtension(bolo.ArquivoFoto.FileName);

                var caminho = Path.Combine("wwwroot/Uploads", nomeArquivo);

                using (var stream = new FileStream(caminho, FileMode.Create))
                {
                    await bolo.ArquivoFoto.CopyToAsync(stream);
                }

                bolo.FotoReferencia = nomeArquivo;

            }
            _context.Add(bolo);
            _context.SaveChanges();
            return Created("Teste", bolo);
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
