using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

[Table("sabor_recheio")]
public partial class SaborRecheio
{
    [Key]
    [Column("id_recheio")]
    public int IdRecheio { get; set; }

    [Column("nome")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Nome { get; set; }
}
