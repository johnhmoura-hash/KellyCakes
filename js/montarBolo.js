
const floorOptions = document.querySelectorAll('input[name="andares"]');
const floorFields = document.querySelectorAll('[data-floor]');


// ======================================================
// CONTROLAR OS ANDARES
// ======================================================

function updateAvailableFloors() {

    const selectedFloor = Number(
        document.querySelector('input[name="andares"]:checked')?.value || 0
    );

    floorFields.forEach((group) => {

        const isAvailable =
            !selectedFloor ||
            Number(group.dataset.floor) <= selectedFloor;

        group.classList.toggle('is-inactive', !isAvailable);

        group.querySelectorAll('select, input, textarea')
            .forEach((field) => {

                field.disabled = !isAvailable;

                if (!isAvailable) {
                    field.value = '';
                }

            });
    });
}

floorOptions.forEach((option) => {
    option.addEventListener('change', updateAvailableFloors);
});


// ======================================================
// MODELOS PRONTOS
// ======================================================

const modelo = new URLSearchParams(location.search).get('modelo');

const modelos = {

    vintage: {
        andares: '2',
        cobertura: 'Buttercream',
        decoracao: 'Vintage'
    },

    flores: {
        andares: '1',
        cobertura: 'Chantininho',
        decoracao: 'Flores'
    },

    minimalista: {
        andares: '1',
        cobertura: 'Ganache',
        decoracao: 'Minimalista'
    }

};

if (modelos[modelo]) {

    Object.entries(modelos[modelo]).forEach(([name, value]) => {

        const field = document.querySelector(
            `[name="${name}"][value="${value}"]`
        );

        if (field) {
            field.checked = true;
        }

    });

    updateAvailableFloors();
}


// ======================================================
// FOTO DE REFERÊNCIA
// ======================================================

const photoInput = document.querySelector('#foto-modelo');
const photoPreview = document.querySelector('#foto-modelo-preview');
const photoHelp = document.querySelector('#foto-modelo-ajuda');

photoInput.addEventListener('change', () => {

    const file = photoInput.files[0];

    // Nenhum arquivo selecionado
    if (!file) {

        photoPreview.hidden = true;
        photoPreview.src = '';

        return;
    }


    // Limite de 1 MB
    if (file.size > 1024 * 1024) {

        photoHelp.textContent =
            'Escolha uma imagem de até 1 MB.';

        photoInput.value = '';

        photoPreview.hidden = true;
        photoPreview.src = '';

        return;
    }


    // Mostrar prévia
    const reader = new FileReader();

    reader.addEventListener('load', () => {

        photoPreview.src = reader.result;
        photoPreview.hidden = false;

        photoHelp.textContent =
            `Foto selecionada: ${file.name}`;

    });

    reader.readAsDataURL(file);

});


// ======================================================
// ENVIAR FORMULÁRIO
// ======================================================

