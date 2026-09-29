using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

[Table("funcionario")]
[Index("Cpf", "Telefone", Name = "UQ__funciona__2A978A889A2985D6", IsUnique = true)]
public partial class Funcionario
{
    [Column("nome")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Nome { get; set; }

    [Column("cpf")]
    [StringLength(14)]
    [Unicode(false)]
    public string? Cpf { get; set; }

    [Column("telefone")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Telefone { get; set; }

    [Key]
    [Column("id_funcionario")]
    public int IdFuncionario { get; set; }
}
