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

# 1.2.1 — a câmara fechava a app na 1.2.0: a biblioteca da Ionic usada pelo
# @capacitor/camera (io.ionic.libs.ioncameralib) passa os parâmetros entre
# ecrãs por serialização (Gson), que depende dos nomes das classes e campos —
# o R8 tinha-os renomeado (IONCAMRCameraParameters → g4.a). Os plugins nativos
# e as bibliotecas que trazem ficam intactos; o R8 continua a otimizar o resto.
-keep class io.ionic.libs.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keep class ee.forgr.biometric.** { *; }
-keep class com.google.gson.** { *; }
-keepattributes Signature,*Annotation*,EnclosingMethod,InnerClasses

# 1.2.1 (2.ª causa, vista no telemóvel por logcat): o R8 em modo completo
# apaga as anotações cujo TIPO não é mantido. O Capacitor lê em runtime
# @CapacitorPlugin(permissions = [@Permission(...)]) para saber as
# permissões de cada plugin; sem as anotações, getPermissionState() devolvia
# null e a câmara rebentava ("getPermissionState(...) must not be null").
-keep class com.getcapacitor.** { *; }
-keep @interface com.getcapacitor.annotation.** { *; }
-keepattributes RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations,AnnotationDefault
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Números de linha nos erros (Play Console / Sentry), sem o nome do ficheiro.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
