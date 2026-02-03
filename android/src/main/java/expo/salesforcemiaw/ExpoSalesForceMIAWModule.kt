package expo.modules.salesforcemiaw

import android.content.Context
import android.content.SharedPreferences
import androidx.appcompat.app.AppCompatActivity
import com.salesforce.android.smi.core.CoreClient
import com.salesforce.android.smi.core.CoreConfiguration
import com.salesforce.android.smi.ui.UIClient
import com.salesforce.android.smi.ui.UIConfiguration
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject
import java.io.InputStream
import java.util.UUID
import android.util.Log

class ExpoSalesForceMIAWModule : Module() {
  private var uiConfiguration: UIConfiguration? = null
  private var coreConfiguration: CoreConfiguration? = null
  private var uiClient: UIClient? = null
  private var conversationId: String? = null

  // Armazenamento para campos de pré-chat
  private var preChatData: MutableMap<String, String> = mutableMapOf()
  private var hiddenPreChatData: MutableMap<String, String> = mutableMapOf()

  private val prefs: SharedPreferences by lazy {
    context.getSharedPreferences("ExpoSalesForceMIAW", Context.MODE_PRIVATE)
  }

  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is null")

  override fun definition() = ModuleDefinition {
    Name("ExpoSalesForceMIAW")

    // ============================================
    // CONFIGURAR O SDK
    // ============================================
    Function("configure") { config: Map<String, Any?> ->
      try {
        val url = config["url"] as? String ?: return@Function false
        val orgId = config["orgId"] as? String ?: return@Function false
        val developerName = config["developerName"] as? String ?: return@Function false

        Log.d("SalesforceMIAW", "configure called with url=$url, orgId=$orgId, developerName=$developerName")

        // Obter ou criar conversation ID
        val convId = config["conversationId"] as? String ?: getOrCreateConversationId()
        conversationId = convId

        // Processar campos de pré-chat se fornecidos
        (config["preChatFields"] as? Map<String, String>)?.let {
          Log.d("SalesforceMIAW", "preChatFields: $it")
          preChatData.clear()
          preChatData.putAll(it)
        }

        (config["hiddenPreChatFields"] as? Map<String, String>)?.let {
          Log.d("SalesforceMIAW", "hiddenPreChatFields: $it")
          hiddenPreChatData.clear()
          hiddenPreChatData.putAll(it)
        }

        // Criar configuração core
        // CoreConfiguration usa construtor direto, não Builder
        coreConfiguration = CoreConfiguration(
          serviceAPI = url,
          organizationId = orgId,
          developerName = developerName
        )

        // Criar configuração UI
        // UIConfiguration também usa construtor direto
        uiConfiguration = UIConfiguration(
          coreConfiguration = coreConfiguration!!
        )

        // Criar UIClient
        uiClient = UIClient(context, uiConfiguration!!)

        Log.d("SalesforceMIAW", "✅ SDK configurado com sucesso!")

        true
      } catch (e: Exception) {
        Log.e("SalesforceMIAW", "Erro no configure: ${e.message}", e)
        e.printStackTrace()
        false
      }
    }

    // ============================================
    // DEFINIR CAMPOS DE PRÉ-CHAT VISÍVEIS
    // ============================================
    Function("setPreChatFields") { fields: Map<String, String> ->
      try {
        preChatData.clear()
        preChatData.putAll(fields)
        Log.d("SalesforceMIAW", "setPreChatFields: $fields")
        true
      } catch (e: Exception) {
        Log.e("SalesforceMIAW", "Erro no setPreChatFields: ${e.message}", e)
        false
      }
    }

    // ============================================
    // DEFINIR CAMPOS DE PRÉ-CHAT OCULTOS
    // ============================================
    Function("setHiddenPreChatFields") { fields: Map<String, String> ->
      try {
        hiddenPreChatData.clear()
        hiddenPreChatData.putAll(fields)
        Log.d("SalesforceMIAW", "setHiddenPreChatFields: $fields")
        true
      } catch (e: Exception) {
        Log.e("SalesforceMIAW", "Erro no setHiddenPreChatFields: ${e.message}", e)
        false
      }
    }

    // ============================================
    // ABRIR A INTERFACE DE CHAT
    // ============================================
    AsyncFunction("openChat") { promise: Promise ->
      try {
        val client = uiClient ?: run {
          promise.reject("ERR_NOT_CONFIGURED", "SDK not configured. Call configure() first.", null)
          return@AsyncFunction
        }

        val activity = appContext.currentActivity as? AppCompatActivity ?: run {
          promise.reject("ERR_NO_ACTIVITY", "Could not find current activity.", null)
          return@AsyncFunction
        }

        activity.runOnUiThread {
          try {
            Log.d("SalesforceMIAW", "🎨 Abrindo interface do chat...")

            // Abrir o chat com o conversation ID
            client.openConversation(
              activity = activity,
              conversationId = conversationId?.let { UUID.fromString(it) } ?: UUID.randomUUID()
            )

            Log.d("SalesforceMIAW", "✅ Chat interface apresentada")
            promise.resolve(true)
          } catch (e: Exception) {
            Log.e("SalesforceMIAW", "Erro ao abrir chat: ${e.message}", e)
            promise.reject("ERR_OPEN_CHAT", "Failed to open chat: ${e.message}", e)
          }
        }
      } catch (e: Exception) {
        Log.e("SalesforceMIAW", "Erro no openChat: ${e.message}", e)
        promise.reject("ERR_OPEN_CHAT", "Failed to open chat: ${e.message}", e)
      }
    }

    // ============================================
    // FECHAR A INTERFACE DE CHAT
    // ============================================
    AsyncFunction("closeChat") { promise: Promise ->
      try {
        val activity = appContext.currentActivity as? AppCompatActivity ?: run {
          promise.reject("ERR_NO_ACTIVITY", "Could not find current activity.", null)
          return@AsyncFunction
        }

        activity.runOnUiThread {
          try {
            // O chat é fechado automaticamente quando o usuário fecha a tela
            Log.d("SalesforceMIAW", "✅ Chat fechado")
            promise.resolve(true)
          } catch (e: Exception) {
            promise.reject("ERR_CLOSE_CHAT", "Failed to close chat: ${e.message}", e)
          }
        }
      } catch (e: Exception) {
        promise.reject("ERR_CLOSE_CHAT", "Failed to close chat: ${e.message}", e)
      }
    }

    // ============================================
    // OBTER O CONVERSATION ID ATUAL
    // ============================================
    Function("getConversationId") {
      conversationId
    }

    // ============================================
    // DEFINIR UM NOVO CONVERSATION ID
    // ============================================
    Function("setConversationId") { newId: String ->
      try {
        conversationId = newId
        prefs.edit().putString("conversationId", newId).apply()
        Log.d("SalesforceMIAW", "ConversationId atualizado para: $newId")
        true
      } catch (e: Exception) {
        Log.e("SalesforceMIAW", "Erro no setConversationId: ${e.message}", e)
        e.printStackTrace()
        false
      }
    }

    // ============================================
    // LIMPAR O CONVERSATION ID (CRIAR NOVO)
    // ============================================
    Function("clearConversationId") {
      val newId = UUID.randomUUID().toString()
      conversationId = newId
      prefs.edit().putString("conversationId", newId).apply()
      Log.d("SalesforceMIAW", "Nova conversação criada: $newId")
      newId
    }

    // ============================================
    // CONFIGURAR USANDO ARQUIVO config.json
    // ============================================
    Function("configureFromFile") { fileName: String ->
      try {
        val inputStream: InputStream = context.assets.open("$fileName.json")
        val json = inputStream.bufferedReader().use { it.readText() }
        val jsonObject = JSONObject(json)

        val url = jsonObject.getString("url")
        val orgId = jsonObject.getString("orgId")
        val developerName = jsonObject.getString("developerName")

        val convId = getOrCreateConversationId()
        conversationId = convId

        // Criar configuração core
        coreConfiguration = CoreConfiguration(
          serviceAPI = url,
          organizationId = orgId,
          developerName = developerName
        )

        // Criar configuração UI
        uiConfiguration = UIConfiguration(
          coreConfiguration = coreConfiguration!!
        )

        // Criar UIClient
        uiClient = UIClient(context, uiConfiguration!!)

        Log.d("SalesforceMIAW", "Configurado a partir do arquivo: $fileName.json")
        true
      } catch (e: Exception) {
        Log.e("SalesforceMIAW", "Erro no configureFromFile: ${e.message}", e)
        e.printStackTrace()
        false
      }
    }

    // ============================================
    // REGISTRAR TOKEN DE PUSH NOTIFICATION
    // ============================================
    Function("registerPushToken") { token: String ->
      try {
        // TODO: Implementar registro de push token quando necessário
        Log.d("SalesforceMIAW", "registerPushToken: $token")
        true
      } catch (e: Exception) {
        Log.e("SalesforceMIAW", "Erro no registerPushToken: ${e.message}", e)
        e.printStackTrace()
        false
      }
    }

    // Eventos
    Events("onChatOpened", "onChatClosed", "onMessageReceived", "onError")
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private fun getOrCreateConversationId(): String {
    val existingId = prefs.getString("conversationId", null)
    if (existingId != null) {
      return existingId
    }

    val newId = UUID.randomUUID().toString()
    prefs.edit().putString("conversationId", newId).apply()
    return newId
  }
}