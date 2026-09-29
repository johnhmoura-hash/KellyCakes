using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Models;

public partial class DbKellyCakesContext : DbContext
{
    public DbKellyCakesContext()
    {
    }

    public DbKellyCakesContext(DbContextOptions<DbKellyCakesContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Bolo> Bolos { get; set; }

    public virtual DbSet<Cartao> Cartaos { get; set; }

    public virtual DbSet<Funcionario> Funcionarios { get; set; }

    public virtual DbSet<Ingrediente> Ingredientes { get; set; }

    public virtual DbSet<Pedido> Pedidos { get; set; }

    public virtual DbSet<SaborRecheio> SaborRecheios { get; set; }

    public virtual DbSet<TipoMassa> TipoMassas { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bolo>(entity =>
        {
            entity.HasKey(e => e.IdBolo).HasName("PK__bolo__DAD8DDC03BDECEFD");

            entity.Property(e => e.FotoReferencia).IsFixedLength();
        });

        modelBuilder.Entity<Cartao>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__cartao__3213E83FDAFA0FA2");
        });

        modelBuilder.Entity<Funcionario>(entity =>
        {
            entity.HasKey(e => e.IdFuncionario).HasName("PK__funciona__6FBD69C4BFB7AB9D");
        });

        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.HasKey(e => e.IdPedido).HasName("PK__Pedido__6FF01489AFDFB1D3");
        });

        modelBuilder.Entity<SaborRecheio>(entity =>
        {
            entity.HasKey(e => e.IdRecheio).HasName("PK__sabor_re__252B9074C2A607A6");
        });

        modelBuilder.Entity<TipoMassa>(entity =>
        {
            entity.HasKey(e => e.IdMassa).HasName("PK__tipo_mas__7EBF65FB72FE7C45");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__usuario__4E3E04AD3D3FBC0D");

            entity.Property(e => e.Cpf).IsFixedLength();
            entity.Property(e => e.Senha).IsFixedLength();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
