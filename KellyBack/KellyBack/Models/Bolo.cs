using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace KellyBack.Models;

public partial class Bolo
{
    public int IdBolo { get; set; }

    public int? Preco { get; set; }

    public int? Peso { get; set; }

    public string? TipoCobertura { get; set; }

    public string? Decoracao { get; set; }

    public string? FotoReferencia { get; set; }

    public string? Observacao { get; set; }

    public virtual ICollection<BoloMassa> BoloMassas { get; set; } = new List<BoloMassa>();

    public virtual ICollection<BoloRecheio> BoloRecheios { get; set; } = new List<BoloRecheio>();

    public virtual ICollection<ItemCarrinho> ItemCarrinhos { get; set; } = new List<ItemCarrinho>();

    public virtual ICollection<ItemPedido> ItemPedidos { get; set; } = new List<ItemPedido>();

    [NotMapped]
    public FormFile? ArquivoFoto { get; set; }
}
