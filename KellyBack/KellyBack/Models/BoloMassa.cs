using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class BoloMassa
{
    public int IdBoloMassa { get; set; }

    public int FkBoloIdBolo { get; set; }

    public int FkMassaIdMassa { get; set; }

    public int NumeroAndar { get; set; }

    public virtual Bolo FkBoloIdBoloNavigation { get; set; } = null!;

    public virtual TipoMassa FkMassaIdMassaNavigation { get; set; } = null!;
}
