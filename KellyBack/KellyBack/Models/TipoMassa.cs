using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

[Table("tipo_massa")]
public partial class TipoMassa
{
    [Column("nome")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Nome { get; set; }

    [Key]
    [Column("id_massa")]
    public int IdMassa { get; set; }
}
