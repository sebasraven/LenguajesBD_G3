const API_URL = 'http://localhost:3000/clientes';

// Cargar clientes al iniciar
const loadClientes = async () => {
    const tableBody = document.getElementById('clientTableBody');
    if (!tableBody) {
        console.error("No se encontró el cuerpo de la tabla de clientes.");
        return;
    }
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevas filas

    try {
        const response = await axios.get(API_URL);
        console.log('Respuesta recibida:', response.data);

        if (Array.isArray(response.data)) {
            response.data.forEach(client => {
                const [
                    id_cliente,
                    nombre,
                    primer_apellido,
                    segundo_apellido,
                    correo,
                    telefono,
                    nombre_estado
                ] = client;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${nombre}</td>
                    <td>${primer_apellido}</td>
                    <td>${segundo_apellido}</td>
                    <td>${correo}</td>
                    <td>${telefono}</td>
                    <td>${nombre_estado}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editClient(${id_cliente}, '${nombre}', '${primer_apellido}', '${segundo_apellido}', '${correo}', '${telefono}', '${nombre_estado}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteClient(${id_cliente})">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            console.error('Los datos recibidos no son un array:', response.data);
        }
    } catch (err) {
        console.error('Error al cargar los clientes:', err);
    }
};

// Manejar formulario de agregar/editar cliente
const addClientForm = document.getElementById('addClientForm');
if (addClientForm) {
    addClientForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const clientId = document.getElementById('clientId').value;
        const nombre = document.getElementById('editNombre').value;
        const primer_apellido = document.getElementById('editPrimerApellido').value;
        const segundo_apellido = document.getElementById('editSegundoApellido').value;
        const correo = document.getElementById('editCorreo').value;
        const telefono = document.getElementById('editTelefono').value;
        const id_estado = document.getElementById('editEstado').value;

        try {
            if (clientId) {
                // Actualizar cliente existente
                await axios.put(`${API_URL}/${clientId}`, {
                    nombre,
                    primer_apellido,
                    segundo_apellido,
                    correo,
                    telefono,
                    id_estado
                });

                // Después de actualizar, asegúrate de resetear el ID oculto
                document.getElementById('clientId').value = '';
            } else {
                // Crear un nuevo cliente
                await axios.post(API_URL, {
                    nombre,
                    primer_apellido,
                    segundo_apellido,
                    correo,
                    telefono,
                    id_estado
                });
            }

            // Resetear el formulario y cerrar el modal
            addClientForm.reset();
            new bootstrap.Modal(document.getElementById('addClientModal')).hide();

            // Recargar la lista de clientes
            loadClientes();
        } catch (err) {
            console.error('Error al guardar el cliente:', err.response ? err.response.data : err);
        }
    });
} else {
    console.error('No se encontró el formulario de agregar/editar cliente.');
}

// Editar cliente
const editClient = (id_cliente, nombre, primer_apellido, segundo_apellido, correo, telefono, id_estado) => {
    document.getElementById('clientId').value = id_cliente; // Campo oculto para ID
    document.getElementById('editNombre').value = nombre; // Campo de nombre de cliente
    document.getElementById('editPrimerApellido').value = primer_apellido; // Campo de primer apellido
    document.getElementById('editSegundoApellido').value = segundo_apellido; // Campo de segundo apellido
    document.getElementById('editCorreo').value = correo; // Campo de correo
    document.getElementById('editTelefono').value = telefono; // Campo de teléfono
    document.getElementById('editEstado').value = id_estado; // Campo de estado

    // Mostrar el modal de edición
    new bootstrap.Modal(document.getElementById('addClientModal')).show();
};

// Eliminar cliente
const deleteClient = async (id_cliente) => {
    try {
        await axios.delete(`${API_URL}/${id_cliente}`);
        loadClientes(); // Recargar la lista de clientes
    } catch (err) {
        console.error('Error al eliminar el cliente:', err.response ? err.response.data : err);
    }
};

// Inicializar carga de clientes
document.addEventListener('DOMContentLoaded', () => {
    loadClientes();
});
