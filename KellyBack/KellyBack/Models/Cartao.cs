using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

[Table("cartao")]
[Index("NumCartao", "Codigo", Name = "UQ__cartao__82CF3CC81F6C845F", IsUnique = true)]
public partial class Cartao
{
    [Column("num_cartao")]
    [StringLength(100)]
    [Unicode(false)]
    public string? NumCartao { get; set; }

    [Column("dta_vencimento")]
    public DateOnly? DtaVencimento { get; set; }

    [Column("codigo")]
    public int? Codigo { get; set; }

    [Column("nome_cartao")]
    [StringLength(100)]
    [Unicode(false)]
    public string? NomeCartao { get; set; }

    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("fk_usuario_id_usuario")]
    public int? FkUsuarioIdUsuario { get; set; }
}
