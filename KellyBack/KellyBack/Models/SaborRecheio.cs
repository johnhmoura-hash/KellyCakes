using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class SaborRecheio
{
    public int IdRecheio { get; set; }

    public string? Nome { get; set; }

    public virtual ICollection<BoloRecheio> BoloRecheios { get; set; } = new List<BoloRecheio>();
}
