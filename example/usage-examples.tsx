// ============================================
// EXEMPLOS DE USO - JavaScript/TypeScript
// ============================================

import * as ExpoSalesForceMIAW from "expo-salesforce-miaw";

// --------------------------------------------
// EXEMPLO 1: Configuração Básica com PreChat Fields
// --------------------------------------------
async function exemplo1_ConfiguracaoBasica() {
  const config = {
    url: "https://your-org.my.salesforce-scrt.com",
    orgId: "YOUR_ORG_ID",
    developerName: "YOUR_DEPLOYMENT_NAME",

    // Campos VISÍVEIS no formulário (usuário pode ou não editar)
    preChatFields: {
      FirstName: "João",
      LastName: "Silva",
      Email: "joao.silva@email.com",
      Subject: "Dúvida sobre produto",
    },

    // Campos OCULTOS (enviados mas não aparecem na UI)
    hiddenPreChatFields: {
      UserId: "user_12345",
      SessionToken: "abc-def-ghi-jkl",
      AppVersion: "2.1.0",
    },
  };

  const success = await ExpoSalesForceMIAW.configure(config);

  if (success) {
    console.log("✅ SDK configurado com sucesso!");
    await ExpoSalesForceMIAW.openChat();
  }
}

// --------------------------------------------
// EXEMPLO 2: Atualizar campos antes de abrir o chat
// --------------------------------------------
async function exemplo2_AtualizarCampos() {
  // Primeiro configure o SDK
  await ExpoSalesForceMIAW.configure({
    url: "https://your-org.my.salesforce-scrt.com",
    orgId: "YOUR_ORG_ID",
    developerName: "YOUR_DEPLOYMENT_NAME",
  });

  // Depois defina os campos (útil se você obtém dados de forma assíncrona)
  ExpoSalesForceMIAW.setPreChatFields({
    FirstName: "Maria",
    LastName: "Santos",
    Email: "maria@example.com",
  });

  ExpoSalesForceMIAW.setHiddenPreChatFields({
    CustomerId: "cust_789",
    PurchaseHistory: "premium_user",
  });

  // Agora abra o chat com os dados atualizados
  await ExpoSalesForceMIAW.openChat();
}

// --------------------------------------------
// EXEMPLO 3: Campos dinâmicos baseados no usuário logado
// --------------------------------------------
async function exemplo3_CamposDinamicos(userProfile) {
  const preChatFields = {};
  const hiddenFields = {};

  // Preencher campos baseado no perfil do usuário
  if (userProfile.firstName) {
    preChatFields["FirstName"] = userProfile.firstName;
  }
  if (userProfile.lastName) {
    preChatFields["LastName"] = userProfile.lastName;
  }
  if (userProfile.email) {
    preChatFields["Email"] = userProfile.email;
  }
  if (userProfile.phone) {
    preChatFields["Phone"] = userProfile.phone;
  }

  // Adicionar dados ocultos
  hiddenFields["UserId"] = userProfile.id;
  hiddenFields["AccountType"] = userProfile.accountType;
  hiddenFields["MemberSince"] = userProfile.createdAt;

  // Se o usuário está olhando um produto específico
  if (userProfile.currentProduct) {
    preChatFields["Subject"] =
      `Dúvida sobre ${userProfile.currentProduct.name}`;
    hiddenFields["ProductId"] = userProfile.currentProduct.id;
  }

  await ExpoSalesForceMIAW.configure({
    url: "https://your-org.my.salesforce-scrt.com",
    orgId: "YOUR_ORG_ID",
    developerName: "YOUR_DEPLOYMENT_NAME",
    preChatFields,
    hiddenPreChatFields: hiddenFields,
  });

  await ExpoSalesForceMIAW.openChat();
}

// --------------------------------------------
// EXEMPLO 4: Uso em componente React Native
// --------------------------------------------
import React, { useState } from "react";
import { View, Button, TextInput, Alert } from "react-native";

