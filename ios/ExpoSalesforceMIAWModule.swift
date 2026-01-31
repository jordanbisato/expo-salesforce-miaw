import ExpoModulesCore
import SMIClientCore
import SMIClientUI
import UIKit

public class SalesForceMIAWModule: Module {
  // Propriedades de instância devem estar dentro da classe
  private var conversationId: UUID?
  private var uiConfiguration: UIConfiguration?
  private var preChatFields: [PreChatField] = []

  public func definition() -> ModuleDefinition {
    Name("ExpoSalesForceMIAW")

    OnCreate {
      self.conversationId = nil
      self.uiConfiguration = nil
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
        
    let configObj = UIConfiguration(
        serviceAPI: URL(string: urlString)!,
        organizationId: orgId,
        developerName: developerName,
        conversationId: convId
      )
    
      // Se vierem campos no JSON, nós os processamos e guardamos
        if let fieldsJson = config["preChatFields"] as? [String: String] {
            self.preChatData = fieldsJson
        }
      
      
      return true
    }
    
    Function("configureFromFile") { (fileName: String) -> Bool in
      guard let path = Bundle.main.path(forResource: fileName, ofType: "json"),
            let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let urlString = json["url"] as? String,
            let orgId = json["orgId"] as? String,
            let developerName = json["developerName"] as? String else {
        return false
      }
      
      let convId = self.getOrCreateConversationId()
      self.conversationId = convId
      
      self.uiConfiguration = UIConfiguration(
        serviceAPI: URL(string: urlString)!,
        organizationId: orgId,
        developerName: developerName,
        conversationId: convId
      )
      
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
        
          // 1. Criamos o contexto da conversa
          // No SDK 1.9.0+, campos ocultos são passados via ConversationContext
          let context = ConversationContext()
          
          for (key, value) in self.preChatData {
              // Adiciona cada campo como um dado customizado no contexto
              context.customAttributes[key] = value
          }
          
          // 2. Criamos o controlador com a configuração e o contexto
          // O ModalInterfaceViewController aceita a config.
          // Para injetar o contexto/campos, usamos o CoreClient antes do Push/Present
          let coreClient = CoreFactory.create(withConfig: config)
          
          // No MIAW iOS, setAttributes ou setConversationContext são os nomes comuns
          // Se coreClient.setPreChat falhou, usamos a injeção via cliente core:
          coreClient.setConversationContext(context)
          
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
    
      Function("setHiddenPreChatFields") { (fields: [String: String]) -> Bool in
        self.preChatData = fields
        return true
      }
    
    Function("registerPushToken") { (token: String) -> Bool in
      return true
    }
    
    Events("onChatOpened", "onChatClosed", "onMessageReceived", "onError")
  }

  // MARK: - Helper Methods (Agora dentro da classe)

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
    
    private func buildPreChatFields(from dict: [String: String]) -> [any PreChatField] {
        var fields: [any PreChatField] = []
        
        for (key, value) in dict {
          // CORREÇÃO: O SDK espera que você use o factory do SMIClientCore
          // para criar campos, ou use o inicializador público se disponível.
          // Caso HiddenPreChatField continue falhando, usamos esta abordagem:
          let field = PreChatFactory.createHiddenField(name: key, value: value)
          fields.append(field)
        }
        
        return fields
      }
}
