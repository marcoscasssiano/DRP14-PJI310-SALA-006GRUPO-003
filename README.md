# Desenho de Solução - Estudo de Estabilidade.

## 1. Introdução

Este documento apresenta o desenho de solução para o projeto de desenvolvimento de um software web para criação e gerenciamento de fichas de estudos de estabilidade de cosméticos. O objetivo é fornecer uma visão geral da arquitetura do sistema e das tecnologias que serão empregadas.

## 2. Arquitetura do Projeto

### 2.1 Visão Geral da Arquitetura

O projeto adotará uma arquitetura baseada em Model-View-Controller (MVC), com as seguintes camadas principais:

- **Front-end:** Responsável pela interface do usuário e pela interação com o sistema.
- **Back-end:** Gerencia a lógica de negócios e o processamento de dados.
- **Banco de Dados:** Armazena as informações persistentes do sistema.

### 2.2 Componentes Principais

- **Front-end:** Desenvolvido utilizando HTML, CSS e JavaScript. O front-end será responsável pela interface de usuário e pela interação com o back-end através de chamadas API.
- **Back-end:** Utiliza Node.js e Express para criar uma API que serve as requisições do front-end e realiza a lógica de negócios.
- **Banco de Dados:** MongoDB será utilizado como banco de dados NoSQL para armazenar as fichas de estudos e outras informações necessárias. O banco será com o serviço em nuvem Atlas.

## 3. Tecnologias Utilizadas

### 3.1 Front-end

- **HTML/CSS:** Para a estrutura e estilo das páginas.
- **JavaScript:** Para interatividade e manipulação de DOM.

### 3.2 Back-end

- **Node.js:** Ambiente de execução JavaScript no servidor.
- **Express:** Framework para Node.js que facilita a criação de APIs RESTful.
- **Mongoose:** ODM para facilitar integração com o banco de dados.
- **bcryptjs:** Para autenticação e gerenciamento de sessões de usuários.

### 3.3 Banco de Dados

- **MongoDB:** Banco de dados NoSQL que será utilizado para armazenar fichas de estudos e outros dados relevantes.
- **Atlas:** Serviço de banco de dados multi-nuvem desenvolvido pelas mesmas pessoas que desenvolvem o MongoDB.

### 3.4 Infraestrutura

- **Serviços de Nuvem:** O projeto será hospedado em uma plataforma de nuvem Render, para garantir escalabilidade e disponibilidade.
- **Controle de Versão:** Git será utilizado para controle de versão do código, com repositório hospedado no GitHub.

## 4. Fluxo de Dados

O fluxo de dados no sistema será o seguinte:

1. Usuário interage com a interface de usuário no Front-end.
2. Front-end faz requisições para o Back-end via chamadas API.
3. Back-end processa as requisições, interage com o Banco de Dados para ler ou escrever dados.
4. Banco de Dados retorna os dados solicitados ao Back-end.
5. Back-end envia a resposta para o Front-end, que atualiza a interface de usuário.

## 5. Segurança

- **Autenticação e Autorização:** Implementação de bcryptjs para garantir que apenas usuários autorizados acessem determinadas funcionalidades.
- **Proteção contra Ataques:** Medidas para proteger contra ataques comuns, como SQL Injection e Cross-Site Scripting (XSS).
