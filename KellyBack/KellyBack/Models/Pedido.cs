using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class Pedido
{
    public int IdPedido { get; set; }

    public string? StatusPedido { get; set; }

    public DateOnly? DataPedido { get; set; }

    public int? FkFuncionarioIdFuncionario { get; set; }

    public int? FkUsuarioIdUsuario { get; set; }

    public string? FormaPagamento { get; set; }

    public int? FkCartaoIdCartao { get; set; }

    public virtual Cartao? FkCartaoIdCartaoNavigation { get; set; }

    public virtual ICollection<ItemPedido> ItemPedidos { get; set; } = new List<ItemPedido>();
}
