require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoSalesForceMIAW'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/jordanbisato/expo-salesforce-miaw' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'Messaging-InApp-UI', '~> 1.9.0'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
   'DEFINES_MODULE' => 'YES',
   'SWIFT_COMPILATION_MODE' => 'wholemodule',
   'OTHER_SWIFT_FLAGS' => '$(inherited) -D EXPO_MODULES_CORE_ARC_ENABLED'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  s.header_dir = 'ExpoSalesForceMIAW'
end
