document.addEventListener('DOMContentLoaded', function() {
    const ubicacionSelect = document.getElementById('ubicacionTecnica');
    const codigoSapSelect = document.getElementById('codigoSap');
    const fechaInput = document.getElementById('fecha');
    const dataForm = document.getElementById('dataForm');
    const submitButton = document.getElementById('submitButton');

    // Reemplaza esta URL con la URL de tu Web App de Google Apps Script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNkW03OqA-q5xPOZb5u3493Og0-XPMJhAGGuss2W4viDtAk5W5WPZifIbWr2r1KFjn/exec'; // ¡IMPORTANTE!

    // Cargar opciones para Ubicación Técnica
    fetch('ubicaciones.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for ubicaciones.txt');
            }
            return response.text();
        })
        .then(text => {
            const ubicaciones = text.split('\n').filter(line => line.trim() !== '');
            ubicaciones.forEach(ubicacion => {
                const option = document.createElement('option');
                option.value = ubicacion.trim();
                option.textContent = ubicacion.trim();
                ubicacionSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar ubicaciones.txt:', error);
        });

    // Cargar opciones para Código SAP
    fetch('codigos_sap.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for codigos_sap.txt');
            }
            return response.text();
        })
        .then(text => {
            const codigos = text.split('\n').filter(line => line.trim() !== '');
            codigos.forEach(codigo => {
                const option = document.createElement('option');
                option.value = codigo.trim();
                option.textContent = codigo.trim();
                codigoSapSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar codigos_sap.txt:', error);
        });

    // Establecer fecha actual por defecto
    const hoy = new Date();
    const year = hoy.getFullYear(); // Corregido: yyyy a year
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    fechaInput.value = `${year}-${mm}-${dd}`; // Corregido: yyyy a year

    dataForm.addEventListener('submit', function(event) {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando Datos...'; // Texto del botón actualizado

        const formData = new FormData(dataForm);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        data.realizado = document.getElementById('realizado').checked ? 'Sí' : 'No';
        data.cambiar = document.getElementById('cambiar').checked ? 'Sí' : 'No';
        data.requireGrua = document.getElementById('requireGrua').checked ? 'Sí' : 'No';
        data.requireAndamio = document.getElementById('requireAndamio').checked ? 'Sí' : 'No';
        data.horas = data.horas ? parseFloat(data.horas) : null;
        data.hh = data.hh ? parseFloat(data.hh) : null;

        if (!data.ubicacionTecnica || !data.titulo || !data.descripcion) {
            alert('Por favor, complete todos los campos obligatorios (Ubicación, Título, Descripción).');
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Datos'; // Texto del botón actualizado
            return;
        }

        // Enviar los datos a Google Sheets directamente
        sendDataToGoogleSheets(data);
    });

    // La función generateAndDownloadCsv HA SIDO ELIMINADA

    async function sendDataToGoogleSheets(data) {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'URL_DE_TU_GOOGLE_APPS_SCRIPT_WEB_APP') {
            console.warn("URL de Google Apps Script no configurada. No se pueden enviar los datos.");
            alert('El envío a Google Sheets no está configurado. Por favor, contacte al administrador.');
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Datos'; // Texto del botón actualizado
            // dataForm.reset(); // Opcional: resetear el formulario
            // fechaInput.value = `${year}-${mm}-${dd}`; // Restablecer fecha actual // Corregido: yyyy a year
            return;
        }

        const sheetData = {
            ubicacionTecnica: data.ubicacionTecnica,
            fecha: data.fecha,
            titulo: data.titulo,
            descripcion: data.descripcion,
            horas: data.horas,
            hh: data.hh,
            requireGrua: data.requireGrua,
            requireAndamio: data.requireAndamio,
            realizado: data.realizado,
            cambiar: data.cambiar,
            codigoSap: data.codigoSap || ''
        };

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sheetData)
            });

            const result = await response.json();

            if (result.status === "success") {
                alert('Datos enviados a Google Sheets exitosamente.');
                dataForm.reset(); // Resetear el formulario en caso de éxito
                fechaInput.value = `${year}-${mm}-${dd}`; // Restablecer fecha actual // Corregido: yyyy a year
                // También reseteamos los selects a su valor por defecto si es necesario
                ubicacionSelect.value = "";
                if(codigoSapSelect) codigoSapSelect.value = "";

            } else {
                throw new Error(result.message || 'Error desconocido al enviar a Google Sheets.');
            }
        } catch (error) {
            console.error('Error al enviar datos a Google Sheets:', error);
            alert(`Error al enviar datos a Google Sheets: ${error.message}.`);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Datos'; // Texto del botón actualizado
        }
    }
});