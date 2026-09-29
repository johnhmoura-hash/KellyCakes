using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

[Keyless]
[Table("ingredientes")]
public partial class Ingrediente
{
    [Column("fk_sabor_recheio_id_recheio")]
    public int? FkSaborRecheioIdRecheio { get; set; }

    [Column("fk_bolo_id_bolo")]
    public int? FkBoloIdBolo { get; set; }

    [Column("fk_tipo_massa_id_massa")]
    public int? FkTipoMassaIdMassa { get; set; }
}
