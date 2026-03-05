package com.example

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactApplication
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
    override fun getMainComponentName(): String = "example"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        // Guard against calling onWindowFocusChanged before the React context is ready
        // to avoid ReactNoCrashSoftException in New Architecture.
        val reactHost = (application as ReactApplication).reactHost
        if (reactHost?.currentReactContext != null) {
            super.onWindowFocusChanged(hasFocus)
        }
    }
}