function ChatButton() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleOpenChat = async () => {
    if (!userName || !userEmail) {
      Alert.alert("Erro", "Por favor, preencha nome e email");
      return;
    }

    try {
      // Configurar com os dados do formulário
      const configured = await ExpoSalesForceMIAW.configure({
        url: "https://your-org.my.salesforce-scrt.com",
        orgId: "YOUR_ORG_ID",
        developerName: "YOUR_DEPLOYMENT_NAME",
        preChatFields: {
          FirstName: userName.split(" ")[0],
          LastName: userName.split(" ").slice(1).join(" ") || "-",
          Email: userEmail,
        },
        hiddenPreChatFields: {
          Source: "mobile_app",
          Platform: Platform.OS,
          AppVersion: "1.0.0",
        },
      });

      if (configured) {
        await ExpoSalesForceMIAW.openChat();
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir o chat");
      console.error(error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Seu nome"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        placeholder="Seu email"
        value={userEmail}
        onChangeText={setUserEmail}
        keyboardType="email-address"
      />
      <Button title="Abrir Chat" onPress={handleOpenChat} />
    </View>
  );
}

// --------------------------------------------
// EXEMPLO 5: Gerenciamento de conversação persistente
// --------------------------------------------
async function exemplo5_ConversacaoPersistente() {
  // Obter ID da conversação atual (se existir)
  const currentConversationId = ExpoSalesForceMIAW.getConversationId();

  if (currentConversationId) {
    console.log("Conversação existente:", currentConversationId);
    // Usuário pode continuar conversa anterior
  } else {
    console.log("Nova conversação");
  }

  await ExpoSalesForceMIAW.configure({
    url: "https://your-org.my.salesforce-scrt.com",
    orgId: "YOUR_ORG_ID",
    developerName: "YOUR_DEPLOYMENT_NAME",
    // Se quiser forçar uma conversação específica:
    // conversationId: 'UUID-DA-CONVERSACAO',
    preChatFields: {
      FirstName: "Carlos",
      Email: "carlos@example.com",
    },
  });

  await ExpoSalesForceMIAW.openChat();
}

// Para limpar e iniciar nova conversação:
async function iniciarNovaConversacao() {
  const newConversationId = ExpoSalesForceMIAW.clearConversationId();
  console.log("Nova conversação criada:", newConversationId);

  // Agora configure e abra o chat normalmente
  // ... resto do código
}

// --------------------------------------------
// DICAS IMPORTANTES
// --------------------------------------------

/*
1. CAMPOS EDITÁVEIS vs NÃO EDITÁVEIS:
   - No código Swift, campos preenchidos têm isEditable = false
   - Isso significa que o usuário VÊ os valores mas NÃO PODE editá-los
   - Se você quer permitir edição, mude para isEditable = true

2. NOMES DOS CAMPOS:
   - Use os MESMOS NOMES configurados no Salesforce Admin
   - Campos comuns: FirstName, LastName, Email, Phone, Subject
   - Você pode criar campos customizados no Salesforce

3. VALIDAÇÃO:
   - Se um campo é obrigatório no Salesforce, certifique-se de preenchê-lo
   - Se exceder limite de caracteres, a conversa não será criada
   - Sempre valide os dados antes de enviar

4. TIMING:
   - Configure e defina os campos ANTES de chamar openChat()
   - Os delegates são registrados quando openChat() é chamado
   - Não é possível alterar campos depois que o chat já está aberto

5. HIDDEN FIELDS:
   - Use para dados que você NÃO quer mostrar ao usuário
   - Ideal para IDs internos, tokens, metadata
   - São enviados automaticamente com a conversa
*/

export {
  exemplo1_ConfiguracaoBasica,
  exemplo2_AtualizarCampos,
  exemplo3_CamposDinamicos,
  exemplo5_ConversacaoPersistente,
  iniciarNovaConversacao,
};
