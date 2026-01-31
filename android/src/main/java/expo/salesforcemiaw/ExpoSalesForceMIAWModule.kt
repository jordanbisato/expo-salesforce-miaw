package expo.modules.salesforcemiaw

import android.content.Context
import android.content.SharedPreferences
import androidx.appcompat.app.AppCompatActivity
import com.salesforce.android.smi.core.CoreConfiguration
import com.salesforce.android.smi.core.PreChatField
import com.salesforce.android.smi.ui.UIClient
import com.salesforce.android.smi.ui.UIConfiguration
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject
import java.io.InputStream
import java.util.UUID

class ExpoSalesForceMIAWModule : Module() {
  private var uiConfiguration: UIConfiguration? = null
  private var uiClient: UIClient? = null
  private var conversationId: String? = null
  private val prefs: SharedPreferences by lazy {
    context.getSharedPreferences("ExpoSalesForceMIAW", Context.MODE_PRIVATE)
  }

  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is null")

  override fun definition() = ModuleDefinition {
    Name("ExpoSalesForceMIAW")

    // Configurar o SDK com as credenciais do Salesforce
    Function("configure") { config: Map<String, Any?> ->
      try {
        val url = config["url"] as? String ?: return@Function false
        val orgId = config["orgId"] as? String ?: return@Function false
        val developerName = config["developerName"] as? String ?: return@Function false
        val hFields = config["hiddenFields"] as Map<String, String> ?: null;

        // Obter ou criar conversation ID
        val convId = config["conversationId"] as? String ?: getOrCreateConversationId()
        conversationId = convId

        val hiddenFields = null;

        if (hFields != null) {
          hiddenFields = hFields.map { (key, value) ->
            PreChatField(
              label = key,
              value = value,
              isHidden = true
            )
          }
        }

        // Criar configuração core
        val coreConfig = CoreConfiguration.create(
          url = url,
          organizationId = orgId,
          developerName = developerName,
          conversationId = convId,
          preChatFields = hiddenFields
        )

        // Criar configuração UI
        uiConfiguration = UIConfiguration.create(coreConfig)

        // Criar UIClient
        uiClient = UIClient.createClient(context, uiConfiguration!!)

        true
      } catch (e: Exception) {
        e.printStackTrace()
        false
      }
    }

    // Configurar usando arquivo config.json
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
        val coreConfig = CoreConfiguration.create(
          url = url,
          organizationId = orgId,
          developerName = developerName,
          conversationId = convId
        )

        // Criar configuração UI
        uiConfiguration = UIConfiguration.create(coreConfig)

        // Criar UIClient
        uiClient = UIClient.createClient(context, uiConfiguration!!)

        true
      } catch (e: Exception) {
        e.printStackTrace()
        false
      }
    }

    // Abrir a interface de chat
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
            client.openConversation(activity)
            promise.resolve(true)
          } catch (e: Exception) {
            promise.reject("ERR_OPEN_CHAT", "Failed to open chat: ${e.message}", e)
          }
        }
      } catch (e: Exception) {
        promise.reject("ERR_OPEN_CHAT", "Failed to open chat: ${e.message}", e)
      }
    }

    // Fechar a interface de chat
    AsyncFunction("closeChat") { promise: Promise ->
      try {
        val activity = appContext.currentActivity as? AppCompatActivity ?: run {
          promise.reject("ERR_NO_ACTIVITY", "Could not find current activity.", null)
          return@AsyncFunction
        }

        activity.runOnUiThread {
          try {
            // O chat é fechado automaticamente quando o usuário fecha a tela
            promise.resolve(true)
          } catch (e: Exception) {
            promise.reject("ERR_CLOSE_CHAT", "Failed to close chat: ${e.message}", e)
          }
        }
      } catch (e: Exception) {
        promise.reject("ERR_CLOSE_CHAT", "Failed to close chat: ${e.message}", e)
      }
    }

    // Obter o conversation ID atual
    Function("getConversationId") {
      conversationId
    }

    // Definir um novo conversation ID
    Function("setConversationId") { newId: String ->
      try {
        conversationId = newId
        prefs.edit().putString("conversationId", newId).apply()

        // Reconfigurar se já existir uma configuração
        uiConfiguration?.let { config ->
          val coreConfig = CoreConfiguration.create(
            url = config.coreConfiguration.url,
            organizationId = config.coreConfiguration.organizationId,
            developerName = config.coreConfiguration.developerName,
            conversationId = newId
          )

          uiConfiguration = UIConfiguration.create(coreConfig)
          uiClient = UIClient.createClient(context, uiConfiguration!!)
          true
        } ?: false
      } catch (e: Exception) {
        e.printStackTrace()
        false
      }
    }

    // Limpar o conversation ID (criar novo)
    Function("clearConversationId") {
      val newId = UUID.randomUUID().toString()
      conversationId = newId
      prefs.edit().putString("conversationId", newId).apply()

      // Reconfigurar se já existir uma configuração
      uiConfiguration?.let { config ->
        val coreConfig = CoreConfiguration.create(
          url = config.coreConfiguration.url,
          organizationId = config.coreConfiguration.organizationId,
          developerName = config.coreConfiguration.developerName,
          conversationId = newId
        )

        uiConfiguration = UIConfiguration.create(coreConfig)
        uiClient = UIClient.createClient(context, uiConfiguration!!)
      }

      newId
    }

    // Adicionar campos de pré-chat ocultos
    Function("setHiddenPreChatFields") { fields: Map<String, String> ->
      try {
        val config = uiConfiguration ?: return@Function false

        val hiddenFields = fields.map { (key, value) ->
          PreChatField(
            label = key,
            value = value,
            isHidden = true
          )
        }

        // Atualizar configuração com campos de pré-chat
        val coreConfig = config.coreConfiguration
        val newCoreConfig = CoreConfiguration.create(
          url = coreConfig.url,
          organizationId = coreConfig.organizationId,
          developerName = coreConfig.developerName,
          conversationId = coreConfig.conversationId,
          preChatFields = hiddenFields
        )

        uiConfiguration = UIConfiguration.create(newCoreConfig)
        uiClient = UIClient.createClient(context, uiConfiguration!!)

        true
      } catch (e: Exception) {
        e.printStackTrace()
        false
      }
    }

    // Registrar token de push notification
    Function("registerPushToken") { token: String ->
      try {
        true
      } catch (e: Exception) {
        e.printStackTrace()
        false
      }
    }

    // Eventos
    Events("onChatOpened", "onChatClosed", "onMessageReceived", "onError")
  }

  // Helper Methods
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
