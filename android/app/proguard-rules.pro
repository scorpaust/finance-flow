# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ── Upgrade 02 (R8) ─────────────────────────────────────────────────────────
# O Capacitor já mantém as classes @CapacitorPlugin e os métodos @PluginMethod
# (regras dentro do próprio Capacitor). Reforço explícito para os plugins
# desta app — o PlayBillingPlugin é chamado por reflexão a partir da web; se
# uma regra das bibliotecas mudar, a compra pela Google Play não pode partir.
-keep class com.dinismcosta.financeflow.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }

# Números de linha nos erros (Play Console / Sentry), sem o nome do ficheiro.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
