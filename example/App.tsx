import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import {
  configure,
  openChat,
  closeChat,
  getConversationId,
  clearConversationId,
  setHiddenPreChatFields,
} from 'expo-salesforce-miaw'; // Nome do pacote atualizado

export default function App() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Configurar o SDK ao iniciar o app
    initializeSalesforce();
  }, []);

  const initializeSalesforce = async () => {
    try {
      // Opção 1: Configurar manualmente
      const success = await configure({
        url: 'https://your-salesforce-instance.com',
        orgId: 'YOUR_ORG_ID',
        developerName: 'YOUR_DEPLOYMENT_NAME',
      });

      // Opção 2: Configurar a partir de um arquivo
      // const success = await configureFromFile('config');

      if (success) {
        setIsConfigured(true);
        const id = await getConversationId();
        setConversationId(id);
        console.log('Salesforce MIAW configurado com sucesso!');
      } else {
        Alert.alert('Erro', 'Falha ao configurar o Salesforce MIAW');
      }
    } catch (error) {
      console.error('Erro ao configurar Salesforce MIAW:', error);
      Alert.alert('Erro', 'Erro ao configurar o Salesforce MIAW');
    }
  };

  const handleOpenChat = async () => {
    try {
      await openChat();
    } catch (error) {
      console.error('Erro ao abrir chat:', error);
      Alert.alert('Erro', 'Erro ao abrir o chat');
    }
  };

  const handleCloseChat = async () => {
    try {
      await closeChat();
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
      Alert.alert('Erro', 'Erro ao fechar o chat');
    }
  };

  const handleClearConversation = async () => {
    try {
      const newId = await clearConversationId();
      setConversationId(newId);
      Alert.alert('Sucesso', `Nova conversa criada: ${newId}`);
    } catch (error) {
      console.error('Erro ao limpar conversa:', error);
      Alert.alert('Erro', 'Erro ao limpar a conversa');
    }
  };

  const handleSetPreChatFields = async () => {
    try {
      await setHiddenPreChatFields({
        FirstName: 'João',
        LastName: 'Silva',
        Email: 'joao.silva@example.com',
      });
      Alert.alert('Sucesso', 'Campos de pré-chat configurados');
    } catch (error) {
      console.error('Erro ao configurar campos:', error);
      Alert.alert('Erro', 'Erro ao configurar campos de pré-chat');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salesforce MIAW Demo</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.statusValue, isConfigured ? styles.configured : styles.notConfigured]}>
          {isConfigured ? 'Configurado' : 'Não Configurado'}
        </Text>
      </View>

      {conversationId && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Conversation ID:</Text>
          <Text style={styles.statusValue} numberOfLines={1}>
            {conversationId}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, !isConfigured && styles.buttonDisabled]}
        onPress={handleOpenChat}
        disabled={!isConfigured}
      >
        <Text style={styles.buttonText}>Abrir Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !isConfigured && styles.buttonDisabled]}
        onPress={handleCloseChat}
        disabled={!isConfigured}
      >
        <Text style={styles.buttonText}>Fechar Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary, !isConfigured && styles.buttonDisabled]}
        onPress={handleSetPreChatFields}
        disabled={!isConfigured}
      >
        <Text style={styles.buttonText}>Configurar Campos Pré-Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary, !isConfigured && styles.buttonDisabled]}
        onPress={handleClearConversation}
        disabled={!isConfigured}
      >
        <Text style={styles.buttonText}>Nova Conversa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  configured: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  notConfigured: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0176D3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#16325C',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
