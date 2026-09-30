using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class Ingrediente
{
    public int? FkSaborRecheioIdRecheio { get; set; }

    public int? FkBoloIdBolo { get; set; }

    public int? FkTipoMassaIdMassa { get; set; }
}
