# expo-salesforce-miaw

Este módulo fornece uma integração nativa para o SDK de [Salesforce Messaging In-App and Web (MIAW)](https://developer.salesforce.com/docs/service/messaging-in-app/guide/overview.html) para aplicativos React Native, com suporte completo para Expo (SDK 53+).

Ele permite que você adicione facilmente a funcionalidade de chat do Salesforce em seu aplicativo, aproveitando os SDKs nativos para iOS e Android para obter o melhor desempenho e experiência do usuário.

## Funcionalidades

- **Bridge Nativo**: Comunicação direta com os SDKs nativos do Salesforce MIAW.
- **Suporte a Expo**: Configuração automática via Expo Config Plugin.
- **Interface Unificada**: API JavaScript simples e consistente para ambas as plataformas.
- **Gerenciamento de Sessão**: Controle sobre o `conversationId` para persistência de chat.
- **Customização**: Suporte para campos de pré-chat ocultos.

## Instalação

Para instalar o módulo, execute o seguinte comando no seu projeto React Native ou Expo:

```bash
npm install ./path/to/expo-salesforce-miaw
# ou
yarn add ./path/to/expo-salesforce-miaw
```

## Configuração

### 1. Adicionar o Plugin ao `app.json`

Adicione o plugin à sua configuração `app.json` ou `app.config.js`. O nome do plugin é o mesmo do pacote:

```json
{
  "expo": {
    "plugins": ["expo-salesforce-miaw"]
  }
}
```

O plugin irá configurar automaticamente as permissões necessárias no `Info.plist` (iOS) e as configurações do `build.gradle` (Android).

### 2. Adicionar o Arquivo de Configuração do Salesforce

Baixe o arquivo `config.json` do seu painel de administração do Salesforce e adicione-o ao seu projeto.

- **Para iOS**: Adicione o arquivo ao seu projeto no Xcode.
- **Para Android**: Coloque o arquivo no diretório `android/app/src/main/assets`.

### 3. Rebuild do Aplicativo

Após a instalação e configuração, você precisa reconstruir seu aplicativo para que as alterações nativas sejam aplicadas:

```bash
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

## API

### `configure(config)`

Configura o SDK manualmente. Retorna uma `Promise<boolean>`.

```javascript
import { configure } from 'expo-salesforce-miaw';

const config = {
  url: 'YOUR_SALESFORCE_URL',
  orgId: 'YOUR_ORG_ID',
  developerName: 'YOUR_DEPLOYMENT_NAME',
};

configure(config).then(success => {
  if (success) {
    console.log('Salesforce MIAW configured successfully!');
  }
});
```

### `configureFromFile(fileName)`

Configura o SDK usando o arquivo `config.json`. Retorna uma `Promise<boolean>`.

```javascript
import { configureFromFile } from 'expo-salesforce-miaw';

// O arquivo deve ser 'config.json' em assets (Android) ou no bundle (iOS)
configureFromFile('config').then(success => {
  if (success) {
    console.log('Salesforce MIAW configured successfully from file!');
  }
});
```

### `openChat()`

Abre a interface de chat. Retorna uma `Promise<boolean>`.

```javascript
import { openChat } from 'expo-salesforce-miaw';

openChat();
```

### `closeChat()`

Fecha a interface de chat. Retorna uma `Promise<boolean>`.

```javascript
import { closeChat } from 'expo-salesforce-miaw';

closeChat();
```

### `getConversationId()`

Retorna o ID da conversa atual. Retorna uma `Promise<string | null>`.

```javascript
import { getConversationId } from 'expo-salesforce-miaw';

getConversationId().then(id => {
  console.log('Current conversation ID:', id);
});
```

### `setConversationId(newId)`

Define um novo ID de conversa. Retorna uma `Promise<boolean>`.

```javascript
import { setConversationId } from 'expo-salesforce-miaw';

setConversationId('new-custom-conversation-id');
```

### `clearConversationId()`

Limpa o ID da conversa atual e gera um novo. Retorna uma `Promise<string>` com o novo ID.

```javascript
import { clearConversationId } from 'expo-salesforce-miaw';

clearConversationId().then(newId => {
  console.log('New conversation ID:', newId);
});
```

### `setHiddenPreChatFields(fields)`

Define campos de pré-chat ocultos. Retorna uma `Promise<boolean>`.

```javascript
import { setHiddenPreChatFields } from 'expo-salesforce-miaw';

const fields = {
  FirstName: 'John',
  LastName: 'Doe',
  Email: 'john.doe@example.com'
};

setHiddenPreChatFields(fields);
```

### `registerPushToken(token)`

Registra o token de notificação push. Retorna uma `Promise<boolean>`.

```javascript
import { registerPushToken } from 'expo-salesforce-miaw';

// Obtenha o token do serviço de notificação (ex: Expo Notifications)
const token = 'your-push-notification-token';
registerPushToken(token);
```

## Exemplo de Uso

Crie um projeto de exemplo na pasta `example` para demonstrar o uso do módulo.

```bash
cd example
npm install
npm start
```

## Licença

MIT
