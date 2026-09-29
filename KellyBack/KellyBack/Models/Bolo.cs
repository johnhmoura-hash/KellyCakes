using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

[Table("bolo")]
public partial class Bolo
{
    [Key]
    [Column("id_bolo")]
    public int IdBolo { get; set; }

    [Column("preco")]
    public int? Preco { get; set; }

    [Column("peso")]
    public int? Peso { get; set; }

    [Column("tipo_cobertura")]
    [StringLength(100)]
    [Unicode(false)]
    public string? TipoCobertura { get; set; }

    [Column("decoracao")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Decoracao { get; set; }

    [Column("foto_referencia")]
    [StringLength(255)]
    public string? FotoReferencia { get; set; }

    [Column("observacao")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Observacao { get; set; }
}
