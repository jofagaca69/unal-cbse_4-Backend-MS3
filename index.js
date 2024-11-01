const { Firestore } = require('@google-cloud/firestore');
const functions = require('@google-cloud/functions-framework');

// Inicializa Firestore
const firestore = new Firestore({
  projectId: 'jangol-440021',
  databaseId: 'jangoldb-nosql',
});

// Función HTTP para procesar el pago
functions.http('payment', async (req, res) => {
  if (req.path === '/process-payment' && req.method === 'POST') {
    // Extrae los valores enviados en la petición
    const { id, amount, currency, userId, reservationId } = req.body;

    // Validación de los valores requeridos
    if (!id || !amount || !currency || !userId || !reservationId) {
      return res.status(400).send({ error: 'ID de pago, monto, moneda, usuario y reservación son requeridos' });
    }

    // Determinar aleatoriamente si el pago es exitoso o fallido
    const isSuccess = Math.random() > 0.5; // 50% de probabilidad de éxito
    const status = isSuccess ? 'success' : 'failure';

    // Estructura de datos a almacenar en Firestore
    const paymentData = {
      id,
      status,
      amount,
      currency,
      userId,
      reservationId,
      message: isSuccess ? 'Pago procesado exitosamente' : 'Pago fallido',
      timestamp: Firestore.Timestamp.now(),
    };

    try {
      const paymentsCollection = firestore.collection('payments'); // Cambia el nombre de la colección si es necesario
      await paymentsCollection.add(paymentData);

      // Responde con los datos del pago (estado exitoso o fallido)
      res.status(200).send(paymentData);
    } catch (error) {
      console.error('Error al almacenar el pago en Firestore:', error);
      res.status(500).send({ error: 'Error al procesar el pago' });
    }
  } else {
    res.status(404).send({ error: 'Endpoint no encontrado' });
  }
});
