using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class ItemPedido
{
    public int IdItemPedido { get; set; }

    public int FkPedidoIdPedido { get; set; }

    public int FkBoloIdBolo { get; set; }

    public int Quantidade { get; set; }

    public decimal PrecoUnitario { get; set; }

    public virtual Bolo FkBoloIdBoloNavigation { get; set; } = null!;

    public virtual Pedido FkPedidoIdPedidoNavigation { get; set; } = null!;
}
