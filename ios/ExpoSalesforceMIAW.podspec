require 'json'

package = JSON.parse(File.read(File.join(__dir__, '../package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoSalesforceMIAW'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platform       = :ios, '15.1'
  s.swift_version  = '5.4'
  s.source         = { git: 'https://github.com/yourusername/expo-salesforce-miaw' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  
  # Usando uma versão flexível (qualquer versão 246 ou superior, mas abaixo de 247)
  # Ou simplesmente remova a versão para pegar a mais recente disponível no Specs Repo
  s.dependency 'Messaging-InApp-UI'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
