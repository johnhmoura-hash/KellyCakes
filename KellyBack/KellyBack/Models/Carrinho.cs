using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class Carrinho
{
    public int IdCarrinho { get; set; }

    public int FkUsuarioIdUsuario { get; set; }

    public virtual Usuario FkUsuarioIdUsuarioNavigation { get; set; } = null!;

    public virtual ICollection<ItemCarrinho> ItemCarrinhos { get; set; } = new List<ItemCarrinho>();
}
