using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

[Table("Pedido")]
public partial class Pedido
{
    [Key]
    [Column("id_pedido")]
    public int IdPedido { get; set; }

    [Column("status_pedido")]
    [StringLength(100)]
    [Unicode(false)]
    public string? StatusPedido { get; set; }

    [Column("data_pedido")]
    public DateOnly? DataPedido { get; set; }

    [Column("fk_funcionario_id_funcionario")]
    public int? FkFuncionarioIdFuncionario { get; set; }

    [Column("fk_usuario_id_usuario")]
    public int? FkUsuarioIdUsuario { get; set; }
}
