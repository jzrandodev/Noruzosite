---
lang: es
key: alameda-family
order: 2
kind: system
title: Un sistema de recordatorios que baja las ausencias sin sumar llamadas
clinic: Alameda Family Health
place: Sunset Park, Brooklyn
summary: Reservas bilingües, recordatorios por WhatsApp y respuesta automática a llamadas perdidas para una clínica familiar donde el teléfono no para y cada cita vacía cuesta dinero de verdad.
highlights:
  - Recordatorios en el idioma de cada paciente, por WhatsApp o texto
  - Confirmar o cambiar la cita con un toque
  - Cada llamada perdida recibe un mensaje con enlace para reservar
deliverables:
  - Recordatorios 48 horas y 2 horas antes de cada cita
  - Respuesta a llamadas perdidas en ES y EN
  - Flujo para cambiar la cita que libera el horario
  - Vista de confirmaciones del día para la recepción
  - Mensajes escritos para los dos idiomas
measure:
  - Tasa de ausencias, antes y después
  - Llamadas perdidas que terminan en cita
  - Tiempo de la recepción dedicado a llamar para recordar citas
---

## La situación

Alameda Family Health es una clínica familiar ficticia en Sunset Park, con tres médicos y dos personas en recepción. Imagina una clínica donde el teléfono suena toda la mañana, la mitad de las llamadas va al buzón de voz, y cada ausencia es un horario vacío que otra persona necesitaba.

La recepción intenta llamar a todos el día anterior. Llega a la mitad, como mucho. Los mensajes de voz en inglés no los responden los pacientes que prefieren el español. Y cuando un paciente nuevo llama a la hora del almuerzo y nadie atiende, simplemente llama a la siguiente clínica de la lista.

## El sistema

**1. Llamada perdida, mensaje al instante.** Cuando nadie atiende, quien llamó recibe un texto en menos de un minuto, en español o inglés según el historial del número o su primera respuesta: "Perdón, no pudimos atenderte. Reserva aquí o responde y te llamamos." El paciente que estaba por llamar a otra clínica tiene un motivo para quedarse.

**2. Recordatorios que la gente lee.** 48 horas antes, un mensaje por WhatsApp (o SMS si lo prefiere) en el idioma del paciente con dos botones: Confirmar o Cambiar. Dos horas antes, un aviso corto con la dirección y un enlace al mapa.

**3. Cambiar la cita llena el hueco.** Si el paciente toca Cambiar, elige otro horario en el momento y el horario liberado queda disponible para alguien en lista de espera. La recepción no tiene que hacer nada.

**4. Una sola pantalla para la recepción.** Una vista simple de las citas del día: confirmadas, sin confirmar, reprogramadas. El equipo solo llama a los pocos que nunca respondieron.

## Privacidad desde el diseño

Los mensajes nunca incluyen diagnósticos, resultados ni el motivo de la visita. Solo la hora, el lugar y los botones. El sistema funciona con proveedores de mensajería y agenda que firman un Business Associate Agreement de HIPAA, y los historiales siguen en el sistema que la clínica ya usa. Nos conectamos, no copiamos.

## Decisiones de diseño que vale la pena destacar

- WhatsApp primero, SMS como respaldo. Para muchas familias latinas WhatsApp es la forma principal de comunicarse, y ahí los mensajes se leen.
- Los mensajes los escribe una persona en cada idioma, no un traductor. "Tu cita es mañana" se siente muy distinto a una traducción automática rígida.
- Dos botones, nunca "responde SÍ para confirmar". Menos pasos, menos errores.
- La recepción puede cambiar el idioma o el canal de cualquier paciente con un clic, porque el sistema a veces se va a equivocar.
