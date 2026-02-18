import { api } from './api.js';
import { renderList, renderForm, renderEmpty, renderDashboardModal, renderChatButton, renderChatPanel } from './ui.js';

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

let contacts = [];
let editingId = null;

export async function initApp() {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = `
    <div class="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <header class="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-semibold text-red-800">Mini CRM</h1>
          <p class="text-red-600 text-sm mt-1">Contactos</p>
        </div>
        <button type="button" id="open-dashboard" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
          Dashboard
        </button>
      </header>
      <main class="space-y-6">
        <section id="list-section"></section>
        <section id="form-section"></section>
      </main>
      <div id="modal-container"></div>
      <div id="chat-container"></div>
    </div>
  `;

  const listSection = root.querySelector('#list-section');
  const formSection = root.querySelector('#form-section');
  const modalContainer = root.querySelector('#modal-container');

  function openDashboard() {
    const stats = {
      total: contacts.length,
      withCompany: contacts.filter((c) => c.empresa?.trim()).length,
      recent: [...contacts].slice(0, 5),
    };
    modalContainer.innerHTML = renderDashboardModal(stats);
    modalContainer.querySelector('#dashboard-panel')?.addEventListener('click', (e) => e.stopPropagation());
    modalContainer.querySelector('#dashboard-close')?.addEventListener('click', closeDashboard);
    modalContainer.querySelector('#dashboard-backdrop')?.addEventListener('click', closeDashboard);
    document.addEventListener('keydown', onDashboardEscape);
  }

  function closeDashboard() {
    modalContainer.innerHTML = '';
    document.removeEventListener('keydown', onDashboardEscape);
  }

  function onDashboardEscape(e) {
    if (e.key === 'Escape') closeDashboard();
  }

  root.querySelector('#open-dashboard')?.addEventListener('click', openDashboard);

  async function load() {
    listSection.innerHTML = '<p class="text-red-600 text-sm">Cargando…</p>';
    try {
      contacts = await api.contacts.list();
      listSection.innerHTML = contacts.length ? renderList(contacts, onEdit, onDelete) : renderEmpty();
    } catch (e) {
      listSection.innerHTML = `<p class="text-red-600 font-medium">${escapeHtml(e.message)}</p>`;
    }
  }

  listSection.addEventListener('click', (e) => {
    const id = e.target.dataset?.edit ?? e.target.dataset?.delete;
    if (!id) return;
    if (e.target.dataset.edit) onEdit(id);
    else if (e.target.dataset.delete) onDelete(id);
  });

  function onEdit(id) {
    editingId = id;
    const c = contacts.find((x) => x._id === id);
    formSection.innerHTML = renderForm(c, submitForm, cancelForm);
  }

  function cancelForm() {
    editingId = null;
    formSection.innerHTML = renderForm(null, submitForm, cancelForm);
  }

  async function onDelete(id) {
    if (!confirm('¿Eliminar contacto?')) return;
    try {
      await api.contacts.delete(id);
      await load();
      if (editingId === id) cancelForm();
    } catch (e) {
      alert(e.message);
    }
  }

  async function submitForm(data) {
    const payload = {
      nombre: String(data.nombre).trim(),
      email: String(data.email).trim(),
      telefono: data.telefono?.trim() || undefined,
      empresa: data.empresa?.trim() || undefined,
      domicilio: data.domicilio?.trim() || undefined,
      notas: data.notas?.trim() || undefined,
    };
    try {
      if (editingId) {
        await api.contacts.update(editingId, payload);
        editingId = null;
      } else {
        await api.contacts.create(payload);
      }
      formSection.innerHTML = renderForm(null, submitForm, cancelForm);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  const chatContainer = root.querySelector('#chat-container');
  let chatOpen = false;
  let chatMessages = [];
  let chatLoading = false;
  const chatSessionId = crypto.randomUUID?.() ?? `s-${Date.now()}`;

  function openChat() {
    chatOpen = true;
    chatContainer.innerHTML = renderChatButton() + renderChatPanel(chatMessages, chatLoading);
    chatContainer.querySelector('#chat-panel').scrollIntoView({ behavior: 'smooth' });
    const messagesEl = chatContainer.querySelector('#chat-messages');
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    chatContainer.querySelector('#chat-toggle')?.addEventListener('click', closeChat);
    chatContainer.querySelector('#chat-close')?.addEventListener('click', closeChat);
    chatContainer.querySelector('#chat-form')?.addEventListener('submit', onChatSubmit);
    chatContainer.querySelector('#chat-input')?.focus();
  }

  function closeChat() {
    chatOpen = false;
    chatContainer.innerHTML = renderChatButton();
    chatContainer.querySelector('#chat-toggle')?.addEventListener('click', openChat);
  }

  function updateChatUI() {
    const panel = chatContainer.querySelector('#chat-panel');
    if (!panel) return;
    const messagesEl = chatContainer.querySelector('#chat-messages');
    const wasAtBottom = messagesEl ? messagesEl.scrollHeight - messagesEl.scrollTop <= messagesEl.clientHeight + 20 : true;
    panel.outerHTML = renderChatPanel(chatMessages, chatLoading);
    const newMessagesEl = chatContainer.querySelector('#chat-messages');
    if (newMessagesEl) {
      chatContainer.querySelector('#chat-form')?.addEventListener('submit', onChatSubmit);
      if (wasAtBottom) newMessagesEl.scrollTop = newMessagesEl.scrollHeight;
    }
  }

  async function onChatSubmit(e) {
    e.preventDefault();
    const input = chatContainer.querySelector('#chat-input');
    const text = input?.value?.trim();
    if (!text || chatLoading) return;
    chatMessages.push({ role: 'user', content: text });
    if (input) input.value = '';
    chatLoading = true;
    updateChatUI();
    try {
      const { reply: replyContent } = await api.chat.reply({
        messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        sessionId: chatSessionId,
      });
      chatMessages.push({ role: 'assistant', content: replyContent });
    } catch (err) {
      chatMessages.push({ role: 'assistant', content: `Error: ${err.message}` });
    }
    chatLoading = false;
    updateChatUI();
    chatContainer.querySelector('#chat-input')?.focus();
  }

  chatContainer.innerHTML = renderChatButton();
  chatContainer.querySelector('#chat-toggle')?.addEventListener('click', openChat);

  formSection.innerHTML = renderForm(null, submitForm, cancelForm);
  formSection.addEventListener('submit', (e) => {
    if (e.target.id !== 'contact-form') return;
    e.preventDefault();
    const fd = new FormData(e.target);
    submitForm({
      nombre: fd.get('nombre'),
      email: fd.get('email'),
      telefono: fd.get('telefono') || undefined,
      empresa: fd.get('empresa') || undefined,
      domicilio: fd.get('domicilio') || undefined,
      notas: fd.get('notas') || undefined,
    });
  });
  formSection.addEventListener('click', (e) => {
    if (e.target.id === 'cancel-btn') cancelForm();
  });
  await load();
}
