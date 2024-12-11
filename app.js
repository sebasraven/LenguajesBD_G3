const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

// Configuración de Express
const app = express();
const port = 3000;

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(express.static('public'));  // Para servir archivos estáticos (HTML, CSS, JS)

// Configuración de la base de datos
const dbConfig = {
  user: 'reserva_tablas', // CAMBIAR USUARIO AL DE LA BD
  password: 'reserva_tablas', // CAMBIAR PASSWORD AL DE LA BD
  connectString: 'localhost:1521/XE'
};

// Ruta para la raíz del servidor
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');  // Sirve el archivo index.html
});

// CRUD para la tabla de clientes
app.get('/clientes', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Consulta para obtener los datos de los clientes
    const query = `
      SELECT 
        C.id_cliente,
        C.nombre,
        C.primer_apellido,
        C.segundo_apellido,
        C.correo,
        C.telefono,
        E.nombre AS nombre_estado
      FROM 
        Clientes C
      JOIN 
        admin_tablas.Estados E ON C.id_estado = E.id_estado
    `;
    const result = await connection.execute(query);

    // Verifica los datos obtenidos
    console.log('Datos obtenidos:', result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error('Error de conexión o consulta:', err);
    res.status(500).send('Error al obtener los clientes');
  } finally {
    // Asegúrate de cerrar la conexión al final
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error al cerrar la conexión:', closeErr);
      }
    }
  }
});

app.post('/clientes', async (req, res) => {
  const { nombre, primer_apellido, segundo_apellido, correo, telefono, id_estado } = req.body;

  if (!nombre || !primer_apellido || !segundo_apellido || !correo || !telefono || !id_estado) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Insertar cliente en la tabla Clientes usando la secuencia seq_clientes para el id_cliente
    await connection.execute(
      `INSERT INTO Clientes (id_cliente, nombre, primer_apellido, segundo_apellido, correo, telefono, id_estado)
       VALUES (seq_clientes.NEXTVAL, :nombre, :primer_apellido, :segundo_apellido, :correo, :telefono, :id_estado)`,
      { nombre, primer_apellido, segundo_apellido, correo, telefono, id_estado }
    );

    // Confirmar la transacción
    await connection.commit();
    await connection.close();

    res.status(201).send('Cliente creado exitosamente');
  } catch (err) {
    console.error('Error al insertar el cliente:', err);
    res.status(500).send('Error al insertar el cliente');
  }
});

app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params; // ID del cliente
  const { nombre, primer_apellido, segundo_apellido, correo, telefono, id_estado } = req.body;

  if (!nombre || !primer_apellido || !segundo_apellido || !correo || !telefono || !id_estado) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Actualizar el cliente en la tabla Clientes
    const result = await connection.execute(
      `UPDATE Clientes
       SET nombre = :nombre, primer_apellido = :primer_apellido, segundo_apellido = :segundo_apellido, correo = :correo, telefono = :telefono, id_estado = :id_estado
       WHERE id_cliente = :id`,
      { nombre, primer_apellido, segundo_apellido, correo, telefono, id_estado, id }
    );

    // Verifica si la actualización fue exitosa
    console.log(`Filas afectadas: ${result.rowsAffected}`);

    // Realizar el commit
    await connection.commit();
    await connection.close();

    res.send('Cliente actualizado correctamente');
  } catch (err) {
    console.error('Error al actualizar el cliente:', err);
    res.status(500).send('Error al actualizar el cliente');
  }
});

app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params; // ID del cliente

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Eliminar el cliente de la tabla Clientes
    const result = await connection.execute(
      `DELETE FROM Clientes WHERE id_cliente = :id`,
      { id }
    );

    // Verifica si la eliminación fue exitosa
    console.log(`Filas afectadas: ${result.rowsAffected}`);

    // Realizar el commit
    await connection.commit();
    await connection.close();

    res.send('Cliente eliminado correctamente');
  } catch (err) {
    console.error('Error al eliminar el cliente:', err);
    res.status(500).send('Error al eliminar el cliente');
  }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});



