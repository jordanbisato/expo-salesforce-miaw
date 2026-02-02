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
      print("configure config:", config)
      
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
        
        // ============================================
        // IMPLEMENTAÇÃO CORRETA BASEADA NO SDK
        // ============================================
        
        // O SDK usa o Interface com inicializador que aceita preChatFieldValueProvider
        // Passar closures diretamente para o construtor
        
        let chatView: ModalInterfaceViewController
        
        // Se temos campos de pré-chat visíveis OU ocultos, precisamos configurar
        if !self.preChatData.isEmpty || !self.hiddenPreChatData.isEmpty {
          
          // Criar CoreClient para configurar delegates
          let coreClient = CoreFactory.create(withConfig: config)
          
          // 1. Configurar HiddenPreChatDelegate se necessário
          if !self.hiddenPreChatData.isEmpty {
            let hiddenDelegate = HiddenPreChatDelegateImpl(hiddenData: self.hiddenPreChatData)
            coreClient.preChatDelegate = hiddenDelegate
            print("✅ HiddenPreChatDelegate configurado com \(self.hiddenPreChatData.count) campos")
          }
          
          // 2. Criar o chat view com provider de campos visíveis
          if !self.preChatData.isEmpty {
            // O provider é uma closure que modifica os campos
            chatView = ModalInterfaceViewController(
              config,
              preChatFieldValueProvider: { [weak self] preChatFields in
                guard let self = self else { return preChatFields }
                return try await self.modifyPreChatFields(preChatFields)
              }
            )
            print("✅ PreChatFieldValueProvider configurado com \(self.preChatData.count) campos")
          } else {
            chatView = ModalInterfaceViewController(config)
          }
        } else {
          // Sem campos de pré-chat
          chatView = ModalInterfaceViewController(config)
        }
        
        // Apresentar o chat
        rootViewController.present(chatView, animated: true) {
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
  
  // ============================================
  // MODIFICADOR DE PRÉ-CHAT FIELDS (VISÍVEIS)
  // ============================================
  
  /// Função que modifica os campos de pré-chat com os valores fornecidos
  private func modifyPreChatFields(_ preChatFields: [PreChatField]) async throws -> [PreChatField] {
    print("🔵 modifyPreChatFields chamado com \(preChatFields.count) campos")
    
    var modifiedFields = preChatFields
    
    for (index, field) in modifiedFields.enumerated() {
      let fieldName = field.name
      print("  → Campo: \(fieldName)")
      
      // Se temos um valor para este campo, popula e configura
      if let value = preChatData[fieldName] {
        modifiedFields[index].value = value
        
        // IMPORTANTE: Configurar se o campo é editável ou não
        // true = usuário pode editar o valor preenchido
        // false = campo fica bloqueado (read-only)
        modifiedFields[index].isEditable = false
        
        print("    ✅ Preenchido com: \(value) | isEditable: false")
      }
    }
    
    return modifiedFields
  }
  
  // ============================================
  // DELEGATE PARA HIDDEN PRE-CHAT FIELDS
  // ============================================
  
  /// Delegate para campos OCULTOS (Hidden PreChat Fields)
  /// Estes campos NÃO aparecem na interface, são enviados nos bastidores
  private class HiddenPreChatDelegateImpl: HiddenPreChatDelegate {
    private let hiddenData: [String: String]
    
    init(hiddenData: [String: String]) {
      self.hiddenData = hiddenData
    }
    
    func core(_ core: CoreClient!,
              conversation: Conversation!,
              didRequestPrechatValues hiddenPreChatFields: [HiddenPreChatField]!,
              completionHandler: HiddenPreChatValueCompletion!) {
      
      print("🟣 didRequestPrechatValues (hidden) chamado")
      
      guard var updatedFields = hiddenPreChatFields else {
        print("  ⚠️ Nenhum campo hidden recebido")
        // Retornar array vazio ao invés de dicionário
        completionHandler([])
        return
      }
      
      // Preencher cada campo hidden com o valor correspondente
      for (index, field) in updatedFields.enumerated() {
        let fieldName = field.name
        print("  → Campo hidden: \(fieldName)")
        
        if let value = hiddenData[fieldName] {
          updatedFields[index].value = value
          print("    ✅ Preenchido com: \(value)")
        }
      }
      
      // Retornar os campos atualizados para o SDK
      completionHandler(updatedFields)
    }
  }
}
