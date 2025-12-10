# 🗺️ RRIA – Sistema Inteligente de Rotas e Análise

> **Simulação avançada da lógica de navegação (estilo Waze) aplicada a um ambiente experimental.**

O **RRIA** é um projeto interativo desenvolvido para demonstrar e explorar os bastidores dos sistemas de navegação modernos. Rastreamos, analisamos e explicamos o que acontece nos milissegundos em que um aplicativo decide sua rota, focando em arquitetura de dados, lógica fuzzy e psicologia do usuário.

---

## 🚀 Funcionalidades Principais

O projeto é dividido em módulos interconectados, acessíveis através de uma **Central de Navegação** imersiva:

*   **📍 Mapa Interativo (Central):**
    *   Visualização geoespacial com navegação fluida.
    *   Menu lateral expansível com acesso rápido aos módulos.
    *   Modo "Tela Cheia" para imersão total.
*   **🧠 Motor de Decisão:**
    *   Demonstração dos algoritmos de roteamento e lógica de reação a eventos (trânsito, acidentes).
*   **💾 Arquitetura de Dados:**
    *   Visualização da estrutura de grafos, nós e tabelas que sustentam o sistema.
*   **📱 Interface Operacional:**
    *   Simulação da experiência do usuário final (o motorista) com dados em tempo real.
*   **👁️ Psicologia do Usuário:**
    *   Análise dos fatores humanos que influenciam a escolha de rotas (segurança, familiaridade, tempo).
*   **✨ Transições Suaves:**
    *   Sistema de navegação (SPA-like) com animações fluidas entre páginas (Fade + Slide).

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias web padrão, sem dependência de frameworks pesados, focando em performance e compatibilidade:

*   **HTML5 Semântico**
*   **CSS3 Moderno** (Flexbox, Grid, Animações, Variáveis CSS)
*   **JavaScript (ES6+)** (Lógica de navegação, manipulação de DOM, Transições)
*   **Google Fonts** (Inter, Poppins, Outfit) & **Material Icons Round**

---

## 📂 Estrutura do Projeto

*   `index.html`: Página inicial (Landing Page) com apresentação do projeto.
*   `mapa.html`: O "hub" central. Um mapa interativo que conecta todas as seções.
*   `paginas/`: Contém os módulos específicos (html, css, js):
    *   `arquiteturaDados.html`
    *   `interfaceOperacional.html`
    *   `motorDecisao.html`
    *   `psicologiaUsuario.html`
    *   `js/pageTransitions.js`: Gerenciador global de animações de página.

---

## 👣 Como Usar

1.  Baixe ou clone o repositório.
2.  Abra o arquivo `index.html` em seu navegador preferido.
3.  Clique em **"Entrar no Mapa"** para acessar a central.
4.  Navegue pelos ícones no mapa ou utilize o menu lateral para explorar cada módulo de conhecimento.

---

## 👥 Equipe

*   **Rafael H.** - *UI/UX & Desenvolvedor Front-End*
    *   Foco em estética, microinterações e experiência do usuário.
*   **Lucas M.** - *Desenvolvedor Front-End & Arquiteto*
    *   Arquitetura técnica, lógica visual e estruturação do sistema.