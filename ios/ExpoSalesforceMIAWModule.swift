import ExpoModulesCore
import SMIClientCore
import SMIClientUI
import UIKit

public class ExpoSalesforceMIAWModule: Module {
  private var uiConfiguration: UIConfiguration?
  private var conversationId: String?
  
  public func definition() -> ModuleDefinition {
    Name("ExpoSalesforceMIAW")
    
    // Configurar o SDK com as credenciais do Salesforce
    Function("configure") { (config: [String: Any]) -> Bool in
      guard let url = config["url"] as? String,
            let orgId = config["orgId"] as? String,
            let developerName = config["developerName"] as? String else {
        return false
      }
      
      // Obter ou criar conversation ID
      let convId = config["conversationId"] as? String ?? self.getOrCreateConversationId()
      self.conversationId = convId
      
      // Criar configuração
      self.uiConfiguration = UIConfiguration(
        url: URL(string: url)!,
        organizationId: orgId,
        developerName: developerName,
        conversationId: convId
      )
      
      return true
    }
    
    // Configurar usando arquivo config.json
    Function("configureFromFile") { (fileName: String) -> Bool in
      guard let path = Bundle.main.path(forResource: fileName, ofType: "json"),
            let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let url = json["url"] as? String,
            let orgId = json["orgId"] as? String,
            let developerName = json["developerName"] as? String else {
        return false
      }
      
      let convId = self.getOrCreateConversationId()
      self.conversationId = convId
      
      self.uiConfiguration = UIConfiguration(
        url: URL(string: url)!,
        organizationId: orgId,
        developerName: developerName,
        conversationId: convId
      )
      
      return true
    }
    
    // Abrir a interface de chat
    AsyncFunction("openChat") { (promise: Promise) in
      DispatchQueue.main.async {
        guard let config = self.uiConfiguration else {
          promise.reject("ERR_NOT_CONFIGURED", "SDK not configured. Call configure() first.")
          return
        }
        
        guard let rootViewController = self.getRootViewController() else {
          promise.reject("ERR_NO_ROOT_VC", "Could not find root view controller.")
          return
        }
        
        // Criar e apresentar o view controller do chat
        let chatViewController = ModalInterfaceViewController(configuration: config)
        rootViewController.present(chatViewController, animated: true) {
          promise.resolve(true)
        }
      }
    }
    
    // Fechar a interface de chat
    AsyncFunction("closeChat") { (promise: Promise) in
      DispatchQueue.main.async {
        guard let rootViewController = self.getRootViewController() else {
          promise.reject("ERR_NO_ROOT_VC", "Could not find root view controller.")
          return
        }
        
        rootViewController.dismiss(animated: true) {
          promise.resolve(true)
        }
      }
    }
    
    // Obter o conversation ID atual
    Function("getConversationId") { () -> String? in
      return self.conversationId
    }
    
    // Definir um novo conversation ID
    Function("setConversationId") { (newId: String) -> Bool in
      self.conversationId = newId
      
      // Reconfigurar se já existir uma configuração
      if let config = self.uiConfiguration {
        self.uiConfiguration = UIConfiguration(
          url: config.url,
          organizationId: config.organizationId,
          developerName: config.developerName,
          conversationId: newId
        )
        return true
      }
      
      return false
    }
    
    // Limpar o conversation ID (criar novo)
    Function("clearConversationId") { () -> String in
      let newId = UUID().uuidString
      self.conversationId = newId
      UserDefaults.standard.set(newId, forKey: "ExpoSalesforceMIAW_ConversationId")
      
      // Reconfigurar se já existir uma configuração
      if let config = self.uiConfiguration {
        self.uiConfiguration = UIConfiguration(
          url: config.url,
          organizationId: config.organizationId,
          developerName: config.developerName,
          conversationId: newId
        )
      }
      
      return newId
    }
    
    // Adicionar campos de pré-chat ocultos
    Function("setHiddenPreChatFields") { (fields: [String: String]) -> Bool in
      guard var config = self.uiConfiguration else {
        return false
      }
      
      var hiddenFields: [PreChatField] = []
      for (key, value) in fields {
        hiddenFields.append(PreChatField(label: key, value: value, isHidden: true))
      }
      
      config.preChatFields = hiddenFields
      self.uiConfiguration = config
      
      // Esta implementação é um placeholder para a lógica de campos.
      return true
    }
    
    // Registrar token de push notification
    Function("registerPushToken") { (token: String) -> Bool in
      // Converter string do token para Data
      let tokenData = token.data(using: .utf8) ?? Data()
      
      // Registrar com o SDK (se disponível na versão do SDK)
      // NotificationManager.shared.registerDeviceToken(tokenData)
      
      return true
    }
    
    // Eventos
    Events("onChatOpened", "onChatClosed", "onMessageReceived", "onError")
  }
  
  // MARK: - Helper Methods
  
  private func getOrCreateConversationId() -> String {
    if let existingId = UserDefaults.standard.string(forKey: "ExpoSalesforceMIAW_ConversationId") {
      return existingId
    }
    
    let newId = UUID().uuidString
    UserDefaults.standard.set(newId, forKey: "ExpoSalesforceMIAW_ConversationId")
    return newId
  }
  
  private func getRootViewController() -> UIViewController? {
    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let window = windowScene.windows.first,
          let rootViewController = window.rootViewController else {
      return nil
    }
    
    var topController = rootViewController
    while let presentedViewController = topController.presentedViewController {
      topController = presentedViewController
    }
    
    return topController
  }
}
