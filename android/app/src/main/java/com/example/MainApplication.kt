package com.example

import android.app.Application
import com.example.rn_socket_cam_custom.RNSocketCamCustomPackage
import com.facebook.react.BuildConfig
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.socketmobile.CaptureSdkTurboReactPackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: DefaultReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> {
                val packages: MutableList<ReactPackage> = PackageList(this).packages.toMutableList()
                packages.add(RNSocketCamCustomPackage())
                packages.add(CaptureSdkTurboReactPackage())
                return packages
            }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = true   // matches gradle.properties: newArchEnabled=true
            override val isHermesEnabled: Boolean = true    // matches gradle.properties: hermesEnabled=true
        }

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(applicationContext, reactNativeHost)
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, OpenSourceMergedSoMapping)
        DefaultNewArchitectureEntryPoint.load()
    }
}
