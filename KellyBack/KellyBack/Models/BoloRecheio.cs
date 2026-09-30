using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class BoloRecheio
{
    public int IdBoloRecheio { get; set; }

    public int FkBoloIdBolo { get; set; }

    public int FkRecheioIdRecheio { get; set; }

    public int NumeroAndar { get; set; }

    public virtual Bolo FkBoloIdBoloNavigation { get; set; } = null!;

    public virtual SaborRecheio FkRecheioIdRecheioNavigation { get; set; } = null!;
}
