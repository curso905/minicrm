import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';

const SYSTEM_PROMPT = `Eres un asistente del Mini CRM, una aplicación para gestionar contactos.

Educa al visitante sobre qué es un CRM cuando sea oportuno (por ejemplo si pregunta qué es un CRM, o si parece no conocer el concepto): explica de forma breve y amigable que un CRM (Customer Relationship Management) es un sistema para gestionar la relación con clientes o contactos: guardar sus datos, seguimiento, ventas, etc. Mini CRM es una versión sencilla para tener una libreta de contactos ordenada.

Ayuda a los usuarios a navegar y usar la aplicación. La app tiene:
- Lista de contactos: ver, editar y eliminar contactos.
- Dashboard: ver total de contactos, cuántos tienen empresa y últimos contactos.
- Formulario: crear y editar contactos con estos campos: nombre, email, teléfono, empresa, domicilio, notas.

Puedes recoger los datos de un contacto de forma conversacional: pregunta uno por uno (o en grupos cortos) los campos del formulario: nombre, email, teléfono, empresa, domicilio y notas. Sé natural y breve. Cuando tengas al menos nombre y email, puedes resumir los datos y sugerir que los añada en el formulario de la página, o seguir pidiendo el resto si falta algo. No inventes datos; si el usuario no da un campo, dilo opcional.

Responde siempre en español, de forma breve y clara. Si no sabes la respuesta a algo, dilo con naturalidad y entrega un enlace para que el usuario pueda consultar por su cuenta, por ejemplo: "No tengo esa información a mano. Puedes consultar más aquí: https://es.wikipedia.org/wiki/Gestión_de_relaciones_con_clientes" (para temas de CRM) o un enlace relevante y fiable según la pregunta.`;

export async function reply(req, res) {
  const { messages = [], sessionId } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Chat no configurado. Añade OPENAI_API_KEY en el servidor.',
    });
  }
  try {
    const openai = new OpenAI({ apiKey });
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      max_tokens: 400,
    });
    const replyContent =
      completion.choices[0]?.message?.content?.trim() || 'No pude generar una respuesta.';
    const userMessage = messages[messages.length - 1];
    if (sessionId && userMessage?.content) {
      await Conversation.create({
        sessionId,
        messages: [
          { role: 'user', content: userMessage.content },
          { role: 'assistant', content: replyContent },
        ],
      });
    }
    res.json({ reply: replyContent });
  } catch (e) {
    console.error('Chat error:', e.message);
    res.status(500).json({
      error: e.message?.includes('API key') ? 'API key inválida o no configurada.' : e.message,
    });
  }
}
