using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

[Table("usuario")]
[Index("Cpf", "Senha", Name = "UQ__usuario__F5BB7FF7B154FDFC", IsUnique = true)]
public partial class Usuario
{
    [Key]
    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Column("cpf")]
    [StringLength(14)]
    public string? Cpf { get; set; }

    [Column("nome")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Nome { get; set; }

    [Column("email")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Email { get; set; }

    [Column("telefone")]
    [StringLength(15)]
    [Unicode(false)]
    public string? Telefone { get; set; }

    [Column("senha")]
    [StringLength(100)]
    public string? Senha { get; set; }
}
