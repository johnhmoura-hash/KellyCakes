using System;
using System.Collections.Generic;
using KellyBack.Models;
using Microsoft.EntityFrameworkCore;

namespace KellyBack.Data;

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

    public virtual DbSet<BoloMassa> BoloMassas { get; set; }

    public virtual DbSet<BoloRecheio> BoloRecheios { get; set; }

    public virtual DbSet<Carrinho> Carrinhos { get; set; }

    public virtual DbSet<Cartao> Cartaos { get; set; }

    public virtual DbSet<Funcionario> Funcionarios { get; set; }

    public virtual DbSet<Ingrediente> Ingredientes { get; set; }

    public virtual DbSet<ItemCarrinho> ItemCarrinhos { get; set; }

    public virtual DbSet<ItemPedido> ItemPedidos { get; set; }

    public virtual DbSet<Pedido> Pedidos { get; set; }

    public virtual DbSet<SaborRecheio> SaborRecheios { get; set; }

    public virtual DbSet<TipoMassa> TipoMassas { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=.\\SQLEXPRESS;Database=DbKellyCakes;User Id=sa;Password=senai.123;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bolo>(entity =>
        {
            entity.HasKey(e => e.IdBolo).HasName("PK__bolo__DAD8DDC03BDECEFD");

            entity.ToTable("bolo");

            entity.Property(e => e.IdBolo).HasColumnName("id_bolo");
            entity.Property(e => e.Decoracao)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("decoracao");
            entity.Property(e => e.FotoReferencia)
                .HasMaxLength(255)
                .IsFixedLength()
                .HasColumnName("foto_referencia");
            entity.Property(e => e.Observacao)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("observacao");
            entity.Property(e => e.Peso).HasColumnName("peso");
            entity.Property(e => e.Preco).HasColumnName("preco");
            entity.Property(e => e.TipoCobertura)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("tipo_cobertura");
        });

        modelBuilder.Entity<BoloMassa>(entity =>
        {
            entity.HasKey(e => e.IdBoloMassa).HasName("PK__BoloMass__09115F8A3CC94C0E");

            entity.ToTable("BoloMassa");

            entity.Property(e => e.IdBoloMassa).HasColumnName("id_bolo_massa");
            entity.Property(e => e.FkBoloIdBolo).HasColumnName("fk_bolo_id_bolo");
            entity.Property(e => e.FkMassaIdMassa).HasColumnName("fk_massa_id_massa");
            entity.Property(e => e.NumeroAndar).HasColumnName("numero_andar");

            entity.HasOne(d => d.FkBoloIdBoloNavigation).WithMany(p => p.BoloMassas)
                .HasForeignKey(d => d.FkBoloIdBolo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BoloMassa__fk_bo__45F365D3");

            entity.HasOne(d => d.FkMassaIdMassaNavigation).WithMany(p => p.BoloMassas)
                .HasForeignKey(d => d.FkMassaIdMassa)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BoloMassa__fk_ma__46E78A0C");
        });

        modelBuilder.Entity<BoloRecheio>(entity =>
        {
            entity.HasKey(e => e.IdBoloRecheio).HasName("PK__BoloRech__6971E17C727E64BA");

            entity.ToTable("BoloRecheio");

            entity.Property(e => e.IdBoloRecheio).HasColumnName("id_bolo_recheio");
            entity.Property(e => e.FkBoloIdBolo).HasColumnName("fk_bolo_id_bolo");
            entity.Property(e => e.FkRecheioIdRecheio).HasColumnName("fk_recheio_id_recheio");
            entity.Property(e => e.NumeroAndar).HasColumnName("numero_andar");

            entity.HasOne(d => d.FkBoloIdBoloNavigation).WithMany(p => p.BoloRecheios)
                .HasForeignKey(d => d.FkBoloIdBolo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BoloReche__fk_bo__49C3F6B7");

            entity.HasOne(d => d.FkRecheioIdRecheioNavigation).WithMany(p => p.BoloRecheios)
                .HasForeignKey(d => d.FkRecheioIdRecheio)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BoloReche__fk_re__4AB81AF0");
        });

        modelBuilder.Entity<Carrinho>(entity =>
        {
            entity.HasKey(e => e.IdCarrinho).HasName("PK__Carrinho__248DFAAEE8244E36");

            entity.ToTable("Carrinho");

            entity.HasIndex(e => e.FkUsuarioIdUsuario, "UQ_Carrinho_Usuario").IsUnique();

            entity.Property(e => e.IdCarrinho).HasColumnName("id_carrinho");
            entity.Property(e => e.FkUsuarioIdUsuario).HasColumnName("fk_usuario_id_usuario");

            entity.HasOne(d => d.FkUsuarioIdUsuarioNavigation).WithOne(p => p.Carrinho)
                .HasForeignKey<Carrinho>(d => d.FkUsuarioIdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Carrinho__fk_usu__36B12243");
        });

        modelBuilder.Entity<Cartao>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__cartao__3213E83FDAFA0FA2");

            entity.ToTable("cartao");

            entity.HasIndex(e => new { e.NumCartao, e.Codigo }, "UQ__cartao__82CF3CC81F6C845F").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Bandeira)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("bandeira");
            entity.Property(e => e.Codigo).HasColumnName("codigo");
            entity.Property(e => e.DtaVencimento).HasColumnName("dta_vencimento");
            entity.Property(e => e.FkUsuarioIdUsuario).HasColumnName("fk_usuario_id_usuario");
            entity.Property(e => e.NomeCartao)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nome_cartao");
            entity.Property(e => e.NumCartao)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("num_cartao");
        });

        modelBuilder.Entity<Funcionario>(entity =>
        {
            entity.HasKey(e => e.IdFuncionario).HasName("PK__funciona__6FBD69C4BFB7AB9D");

            entity.ToTable("funcionario");

            entity.HasIndex(e => new { e.Cpf, e.Telefone }, "UQ__funciona__2A978A889A2985D6").IsUnique();

            entity.Property(e => e.IdFuncionario).HasColumnName("id_funcionario");
            entity.Property(e => e.Cpf)
                .HasMaxLength(14)
                .IsUnicode(false)
                .HasColumnName("cpf");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nome");
            entity.Property(e => e.Telefone)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("telefone");
        });

        modelBuilder.Entity<Ingrediente>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("ingredientes");

            entity.Property(e => e.FkBoloIdBolo).HasColumnName("fk_bolo_id_bolo");
            entity.Property(e => e.FkSaborRecheioIdRecheio).HasColumnName("fk_sabor_recheio_id_recheio");
            entity.Property(e => e.FkTipoMassaIdMassa).HasColumnName("fk_tipo_massa_id_massa");
        });

        modelBuilder.Entity<ItemCarrinho>(entity =>
        {
            entity.HasKey(e => e.IdItemCarrinho).HasName("PK__ItemCarr__CA0352781A887E13");

            entity.ToTable("ItemCarrinho");

            entity.Property(e => e.IdItemCarrinho).HasColumnName("id_item_carrinho");
            entity.Property(e => e.FkBoloIdBolo).HasColumnName("fk_bolo_id_bolo");
            entity.Property(e => e.FkCarrinhoIdCarrinho).HasColumnName("fk_carrinho_id_carrinho");
            entity.Property(e => e.Quantidade)
                .HasDefaultValue(1)
                .HasColumnName("quantidade");

            entity.HasOne(d => d.FkBoloIdBoloNavigation).WithMany(p => p.ItemCarrinhos)
                .HasForeignKey(d => d.FkBoloIdBolo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ItemCarri__fk_bo__3B75D760");

            entity.HasOne(d => d.FkCarrinhoIdCarrinhoNavigation).WithMany(p => p.ItemCarrinhos)
                .HasForeignKey(d => d.FkCarrinhoIdCarrinho)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ItemCarri__fk_ca__3A81B327");
        });

        modelBuilder.Entity<ItemPedido>(entity =>
        {
            entity.HasKey(e => e.IdItemPedido).HasName("PK__ItemPedi__D6E222509AD1AE87");

            entity.ToTable("ItemPedido");

            entity.Property(e => e.IdItemPedido).HasColumnName("id_item_pedido");
            entity.Property(e => e.FkBoloIdBolo).HasColumnName("fk_bolo_id_bolo");
            entity.Property(e => e.FkPedidoIdPedido).HasColumnName("fk_pedido_id_pedido");
            entity.Property(e => e.PrecoUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("preco_unitario");
            entity.Property(e => e.Quantidade)
                .HasDefaultValue(1)
                .HasColumnName("quantidade");

            entity.HasOne(d => d.FkBoloIdBoloNavigation).WithMany(p => p.ItemPedidos)
                .HasForeignKey(d => d.FkBoloIdBolo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ItemPedid__fk_bo__403A8C7D");

            entity.HasOne(d => d.FkPedidoIdPedidoNavigation).WithMany(p => p.ItemPedidos)
                .HasForeignKey(d => d.FkPedidoIdPedido)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ItemPedid__fk_pe__3F466844");
        });

        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.HasKey(e => e.IdPedido).HasName("PK__Pedido__6FF01489AFDFB1D3");

            entity.ToTable("Pedido");

            entity.Property(e => e.IdPedido).HasColumnName("id_pedido");
            entity.Property(e => e.DataPedido).HasColumnName("data_pedido");
            entity.Property(e => e.FkCartaoIdCartao).HasColumnName("fk_cartao_id_cartao");
            entity.Property(e => e.FkFuncionarioIdFuncionario).HasColumnName("fk_funcionario_id_funcionario");
            entity.Property(e => e.FkUsuarioIdUsuario).HasColumnName("fk_usuario_id_usuario");
            entity.Property(e => e.FormaPagamento)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("forma_pagamento");
            entity.Property(e => e.StatusPedido)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("status_pedido");

            entity.HasOne(d => d.FkCartaoIdCartaoNavigation).WithMany(p => p.Pedidos)
                .HasForeignKey(d => d.FkCartaoIdCartao)
                .HasConstraintName("FK_Pedido_Cartao");
        });

        modelBuilder.Entity<SaborRecheio>(entity =>
        {
            entity.HasKey(e => e.IdRecheio).HasName("PK__sabor_re__252B9074C2A607A6");

            entity.ToTable("sabor_recheio");

            entity.Property(e => e.IdRecheio).HasColumnName("id_recheio");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nome");
        });

        modelBuilder.Entity<TipoMassa>(entity =>
        {
            entity.HasKey(e => e.IdMassa).HasName("PK__tipo_mas__7EBF65FB72FE7C45");

            entity.ToTable("tipo_massa");

            entity.Property(e => e.IdMassa).HasColumnName("id_massa");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nome");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__usuario__4E3E04AD3D3FBC0D");

            entity.ToTable("usuario");

            entity.HasIndex(e => new { e.Cpf, e.Senha }, "UQ__usuario__F5BB7FF7B154FDFC").IsUnique();

            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.Cpf)
                .HasMaxLength(14)
                .IsFixedLength()
                .HasColumnName("cpf");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nome");
            entity.Property(e => e.Senha)
                .HasMaxLength(100)
                .IsFixedLength()
                .HasColumnName("senha");
            entity.Property(e => e.Telefone)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("telefone");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