document.querySelector('#cake-form').addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();

        const form = event.currentTarget;


        // ==================================================
        // VALIDAR FORMULÁRIO
        // ==================================================

        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }


        // ==================================================
        // 1. ANDARES
        // ==================================================

        const andares = Number(
            document.querySelector(
                'input[name="andares"]:checked'
            )?.value
        );


        // ==================================================
        // 2. PESO
        // ==================================================

        let pesoTotal = 0;

        for (let andar = 1; andar <= andares; andar++) {

            const campoPeso = document.querySelector(
                `[name="peso-${andar}"]`
            );

            if (campoPeso?.value) {
                pesoTotal += Number(campoPeso.value);
            }

        }


        // ==================================================
        // 3. MASSAS
        // ==================================================

        const massas = [];

        for (let andar = 1; andar <= andares; andar++) {

            const campoMassa = document.querySelector(
                `[name="massa-${andar}"]`
            );

            if (!campoMassa?.value) {

                alert(
                    `Selecione a massa do ${andar}º andar.`
                );

                return;
            }

            massas.push(Number(campoMassa.value));

        }


        // ==================================================
        // 4. RECHEIOS
        // ==================================================

        const recheios = [];

        for (let andar = 1; andar <= andares; andar++) {

            const recheio1 = document.querySelector(
                `[name="recheio-${andar}a"]`
            );

            const recheio2 = document.querySelector(
                `[name="recheio-${andar}b"]`
            );


            if (!recheio1?.value || !recheio2?.value) {

                alert(
                    `Selecione os dois recheios do ${andar}º andar.`
                );

                return;
            }


            recheios.push(Number(recheio1.value));
            recheios.push(Number(recheio2.value));

        }


        // ==================================================
        // 5. COBERTURA
        // ==================================================

        const cobertura = document.querySelector(
            'input[name="cobertura"]:checked'
        )?.value;


        // ==================================================
        // 6. DECORAÇÃO
        // ==================================================

        const decoracao = document.querySelector(
            'input[name="decoracao"]:checked'
        )?.value;


        // ==================================================
        // 7. OBSERVAÇÃO
        // ==================================================

        const observacao = document.querySelector(
            '[name="observacao"]'
        )?.value || '';


        // ==================================================
        // 8. PREÇO
        // ==================================================

        let preco = 0;

        if (andares === 1) {
            preco = 120;
        }

        else if (andares === 2) {
            preco = 220;
        }

        else if (andares === 3) {
            preco = 320;
        }


        // ==================================================
        // 9. FORMDATA
        // ==================================================

        const dados = new FormData();

        dados.append('Andares', andares);
        dados.append('Preco', preco);
        dados.append('Peso', pesoTotal);
        dados.append('TipoCobertura', cobertura);
        dados.append('Decoracao', decoracao);
        dados.append('Observacao', observacao);


        // Massas

        massas.forEach((idMassa) => {

            dados.append(
                'Massas',
                idMassa
            );

        });


        // Recheios

        recheios.forEach((idRecheio) => {

            dados.append(
                'Recheios',
                idRecheio
            );

        });


        // ==================================================
        // 10. FOTO
        // ==================================================

        const foto = document.querySelector('#foto-modelo');

        if (foto && foto.files.length > 0) {

            dados.append(
                'ArquivoFoto',
                foto.files[0]
            );

            console.log(
                'Foto enviada:',
                foto.files[0].name
            );

        } else {

            console.log(
                'Nenhuma foto selecionada.'
            );

        }


        // ==================================================
        // 11. VER O QUE ESTÁ SENDO ENVIADO
        // ==================================================

        console.log('========== DADOS ENVIADOS ==========');

        for (const [chave, valor] of dados.entries()) {

            if (valor instanceof File) {

                console.log(
                    chave,
                    valor.name,
                    valor.size,
                    valor.type
                );

            } else {

                console.log(
                    chave,
                    valor
                );

            }

        }


        // ==================================================
        // 12. ENVIAR PARA API
        // ==================================================

        try {

            const response = await fetch(
                'https://localhost:7229/Bolo',
                {
                    method: 'POST',
                    body: dados
                }
            );


            if (!response.ok) {

                const erro = await response.text();

                console.error(
                    'Erro da API:',
                    erro
                );

                alert(
                    'Não foi possível criar o bolo.'
                );

                return;
            }


            // ==================================================
            // 13. RESPOSTA DA API
            // ==================================================

            const resultado =
                await response.json();

            console.log(
                'Bolo criado:',
                resultado
            );


            // Guardar ID do bolo

            sessionStorage.setItem(
                'kelly-bolo-id',
                resultado.idBolo
            );


            // Ir para resumo

            window.location.href =
                'resumoBolo.html';

        }

        catch (error) {

            console.error(
                'Erro:',
                error
            );

            alert(
                'Não foi possível conectar ao servidor.'
            );

        }

    }
);

