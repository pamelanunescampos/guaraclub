// Alternar Tema (Claro / Escuro)
const savedTheme = localStorage.getItem('guaraclub-theme');
if (savedTheme === 'light' || savedTheme === 'dark') {
  document.documentElement.dataset.theme = savedTheme;
}

const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('guaraclub-theme', nextTheme);
  });
}

const searchOpenButtons = document.querySelectorAll('[data-search-open]');
if (searchOpenButtons.length) {
  const searchDialog = document.createElement('dialog');
  searchDialog.className = 'search-dialog';
  searchDialog.setAttribute('aria-labelledby', 'search-dialog-title');
  searchDialog.innerHTML = `
    <h2 id="search-dialog-title">Pesquisar no GuaraClub</h2>
    <form method="dialog">
      <input type="search" name="query" placeholder="O que você está procurando?" aria-label="Texto para pesquisar">
      <div class="search-dialog-actions">
        <button type="button" data-search-close>Fechar</button>
        <button type="submit">Pesquisar</button>
      </div>
    </form>
  `;
  document.body.appendChild(searchDialog);

  const searchInput = searchDialog.querySelector('input');
  searchOpenButtons.forEach((button) => {
    button.addEventListener('click', () => {
      searchDialog.showModal();
      searchInput.focus();
    });
  });
  searchDialog.querySelector('[data-search-close]').addEventListener('click', () => {
    searchDialog.close();
  });
  searchDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      searchDialog.close();
    }
  });
  searchDialog.addEventListener('click', (event) => {
    if (event.target === searchDialog) searchDialog.close();
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.getElementById('main-nav');

if (menuToggle && navMenu) {
  function setMenuOpen(isOpen) {
    navMenu.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  }

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navMenu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
}

// Conversas do Chat
const conversationList = document.getElementById('conversationList');
const messageThread = document.getElementById('messageThread');
const chatArea = document.getElementById('chatArea');
const threadHeader = document.getElementById('threadHeader');
const threadName = document.getElementById('threadName');
const backToConversations = document.getElementById('backToConversations');
const requestPanel = document.getElementById('requestPanel');
const chatTabs = document.querySelectorAll('[data-chat-tab]');
const defaultThreadMarkup = chatArea ? chatArea.innerHTML : '';
const messageRequests = [
  { name: 'Mariana Alves', avatar: '👩🏾', preview: 'Oi! Vi seu perfil na comunidade e queria tirar uma dúvida.' },
  { name: 'Pedro Costa', avatar: '🧔🏻', preview: 'Você pode me ajudar com uma questão de JavaScript?' },
  { name: 'Julia Ferreira', avatar: '👩🏻', preview: 'Adorei seu projeto! Podemos conversar sobre ele?' },
  { name: 'Lucas Rocha', avatar: '👨🏾', preview: 'Olá! Também estou começando na área de tecnologia.' }
];
const friendRequests = [
  { name: 'Fernanda Melo', avatar: '👩🏾' },
  { name: 'Gustavo Nunes', avatar: '🧔🏻' },
  { name: 'Isabela Souza', avatar: '👩🏼‍🦱' }
];
const conversations = [
  {
    name: 'Ana Costa',
    avatar: '👩‍🦱',
    unread: 2,
    messages: [
      { from: 'them', text: 'Oi! Você viu o material novo sobre inteligência artificial?' },
      { from: 'me', text: 'Ainda não, sobre o que é?' },
      { from: 'them', text: 'Separei alguns links para compartilhar com o grupo.' },
      { from: 'me', text: 'Legal! Pode me mandar que vou dar uma olhada.' }
    ]
  },
  {
    name: 'Bia Martins',
    avatar: '👩🏻',
    unread: 0,
    messages: [
      { from: 'them', text: 'Conseguiu terminar aquele projeto?' },
      { from: 'me', text: 'Quase! Estou ajustando a página inicial.' },
      { from: 'them', text: 'Se quiser, posso revisar o código com você.' },
      { from: 'me', text: 'Aceito, obrigada! Te mando ainda hoje.' }
    ]
  },
  {
    name: 'Carol Oliveira',
    avatar: '👩‍🦰',
    unread: 3,
    messages: [
      { from: 'them', text: 'Vai participar do encontro de tecnologia neste sábado?' },
      { from: 'me', text: 'Quero sim! Onde vai ser?' },
      { from: 'them', text: 'O pessoal confirmou o horário para as 14h!' },
      { from: 'them', text: 'Me avisa se você for 😊' },
      { from: 'me', text: 'Combinado, vou confirmar minha presença.' }
    ]
  },
  {
    name: 'Diego Santos',
    avatar: '👨🏽‍💻',
    unread: 0,
    messages: [
      { from: 'them', text: 'Encontrei uma solução para aquele erro no banco.' },
      { from: 'me', text: 'Boa! O que estava causando o problema?' },
      { from: 'them', text: 'Depois te mando o exemplo funcionando.' },
      { from: 'me', text: 'Valeu, vai ajudar bastante.' }
    ]
  },
  {
    name: 'Rafael Lima',
    avatar: '👨🏻‍🦰',
    unread: 0,
    messages: [
      { from: 'them', text: 'Obrigado pelas dicas de portfólio!' },
      { from: 'me', text: 'Imagina! Como está ficando?' },
      { from: 'them', text: 'Já comecei a organizar meus projetos.' },
      { from: 'me', text: 'Legal, depois quero ver como ficou.' }
    ]
  }
];
let selectedConversation = null;

function renderRequests(containerId, requests, previewText) {
  const container = document.getElementById(containerId);
  if (!container) return;

  requests.forEach((request) => {
    const item = document.createElement('div');
    item.className = 'request-item';
    const avatar = document.createElement('span');
    avatar.className = 'conversation-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = request.avatar;

    const details = document.createElement('span');
    details.className = 'conversation-details';
    const name = document.createElement('b');
    name.className = 'conversation-name';
    name.textContent = request.name;
    details.appendChild(name);
    if (request.preview || previewText) {
      const preview = document.createElement('span');
      preview.className = 'conversation-preview';
      preview.textContent = request.preview || previewText;
      details.appendChild(preview);
    }

    item.append(avatar, details);
    container.appendChild(item);
  });
}

renderRequests('messageRequests', messageRequests);
renderRequests('friendRequests', friendRequests, 'Quer se conectar com você.');

function renderConversationList() {
  if (!conversationList) return;
  conversationList.replaceChildren();

  conversations.forEach((conversation) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'conversation-item';

    const avatar = document.createElement('span');
    avatar.className = 'conversation-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = conversation.avatar;

    const details = document.createElement('span');
    details.className = 'conversation-details';
    const name = document.createElement('b');
    name.className = 'conversation-name';
    name.textContent = conversation.name;
    const preview = document.createElement('span');
    preview.className = 'conversation-preview';
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    preview.textContent = `${lastMessage.from === 'me' ? 'Você: ' : ''}${lastMessage.text}`;
    details.append(name, preview);
    item.append(avatar, details);

    if (conversation.unread > 0) {
      const unread = document.createElement('span');
      unread.className = 'unread-count';
      unread.textContent = String(conversation.unread);
      unread.setAttribute('aria-label', `${conversation.unread} mensagens não lidas`);
      item.appendChild(unread);
    }

    item.addEventListener('click', () => openConversation(conversation));
    conversationList.appendChild(item);
  });
}

function renderConversation(conversation) {
  if (!chatArea) return;
  chatArea.replaceChildren();
  conversation.messages.forEach(({ from, text }) => {
    const message = document.createElement('div');
    message.className = from === 'me' ? 'm me' : 'm';
    const bubble = document.createElement('div');
    bubble.className = 'bub';
    const sender = document.createElement('b');
    sender.textContent = from === 'me' ? 'Você' : conversation.name;
    bubble.append(sender, document.createTextNode(text));
    if (from === 'them') {
      const avatar = document.createElement('div');
      avatar.className = 'av';
      avatar.textContent = conversation.avatar;
      message.appendChild(avatar);
    }
    message.appendChild(bubble);
    chatArea.appendChild(message);
  });

  const mineArea = document.createElement('div');
  mineArea.id = 'mine';
  chatArea.appendChild(mineArea);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function openConversation(conversation) {
  selectedConversation = conversation;
  if (threadName) threadName.textContent = conversation.name;
  if (threadHeader) threadHeader.hidden = false;
  if (conversationList) conversationList.hidden = true;
  if (messageThread) messageThread.hidden = false;
  renderConversation(conversation);
}

if (conversationList && messageThread && chatArea) {
  renderConversationList();

  chatTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      chatTabs.forEach((item) => item.classList.toggle('on', item === tab));
      selectedConversation = null;

      if (tab.dataset.chatTab === 'messages') {
        conversationList.hidden = false;
        if (requestPanel) requestPanel.hidden = true;
        messageThread.hidden = true;
        if (threadHeader) threadHeader.hidden = true;
        return;
      }

      conversationList.hidden = true;
      if (requestPanel) requestPanel.hidden = tab.dataset.chatTab !== 'requests';
      if (tab.dataset.chatTab === 'requests') {
        messageThread.hidden = true;
        if (threadHeader) threadHeader.hidden = true;
        return;
      }

      messageThread.hidden = false;
      if (threadHeader) threadHeader.hidden = true;
      chatArea.innerHTML = defaultThreadMarkup;
    });
  });

  if (backToConversations) {
    backToConversations.addEventListener('click', () => {
      conversationList.hidden = false;
      if (requestPanel) requestPanel.hidden = true;
      messageThread.hidden = true;
      if (threadHeader) threadHeader.hidden = true;
      renderConversationList();
    });
  }
}

