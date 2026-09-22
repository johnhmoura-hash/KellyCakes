(() => {

    // =====================================================
    // CONFIGURAÇÕES DOS BOLOS PADRÃO
    // =====================================================

    const defaultCakes = [
        {
            title: "Vintage",
            description: "Delicado, com acabamentos clássicos e cheio de charme.",
            image: "img/boloVintage.png",
            model: "vintage"
        },

        {
            title: "Romântico floral",
            description: "Uma escolha suave para momentos especiais e celebrações.",
            image: "img/boloflores.png",
            model: "flores"
        },

        {
            title: "Minimalista",
            description: "Visual limpo e elegante, pronto para receber seu toque.",
            image: "img/bolominimalista.png",
            model: "minimalista"
        },

        {
          title: "Temático",
          description: "Personalizado para festas e momentos especiais.",
          image: "img/boloTematico.png",
          model: "tematico"
        }
    ];


    // =====================================================
    // BUSCAR BOLOS PERSONALIZADOS
    // =====================================================

    let customCakes = [];

    try {
        customCakes = JSON.parse(
            localStorage.getItem("kelly-cakes-catalog") || "[]"
        );
    } catch (error) {
        customCakes = [];
    }


    // =====================================================
    // FUNÇÕES AUXILIARES
    // =====================================================

    // Evita problemas caso o texto tenha caracteres especiais
    const safe = (value = "") => {
        return String(value).replace(
            /[&<>"']/g,
            (character) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[character]
        );
    };


    // Formata valores para Real brasileiro
    const money = (value) => {
        return Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    };


    // =====================================================
    // JUNTAR BOLOS PADRÃO + BOLOS PERSONALIZADOS
    // =====================================================

    const allCakes = [
        ...defaultCakes,
        ...customCakes
    ];

    // =====================================================
    // GERAR OS CARDS
    // =====================================================

    const catalogGrid = document.querySelector("#catalog-grid");

    catalogGrid.innerHTML = allCakes
        .map((item) => {

            // Mostra o preço somente se o bolo possuir preço
            const price = item.price
                ? `<small>A partir de ${money(item.price)}</small>`
                : "";

            // Link para o montador de bolos
            const link = `montarBolo.html?modelo=${encodeURIComponent(
                item.model || "personalizado"
            )}`;

            return `
                <article class="kc-catalog-card">

                    <img 
                        src="${item.image}" 
                        alt="${safe(item.title)}"
                    >

                    <h2>
                        ${safe(item.title)}
                    </h2>

                    <p>
                        ${safe(item.description)}
                    </p>

                    ${price}

                    <a 
                        class="kc-primary" 
                        href="${link}"
                    >
                        Escolher e alterar
                    </a>

                </article>
            `;
        })
        .join("");

})();