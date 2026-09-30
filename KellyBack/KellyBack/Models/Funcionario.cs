using System;
using System.Collections.Generic;

namespace KellyBack.Models;

public partial class Funcionario
{
    public string? Nome { get; set; }

    public string? Cpf { get; set; }

    public string? Telefone { get; set; }

    public int IdFuncionario { get; set; }
}
