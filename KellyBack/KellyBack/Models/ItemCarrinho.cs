using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class ItemCarrinho
{
    public int IdItemCarrinho { get; set; }

    public int FkCarrinhoIdCarrinho { get; set; }

    public int FkBoloIdBolo { get; set; }

    public int Quantidade { get; set; }

    public virtual Bolo FkBoloIdBoloNavigation { get; set; } = null!;

    public virtual Carrinho FkCarrinhoIdCarrinhoNavigation { get; set; } = null!;
}
