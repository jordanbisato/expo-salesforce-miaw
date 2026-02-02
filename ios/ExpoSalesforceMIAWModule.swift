import ExpoModulesCore
import SMIClientCore
import SMIClientUI
import UIKit

public class SalesForceMIAWModule: Module {
  private var conversationId: UUID?
  private var uiConfiguration: UIConfiguration?
  
  // Armazenamento para campos de pré-chat
  private var preChatData: [String: String] = [:]
  private var hiddenPreChatData: [String: String] = [:]

  var preChatFieldValueProvider: (([PreChatField]) async throws -> [PreChatField])
  public init(_ config: UIConfiguration,
            preChatFieldValueProvider: ((_ preChatFields: [PreChatField]) async throws -> [PreChatField])? = nil)

  public func definition() -> ModuleDefinition {
    Name("ExpoSalesForceMIAW")

    OnCreate {
      self.conversationId = nil
      self.uiConfiguration = nil
      self.preChatData = [:]
      self.hiddenPreChatData = [:]
    }
    
    Function("configure") { (config: [String: Any]) -> Bool in
      guard let urlString = config["url"] as? String,
            let orgId = config["orgId"] as? String,
            let developerName = config["developerName"] as? String else {
        return false
      }
      
      let convId: UUID
      if let conversationIdString = config["conversationId"] as? String,
         let uuid = UUID(uuidString: conversationIdString) {
        convId = uuid
      } else {
        convId = self.getOrCreateConversationId()
      }
      self.conversationId = convId
        
      self.uiConfiguration = UIConfiguration(
        serviceAPI: URL(string: urlString)!,
        organizationId: orgId,
        developerName: developerName,
        conversationId: convId
      )
      
      // Processar campos de pré-chat se fornecidos no configure
      if let preChatFields = config["preChatFields"] as? [String: String] {
          print("configure preChatFields: ", preChatFields)
        self.preChatData = preChatFields
      }
      
      if let hiddenFields = config["hiddenPreChatFields"] as? [String: String] {
        print("configure hiddenFields: ", hiddenFields)
        self.hiddenPreChatData = hiddenFields
      }
        
      // Create an instance of the hidden pre-chat delegate
      let myPreChatDelegate = HiddenPrechatDelegateImplementation()

      // Create a core client from a config
      let coreClient = CoreFactory.create(withConfig: self.uiConfiguration)

      // Assign the hidden pre-chat delegate
      coreClient.preChatDelegate = myPreChatDelegate
      
      return true
    }
    
    Function("setPreChatFields") { (fields: [String: String]) -> Bool in
      self.preChatData = fields
      return true
    }
    
    Function("setHiddenPreChatFields") { (fields: [String: String]) -> Bool in
      self.hiddenPreChatData = fields
      return true
    }
    
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
        
        // Criar o CoreClient para registrar os provedores de campos
        let coreClient = CoreFactory.create(withConfig: config)
        
        // Registrar provedor para campos de pré-chat (visíveis)
        if !self.preChatData.isEmpty {
          coreClient.setPreChatDelegate(delegate: self, queue: DispatchQueue.main)
        }
        
        // Registrar provedor para campos ocultos
        if !self.hiddenPreChatData.isEmpty {
          coreClient.setHiddenPreChatDelegate(delegate: self, queue: DispatchQueue.main)
        }
        
        let chatViewController = ModalInterfaceViewController(config)
        rootViewController.present(chatViewController, animated: true) {
          promise.resolve(true)
        }
      }
    }
    
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
    
    Function("getConversationId") { () -> String? in
      return self.conversationId?.uuidString
    }
    
    Function("setConversationId") { (newIdString: String) -> Bool in
      guard let newId = UUID(uuidString: newIdString) else {
        return false
      }
      self.conversationId = newId
      
      if let config = self.uiConfiguration {
        self.uiConfiguration = UIConfiguration(
          serviceAPI: config.serviceAPI,
          organizationId: config.organizationId,
          developerName: config.developerName,
          conversationId: newId
        )
        return true
      }
      return false
    }
    
    Function("clearConversationId") { () -> String in
      let newId = UUID()
      self.conversationId = newId
      UserDefaults.standard.set(newId.uuidString, forKey: "ExpoSalesforceMIAW_ConversationId")
      
      if let config = self.uiConfiguration {
        self.uiConfiguration = UIConfiguration(
          serviceAPI: config.serviceAPI,
          organizationId: config.organizationId,
          developerName: config.developerName,
          conversationId: newId
        )
      }
      return newId.uuidString
    }
    
    Function("registerPushToken") { (token: String) -> Bool in
      // Implementação de registro de token se necessário
      return true
    }
    
    Events("onChatOpened", "onChatClosed", "onMessageReceived", "onError")
  }

  // MARK: - Helper Methods

  private func getOrCreateConversationId() -> UUID {
    let key = "ExpoSalesforceMIAW_ConversationId"
    if let existingIdString = UserDefaults.standard.string(forKey: key),
       let existingUUID = UUID(uuidString: existingIdString) {
      return existingUUID
    }
    let newUUID = UUID()
    UserDefaults.standard.set(newUUID.uuidString, forKey: key)
    return newUUID
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
    
   // Create a function to modify the pre-chat fields
   private func setPreChatValues(prechatKeyValuePairs: [String: String]) -> (([PreChatField]) async throws -> [PreChatField]) { { prechatFields in
            prechatFields.enumerated().forEach { (index, value) in
                let currenPrechatName = value.name
                print("setPreChatValues prechatField: ", value)

                for prechatKeyValuePair in prechatKeyValuePairs {
                    print("setPreChatValues prechatKeyValuePair: ", prechatKeyValuePair)
                    if currenPrechatName == prechatKeyValuePair.key {
                        prechatFields[index].value = prechatKeyValuePair.value
                        prechatFields[index].isEditable = false
                    }
                }
            }
       
            return prechatFields
        }
    }
    
    private class HiddenPrechatDelegateImplementation: HiddenPreChatDelegate {

      func core(_ core: CoreClient!,
                conversation: Conversation!,
                didRequestPrechatValues hiddenPreChatFields: [HiddenPreChatField]!,
                completionHandler: HiddenPreChatValueCompletion!) {

        // Use the conversation object to inspect info about the conversation
          
        var updatedFields = hiddenPreChatFields
        for (index, field) in updatedFields.enumerated() {
          if let value = self.hiddenPreChatData[field.name] {
              updatedFields[index].value = value
              updatedFields[index].isHidden = true
          }
        }

        // Pass pre-chat fields back to SDK
        completionHandler(updatedFields)
      }
    }
}
