export enum AppointmentErrors {
  SLOT_TAKEN = 'Este horario ya fue reservado por otro usuario',
  COULD_NOT_BOOK = 'No se pudo realizar la reserva',
  APPOINTMENT_NOT_FOUND = 'Cita no encontrada',
  PENDING_LIMIT_REACHED = 'Has alcanzado el límite de citas pendientes para esta tienda.',
  CANNOT_EDIT = 'No tienes permiso para editar esta cita',
}
