using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class Cartao
{
    public string? NumCartao { get; set; }

    public DateOnly? DtaVencimento { get; set; }

    public int? Codigo { get; set; }

    public string? NomeCartao { get; set; }

    public int Id { get; set; }

    public int? FkUsuarioIdUsuario { get; set; }

    public string Bandeira { get; set; } = null!;

    public virtual ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}
