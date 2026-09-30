namespace KellyBack.DTOs
{
    public class CriarBoloDTO
    {
        public int? Preco { get; set; }
        public int? Peso { get; set; }

        public string? TipoCobertura { get; set; }
        public string? Decoracao { get; set; }
        public string? Observacao { get; set; }

        public IFormFile? ArquivoFoto { get; set; }

        public int Andares { get; set; }

        public List<int> Massas { get; set; } = new();
        public List<int> Recheios { get; set; } = new();
    }
}
