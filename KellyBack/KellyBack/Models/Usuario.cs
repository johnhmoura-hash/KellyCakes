using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string? Cpf { get; set; }

    public string? Nome { get; set; }

    public string? Email { get; set; }

    public string? Telefone { get; set; }

    public string? Senha { get; set; }

    public virtual Carrinho? Carrinho { get; set; }
}
