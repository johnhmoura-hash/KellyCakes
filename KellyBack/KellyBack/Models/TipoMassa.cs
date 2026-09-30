using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class TipoMassa
{
    public string? Nome { get; set; }

    public int IdMassa { get; set; }

    public virtual ICollection<BoloMassa> BoloMassas { get; set; } = new List<BoloMassa>();
}