const communityTabs = document.querySelectorAll('[data-community-tab]');
const communityPanels = document.querySelectorAll('[data-community-panel]');

communityTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedPanel = tab.dataset.communityTab;
    communityTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle('on', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });
    communityPanels.forEach((panel) => {
      panel.hidden = panel.dataset.communityPanel !== selectedPanel;
    });
  });
});

const newsTabs = document.querySelectorAll('[data-news-tab]');
const newsPanels = document.querySelectorAll('[data-news-panel]');

newsTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedPanel = tab.dataset.newsTab;
    newsTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle('on', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });
    newsPanels.forEach((panel) => {
      panel.hidden = panel.dataset.newsPanel !== selectedPanel;
    });
  });
});

const homeTabs = document.querySelectorAll('[data-home-tab]');
const homePanels = document.querySelectorAll('[data-home-panel]');

homeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedPanel = tab.dataset.homeTab;
    homeTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle('on', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });
    homePanels.forEach((panel) => {
      panel.hidden = panel.dataset.homePanel !== selectedPanel;
    });
  });
});

const jobTabs = document.querySelectorAll('[data-job-tab]');
const jobPanels = document.querySelectorAll('[data-job-panel]');

jobTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedPanel = tab.dataset.jobTab;
    jobTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle('on', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });
    jobPanels.forEach((panel) => {
      panel.hidden = panel.dataset.jobPanel !== selectedPanel;
    });
  });
});

// Enviar Mensagem no Chat
const sendBtn = document.getElementById('sendBtn');
const inputMsg = document.getElementById('mi');

if (sendBtn && inputMsg) {
  function send() {
    const text = inputMsg.value.trim();
    if (!text) return;

    let mineArea = document.getElementById('mine');
    if (!mineArea && selectedConversation && chatArea) {
      mineArea = document.createElement('div');
      mineArea.id = 'mine';
      chatArea.appendChild(mineArea);
    }
    if (!mineArea) {
      console.error('Não foi possível enviar a mensagem: área de mensagens não encontrada.');
      return;
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = 'm me';
    const bubble = document.createElement('div');
    bubble.className = 'bub';
    const sender = document.createElement('b');
    sender.textContent = 'Você';
    bubble.appendChild(sender);
    bubble.appendChild(document.createTextNode(text));
    msgDiv.appendChild(bubble);
    mineArea.appendChild(msgDiv);
    if (selectedConversation) {
      selectedConversation.messages.push({ from: 'me', text });
      renderConversationList();
    }
    inputMsg.value = '';
    if (chatArea) {
      chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
    }
  }

  sendBtn.addEventListener('click', send);
  inputMsg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });
}